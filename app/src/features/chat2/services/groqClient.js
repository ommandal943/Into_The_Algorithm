/**
 * Groq API Central Service & Resilient Client
 * Handles authentication, model configuration, fallback models,
 * safe retries (no retries on 401), streaming, and error handling.
 */

export const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
export const FALLBACK_MODEL = 'llama-3.1-8b-instant'
export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Safely resolves the Groq API key from environment variables.
 * Returns null if missing or placeholder.
 */
export function getGroqApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API_KEY || ''
  const trimmed = key.trim()

  if (!trimmed || trimmed === 'gsk_your_groq_api_key_here' || trimmed.startsWith('gsk_your_')) {
    return null
  }
  return trimmed
}

/**
 * Validates whether a usable API key is configured.
 */
export function isGroqKeyConfigured() {
  return getGroqApiKey() !== null
}

/**
 * Execute non-streaming Groq API request with fallback models and retry logic.
 */
export async function callGroqApi({ messages, temperature = 0.7, max_tokens = 1500, model = PRIMARY_MODEL }) {
  const apiKey = getGroqApiKey()

  if (!apiKey) {
    throw new Error('Groq API Error (401): Invalid API Key. Please configure a valid VITE_GROQ_API_KEY or GROQ_API_KEY in your .env file.')
  }

  const modelsToTry = [model, PRIMARY_MODEL, FALLBACK_MODEL].filter((m, i, self) => self.indexOf(m) === i)
  let lastError = null

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx]
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts) {
      attempts++
      try {
        const res = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: currentModel,
            messages,
            temperature,
            max_tokens
          })
        })

        if (res.status === 401) {
          throw new Error('Groq API Error (401): Invalid API Key. Please verify your Groq API Key in your environment configuration.')
        }

        if (res.status === 404 || res.status === 400) {
          const errText = await res.text()
          if (errText.includes('model') || errText.includes('not_found')) {
            // Model error, break to try fallback model
            lastError = new Error(`Groq Model Error (${res.status}): Model ${currentModel} unavailable.`)
            break
          }
          throw new Error(`Groq API Error (${res.status}): ${errText}`)
        }

        if (!res.ok) {
          const errText = await res.text()
          if ((res.status === 429 || res.status >= 500) && attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000 * attempts))
            continue
          }
          throw new Error(`Groq API Error (${res.status}): ${errText}`)
        }

        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content !== undefined && content !== null) {
          return content
        }
        throw new Error('Groq API returned empty response content.')
      } catch (err) {
        lastError = err
        // Do not retry 401 or 400 errors
        if (err.message.includes('401') || err.message.includes('400')) {
          throw err
        }
        if (attempts >= maxAttempts && mIdx === modelsToTry.length - 1) {
          throw err
        }
      }
    }
  }

  throw lastError || new Error('Groq API request failed.')
}

/**
 * Execute streaming Groq API request with SSE chunk callbacks.
 */
export async function streamGroqApi({ messages, temperature = 0.7, max_tokens = 2048, model = PRIMARY_MODEL, onChunk, onDone }) {
  const apiKey = getGroqApiKey()

  if (!apiKey) {
    const err = new Error('Groq API Error (401): Invalid API Key. Please configure a valid VITE_GROQ_API_KEY or GROQ_API_KEY in your .env file.')
    if (onChunk) onChunk(`⚠️ ${err.message}`, `⚠️ ${err.message}`)
    if (onDone) onDone(`⚠️ ${err.message}`)
    throw err
  }

  const modelsToTry = [model, PRIMARY_MODEL, FALLBACK_MODEL].filter((m, i, self) => self.indexOf(m) === i)
  let lastError = null

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx]
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature,
          max_tokens,
          stream: true,
          top_p: 0.9
        })
      })

      if (res.status === 401) {
        throw new Error('Groq API Error (401): Invalid API Key. Please verify your Groq API Key in your environment configuration.')
      }

      if (res.status === 404 || res.status === 400) {
        const errText = await res.text()
        if (errText.includes('model') || errText.includes('not_found')) {
          lastError = new Error(`Groq Model Error (${res.status}): Model ${currentModel} unavailable.`)
          continue
        }
        throw new Error(`Groq API Error (${res.status}): ${errText}`)
      }

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Groq API Error (${res.status}): ${errText}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim().startsWith('data: '))

        for (const line of lines) {
          const dataStr = line.replace(/^data:\s*/, '').trim()
          if (dataStr === '[DONE]') continue
          try {
            const parsed = JSON.parse(dataStr)
            const delta = parsed.choices?.[0]?.delta?.content || ''
            if (delta) {
              fullText += delta
              if (onChunk) onChunk(delta, fullText)
            }
          } catch {
            /* skip malformed JSON chunk */
          }
        }
      }

      if (onDone) onDone(fullText)
      return fullText
    } catch (err) {
      lastError = err
      if (err.message.includes('401')) {
        throw err
      }
    }
  }

  throw lastError || new Error('Groq streaming request failed.')
}
