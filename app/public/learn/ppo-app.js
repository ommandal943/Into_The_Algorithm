/* ════════════════════════════════════════════════════════════
   Proximal Policy Optimization (PPO) — Interactive Application
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '\\(', right: '\\)', display: false}
            ]
        });
    }

    initNavbar();
    initScrollAnimations();
    initHeroAnimation();
    initSampleDatasetSection();
    initPPOLab();
    initCodeExplainer();
});

/* ── Navbar & Scroll Behavior ────────────────────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= (section.offsetTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.glass-card, .section-header, .metrics-dashboard, .charts-grid').forEach(el => {
        el.classList.add('animate-in');
        observer.observe(el);
    });
}

/* ── Hero Canvas PPO LunarLander Animation ───────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    let landerX = w / 2;
    let landerY = 60;
    let vy = 1.2;

    function animate() {
        ctx.clearRect(0, 0, w, h);

        landerY += vy;
        if (landerY > h * 0.72) {
            landerY = 60;
            vy = 1.2;
        }

        // Draw Landing Pad
        ctx.fillStyle = '#34d399';
        ctx.fillRect(w / 2 - 40, h * 0.75, 80, 8);

        // Draw Lander Body
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(landerX, landerY - 15);
        ctx.lineTo(landerX - 15, landerY + 10);
        ctx.lineTo(landerX + 15, landerY + 10);
        ctx.closePath();
        ctx.fill();

        // Draw Thruster Flame
        if (Math.random() > 0.3) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(landerX - 8, landerY + 10);
            ctx.lineTo(landerX + 8, landerY + 10);
            ctx.lineTo(landerX, landerY + 25);
            ctx.closePath();
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }
    animate();
}

/* ═════════════════════════════════════════════════════════
   SECTION 3: SAMPLE DATASETS CONTROLLER
   ═════════════════════════════════════════════════════════ */
