/**
 * NeuralMind CHAT2 — Notes Generator & PDF Export Service
 */

import { callGroqApi, PRIMARY_MODEL } from './groqClient'

const SYSTEM_PROMPT = `You are an expert ML educator creating comprehensive study notes.
Generate structured, thorough Markdown study notes about the given ML topic.

Notes must include:
## 📌 Overview
Brief definition and context

## 🎯 Key Concepts
Bullet list of core concepts with short explanations

## 🧮 Mathematical Foundation (if requested)
Key formulas in LaTeX format ($...$ for inline, $$...$$ for display equations)
Explain each variable

## 💻 Code Example (if requested)
Working Python code demonstrating the concept
Use sklearn, numpy, or PyTorch as appropriate

## 🌍 Real-World Applications
3-5 practical use cases with industry examples

## ⚠️ Common Pitfalls
What beginners get wrong

## 🔗 Related Concepts
Brief list of related ML topics to explore next

## ❓ Quiz (if requested)
3-5 multiple choice or short answer questions to test understanding
Include answers in a collapsible section using > tags

Rules:
- Use emojis for visual scanning
- Keep explanations precise but accessible
- Use tables for comparisons
- Bold key terms on first mention`

export async function generateNotes(topic, options = { math: true, code: true, quiz: false }) {
  const optionStr = [
    options.math ? 'Include all mathematical formulas and derivations.' : 'Skip mathematical formulas.',
    options.code ? 'Include Python code examples.' : 'Skip code examples.',
    options.quiz ? 'Include a quiz section with answers.' : 'Skip the quiz section.'
  ].join(' ')

  return await callGroqApi({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate comprehensive study notes for: "${topic}"\n\n${optionStr}` }
    ],
    temperature: 0.5,
    max_tokens: 2500,
    model: PRIMARY_MODEL
  })
}

export function downloadNotesPdf(topic, htmlContent) {
  window.print()
}