function initSampleDatasetSection() {
    const sampleSelect = document.getElementById('sampleDatasetSelect');
    const trainSampleBtn = document.getElementById('trainSampleBtn');
    const sampleTableBody = document.querySelector('#sampleTable tbody');
    const sampleMetrics = document.getElementById('sampleMetrics');
    const sampleCharts = document.getElementById('sampleCharts');

    if (!sampleSelect || !trainSampleBtn) return;

    let chartScatter = null;
    let chartConvergence = null;

    const sampleTableData = [
        { obs: '[0.01, 0.45, -0.02]', logProb: -0.42, advantage: +2.15, ratio: 1.05 },
        { obs: '[0.02, 0.30, -0.01]', logProb: -0.38, advantage: +1.80, ratio: 1.02 },
        { obs: '[0.05, 0.10, +0.01]', logProb: -0.25, advantage: +3.40, ratio: 1.18 }
    ];

    function loadSampleTable() {
        sampleTableBody.innerHTML = '';
        sampleTableData.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${row.obs}</td><td>${row.logProb}</td><td><span style="color:#34d399; font-weight:700;">+${row.advantage}</span></td><td>${row.ratio}</td>`;
            sampleTableBody.appendChild(tr);
        });
    }

    function trainSampleModel() {
        document.getElementById('sampleMetricEntropy').textContent = '0.45';
        document.getElementById('sampleMetricClipRatio').textContent = '4.2%';
        document.getElementById('sampleMetricValLoss').textContent = '0.024';
        document.getElementById('sampleMetricMeanReturn').textContent = '245.8';

        sampleMetrics.style.display = 'grid';
        sampleCharts.style.display = 'grid';

        const ctxScatter = document.getElementById('sampleScatterChart');
        if (ctxScatter && window.Chart) {
            if (chartScatter) chartScatter.destroy();
            chartScatter = new Chart(ctxScatter, {
                type: 'line',
                data: {
                    labels: [10, 20, 30, 40, 50],
                    datasets: [{
                        label: 'PPO Mean Return',
                        data: [-120, -10, 85, 190, 245],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        const ctxConv = document.getElementById('sampleConvergenceChart');
        if (ctxConv && window.Chart) {
            if (chartConvergence) chartConvergence.destroy();
            chartConvergence = new Chart(ctxConv, {
                type: 'line',
                data: {
                    labels: [10, 20, 30, 40, 50],
                    datasets: [{
                        label: 'Policy Clip Loss',
                        data: [-0.045, -0.038, -0.028, -0.015, -0.008],
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }
    }

    sampleSelect.addEventListener('change', loadSampleTable);
    trainSampleBtn.addEventListener('click', trainSampleModel);
    loadSampleTable();
}

/* ═════════════════════════════════════════════════════════
   SECTION 2: LUNARLANDER PPO PLAYGROUND
   ═════════════════════════════════════════════════════════ */
function initPPOLab() {
    const canvas = document.getElementById('ppoCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let landerX = canvas.width / 2;
    let landerY = 70;
    let vx = 0, vy = 1.0;

    let updateCount = 0;
    let scoreHistory = [];
    let clipHistory = [];

    const sliderEps = document.getElementById('sliderEps');
    const valEps = document.getElementById('valEps');
    const sliderLambda = document.getElementById('sliderLambda');
    const valLambda = document.getElementById('valLambda');
    const sliderEpochs = document.getElementById('sliderEpochs');
    const valEpochs = document.getElementById('valEpochs');

    const btnStepEpisode = document.getElementById('btnStepEpisode');
    const btnTrainFast = document.getElementById('btnTrainFast');
    const btnResetPPO = document.getElementById('btnResetPPO');

    let chartScore = null;
    let chartClip = null;

    function renderCanvas() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Draw terrain
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.85);
        ctx.lineTo(w * 0.35, h * 0.85);
        ctx.lineTo(w * 0.45, h * 0.78);
        ctx.lineTo(w * 0.55, h * 0.78);
        ctx.lineTo(w * 0.65, h * 0.85);
        ctx.lineTo(w, h * 0.85);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();

        // Draw Landing Pad Flags
        ctx.fillStyle = '#34d399';
        ctx.fillRect(w * 0.45, h * 0.78 - 3, 60, 4);

        // Draw Lander
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(landerX, landerY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();

        updateMetricsAndCharts();
    }

    function stepPPO() {
        updateCount++;
        const epsClip = parseFloat(sliderEps?.value || '0.2');
        const gaeLambda = parseFloat(sliderLambda?.value || '0.95');
        const ppoEpochs = parseInt(sliderEpochs?.value || '10');

        // Continuous LunarLander PPO updates with clipped surrogate objective
        const rawAdvantage = (Math.random() - 0.2) * 5.0 * gaeLambda;
        const ratio = 1.0 + (Math.random() - 0.5) * 0.4;
        const clippedRatio = Math.min(Math.max(ratio, 1.0 - epsClip), 1.0 + epsClip);
        const policyLoss = -Math.min(ratio * rawAdvantage, clippedRatio * rawAdvantage);

        const score = Math.min(280, Math.round(-100 + updateCount * 12 * (1 + (ppoEpochs / 20)) + (Math.random() - 0.4) * 15));
        const clipFrac = (Math.max(0.5, (15.0 * epsClip) * Math.exp(-updateCount / (8 + ppoEpochs * 0.5)))).toFixed(1);

        scoreHistory.push(score);
        clipHistory.push(clipFrac);

        // Continuous thruster positioning
        landerX = canvas.width * 0.45 + 30 + (Math.random() - 0.5) * 12;
        landerY = canvas.height * 0.78 - 14;

        renderCanvas();
    }

    function updateMetricsAndCharts() {
        document.getElementById('metricUpdates').textContent = updateCount;
        document.getElementById('metricScore').textContent = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1] : '0';
        document.getElementById('metricClipFrac').textContent = clipHistory.length > 0 ? `${clipHistory[clipHistory.length - 1]}%` : '0.0%';
        document.getElementById('metricLoss').textContent = '-0.015';

        if (!window.Chart) return;

        const ctxS = document.getElementById('chartScore');
        if (ctxS) {
            if (chartScore) chartScore.destroy();
            chartScore = new Chart(ctxS, {
                type: 'line',
                data: {
                    labels: scoreHistory.map((_, i) => `Up ${i + 1}`),
                    datasets: [{
                        label: 'Lander Score',
                        data: scoreHistory,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        const ctxC = document.getElementById('chartClip');
        if (ctxC) {
            if (chartClip) chartClip.destroy();
            chartClip = new Chart(ctxC, {
                type: 'line',
                data: {
                    labels: clipHistory.map((_, i) => `Up ${i + 1}`),
                    datasets: [{
                        label: 'Clipped Ratio %',
                        data: clipHistory,
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.15)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }
    }

    sliderEps.addEventListener('input', () => { valEps.textContent = sliderEps.value; });
    sliderLambda.addEventListener('input', () => { valLambda.textContent = sliderLambda.value; });
    sliderEpochs.addEventListener('input', () => { valEpochs.textContent = sliderEpochs.value; });

    btnStepEpisode.addEventListener('click', stepPPO);
    btnTrainFast.addEventListener('click', () => { for (let i = 0; i < 30; i++) stepPPO(); });
    btnResetPPO.addEventListener('click', () => {
        updateCount = 0; scoreHistory = []; clipHistory = [];
        landerX = canvas.width / 2; landerY = 70;
        renderCanvas();
    });

    renderCanvas();
}

/* ═════════════════════════════════════════════════════════
   SECTION 6: INTERACTIVE LINE-BY-LINE CODE EXPLAINER
   ═════════════════════════════════════════════════════════ */
function initCodeExplainer() {
    const codeBlock = document.getElementById('codeBlockInteractive');
    const badge = document.getElementById('explainLineBadge');
    const title = document.getElementById('explainTitle');
    const body = document.getElementById('explainBody');
    const mathBox = document.getElementById('explainMathBox');
    const copyBtn = document.getElementById('btnCopyCode');
    const unlockBtn = document.getElementById('btnUnlockLine');
    const stepBtns = document.querySelectorAll('.code-tab-btn');

    if (!codeBlock) return;

    let selectedLine = 4;
    let isLocked = false;

    const CODE_LINES = [
        { num: 1, text: 'import torch', html: '<span class="code-keyword">import</span> torch' },
        { num: 2, text: 'import torch.nn as nn', html: '<span class="code-keyword">import</span> torch.nn <span class="code-keyword">as</span> nn' },
        { num: 3, text: 'class ActorCritic(nn.Module):', html: '<span class="code-keyword">class</span> <span class="code-func">ActorCritic</span>(nn.Module):' },
        { num: 4, text: '    def __init__(self, state_dim, action_dim):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, state_dim, action_dim):' },
        { num: 5, text: '        self.actor = nn.Sequential(nn.Linear(state_dim, 64), nn.Tanh(), nn.Linear(64, action_dim), nn.Softmax(dim=-1))', html: '        self.actor = nn.Sequential(nn.Linear(state_dim, <span class="code-num">64</span>), nn.Tanh(), nn.Linear(<span class="code-num">64</span>, action_dim), nn.Softmax(dim=-<span class="code-num">1</span>))' },
        { num: 6, text: '        self.critic = nn.Sequential(nn.Linear(state_dim, 64), nn.Tanh(), nn.Linear(64, 1))', html: '        self.critic = nn.Sequential(nn.Linear(state_dim, <span class="code-num">64</span>), nn.Tanh(), nn.Linear(<span class="code-num">64</span>, <span class="code-num">1</span>))' },
        { num: 7, text: '    def evaluate(self, state, action): return self.actor(state), self.critic(state)', html: '    <span class="code-keyword">def</span> <span class="code-func">evaluate</span>(self, state, action): <span class="code-keyword">return</span> self.actor(state), self.critic(state)' },
        { num: 8, text: 'def compute_gae(rewards, values, next_value, gamma=0.99, lam=0.95):', html: '<span class="code-keyword">def</span> <span class="code-func">compute_gae</span>(rewards, values, next_value, gamma=<span class="code-num">0.99</span>, lam=<span class="code-num">0.95</span>):' },
        { num: 9, text: '    advantages = np.zeros_like(rewards)', html: '    advantages = np.zeros_like(rewards)' },
        { num: 10, text: '    gae = 0', html: '    gae = <span class="code-num">0</span>' },
        { num: 11, text: '    for t in reversed(range(len(rewards))):', html: '    <span class="code-keyword">for</span> t <span class="code-keyword">in</span> reversed(range(len(rewards))):' },
        { num: 12, text: '        delta = rewards[t] + gamma * next_value - values[t]', html: '        delta = rewards[t] + gamma * next_value - values[t]' },
        { num: 13, text: '        gae = delta + gamma * lam * gae', html: '        gae = delta + gamma * lam * gae' },
        { num: 14, text: '        advantages[t] = gae; next_value = values[t]', html: '        advantages[t] = gae; next_value = values[t]' },
        { num: 15, text: 'def ppo_update(policy, states, actions, old_log_probs, returns, advantages, eps=0.2):', html: '<span class="code-keyword">def</span> <span class="code-func">ppo_update</span>(policy, states, actions, old_log_probs, returns, advantages, eps=<span class="code-num">0.2</span>):' },
        { num: 16, text: '    ratios = torch.exp(new_log_probs - old_log_probs)', html: '    ratios = torch.exp(new_log_probs - old_log_probs)' },
        { num: 17, text: '    surr1 = ratios * advantages', html: '    surr1 = ratios * advantages' },
        { num: 18, text: '    surr2 = torch.clamp(ratios, 1.0 - eps, 1.0 + eps) * advantages', html: '    surr2 = torch.clamp(ratios, <span class="code-num">1.0</span> - eps, <span class="code-num">1.0</span> + eps) * advantages' },
        { num: 19, text: '    policy_loss = -torch.min(surr1, surr2).mean()', html: '    policy_loss = -torch.min(surr1, surr2).mean()' },
        { num: 20, text: '    value_loss = nn.MSELoss()(critic_values, returns)', html: '    value_loss = nn.MSELoss()(critic_values, returns)' },
        { num: 21, text: '    total_loss = policy_loss + 0.5 * value_loss', html: '    total_loss = policy_loss + <span class="code-num">0.5</span> * value_loss' },
        { num: 22, text: '    optimizer.zero_grad(); total_loss.backward(); optimizer.step()', html: '    optimizer.zero_grad(); total_loss.backward(); optimizer.step()' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import PyTorch Deep Learning Library", text: "Imports PyTorch for neural network policy and value estimation.", math: "\\text{import torch}" },
        2: { title: "Import Neural Network Module", text: "Imports PyTorch neural network abstractions.", math: "\\text{import torch.nn as nn}" },
        3: { title: "Actor-Critic Dual Neural Network", text: "Houses both Actor (policy pi) and Critic (state value V) networks.", math: "\\pi_\\theta(a \\mid s), \\quad V_1(s)" },
        4: { title: "Constructor Setup", text: "Initializes input feature dimensions and discrete/continuous action count.", math: "\\text{state\\_dim}, \\quad \\text{action\\_dim}" },
        5: { title: "Actor Policy Network Branch", text: "Predicts action distribution probabilities pi_theta(a|s).", math: "\\pi_\\theta(a \\mid s) = \\text{Softmax}(\\text{Linear}(s))" },
        6: { title: "Critic State-Value Network Branch", text: "Predicts expected cumulative baseline return V_phi(s).", math: "V_\\phi(s) = \\text{Linear}(s)" },
        7: { title: "Joint Evaluation Method", text: "Evaluates action probabilities and state baseline values simultaneously.", math: "\\text{evaluate}(s, a)" },
        8: { title: "Generalized Advantage Estimation (GAE)", text: "Computes exponential decay advantage scores over trajectory samples.", math: "\\hat{A}_t^{\\text{GAE}(\\gamma, \\lambda)}" },
        9: { title: "Initialize Advantage Buffer", text: "Allocates NumPy zero array matching trajectory length.", math: "\\mathbf{A} \\in \\mathbb{R}^T" },
        10: { title: "Initialize GAE Accumulator", text: "Sets recursive accumulator gae = 0.", math: "\\text{gae} = 0" },
        11: { title: "Reverse Trajectory Loop", text: "Iterates backward from t = T-1 down to t = 0 to propagate future advantage rewards.", math: "t = T-1, T-2, \\dots, 0" },
        12: { title: "Compute Single-Step TD Error Delta", text: "Calculates temporal difference residual error delta = R + gamma * V(s') - V(s).", math: "\\delta_t = R_t + \\gamma V(S_{t+1}) - V(S_t)" },
        13: { title: "Accumulate Exponential Decay GAE", text: "Updates GAE recursive sum gae = delta + gamma * lambda * gae.", math: "\\text{gae} := \\delta_t + (\\gamma \\lambda) \\text{gae}" },
        14: { title: "Store Step Advantage", text: "Saves computed advantage score for step t.", math: "\\hat{A}_t = \\text{gae}" },
        15: { title: "PPO Update Method", text: "Runs Clipped Surrogate Objective updates across trajectory mini-batches.", math: "L^{\\text{CLIP}}(\\theta)" },
        16: { title: "Compute Probability Ratio r_t", text: "Calculates policy ratio r_t = exp(log pi_new - log pi_old).", math: "r_t(\\theta) = \\frac{\\pi_\\theta(a_t \\mid s_t)}{\\pi_{\\theta_{\\text{old}}}(a_t \\mid s_t)}" },
        17: { title: "Unclipped Surrogate Objective (Surr1)", text: "Evaluates standard policy gradient surrogate r_t * A_t.", math: "\\text{surr}_1 = r_t(\\theta) \\hat{A}_t" },
        18: { title: "Clipped Surrogate Objective (Surr2)", text: "Clips probability ratio r_t to [1 - eps, 1 + eps] before multiplying by A_t.", math: "\\text{surr}_2 = \\text{clip}(r_t, 1-\\epsilon, 1+\\epsilon) \\hat{A}_t" },
        19: { title: "Compute Clipped Policy Loss", text: "Takes negative mean of elementwise minimum min(surr1, surr2).", math: "L^{\\text{CLIP}}(\\theta) = -\\hat{\\mathbb{E}}_t [ \\min(\\text{surr}_1, \\text{surr}_2) ]" },
        20: { title: "Compute Critic MSE Loss", text: "Evaluates MSE loss between Critic V(s) predictions and empirical returns.", math: "L^{\\text{VF}}(\\theta) = \\text{MSE}(V(s), \\text{returns})" },
        21: { title: "Combine Total Loss Function", text: "Combines Policy Loss and Critic Value Loss with weighting factor c_1 = 0.5.", math: "L^{\\text{PPO}} = L^{\\text{CLIP}} + 0.5 L^{\\text{VF}}" },
        22: { title: "Backpropagate & SGD Step", text: "Clears gradients, backpropagates total loss, and updates Actor-Critic weights.", math: "\\theta \\leftarrow \\theta - \\eta \\nabla_\\theta L^{\\text{PPO}}" }
    };

    codeBlock.innerHTML = '';
    CODE_LINES.forEach(lineObj => {
        const div = document.createElement('div');
        div.className = 'code-line';
        div.setAttribute('data-line', lineObj.num);
        div.innerHTML = `<span class="line-num">${lineObj.num}</span><span class="line-content">${lineObj.html}</span>`;
        codeBlock.appendChild(div);
    });

    const lineElements = codeBlock.querySelectorAll('.code-line');

    function updateLineUI(targetLine, toggleLock = false) {
        if (toggleLock) {
            if (isLocked && selectedLine === targetLine) isLocked = false;
            else { isLocked = true; selectedLine = targetLine; }
        } else {
            if (isLocked) return;
            selectedLine = targetLine;
        }

        lineElements.forEach(el => {
            const lNum = parseInt(el.getAttribute('data-line'));
            if (lNum === selectedLine) {
                el.classList.add('active');
                if (isLocked) el.classList.add('locked');
                else el.classList.remove('locked');
            } else {
                el.classList.remove('active', 'locked');
            }
        });

        if (unlockBtn) unlockBtn.style.display = isLocked ? 'inline-block' : 'none';

        const info = CODE_EXPLANATIONS[selectedLine];
        const panel = document.getElementById('codeExplainPanel');
        if (info && panel) {
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#10b981; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(16,185,129,0.15)'}; color:${isLocked ? '#f472b6' : '#10b981'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(16,185,129,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#10b981; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>🔍</span> <span>What This Line Does:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.text}
                    </p>
                </div>

                <div style="margin-bottom:1rem;">
                    <div style="font-weight:700; color:#fbbf24; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>⚡</span> <span>Why It Is Used:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.why || 'Restricts policy update step size to ensure smooth, monotonic policy improvements.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#10b981;">
                        $$${info.math}$$
                    </div>
                </div>` : ''}
            `;
            if (window.renderMathInElement) {
                renderMathInElement(panel, { delimiters: [{left: '$$', right: '$$', display: true}] });
            }
        }
    }

    lineElements.forEach(el => {
        el.addEventListener('mouseenter', () => updateLineUI(parseInt(el.getAttribute('data-line')), false));
        el.addEventListener('mouseleave', () => { if (isLocked) updateLineUI(selectedLine, false); });
        el.addEventListener('click', () => updateLineUI(parseInt(el.getAttribute('data-line')), true));
    });

    if (unlockBtn) unlockBtn.addEventListener('click', () => { isLocked = false; updateLineUI(selectedLine, false); });

    stepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            stepBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const step = btn.getAttribute('data-step');
            let targetLine = 4;
            if (step === 'step1') targetLine = 4;
            else if (step === 'step2') targetLine = 8;
            else if (step === 'step3') targetLine = 15;
            else if (step === 'step4') targetLine = 22;

            isLocked = true;
            updateLineUI(targetLine, false);
            lineElements.forEach(el => {
                if (parseInt(el.getAttribute('data-line')) === targetLine) el.classList.add('locked');
            });
        });
    });

    updateLineUI(4, false);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const fullText = CODE_LINES.map(l => l.text).join('\n');
            navigator.clipboard.writeText(fullText).then(() => {
                copyBtn.textContent = '✅ Copied!';
                setTimeout(() => { copyBtn.textContent = '📋 Copy Code'; }, 2000);
            });
        });
    }
}
