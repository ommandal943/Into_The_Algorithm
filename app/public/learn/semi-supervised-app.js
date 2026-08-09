/* ════════════════════════════════════════════════════════════
   Self-Training & Pseudo-Labeling Application
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

    initHeroCanvas();
    initCodeExplainer();
    initSampleSection();
    initPlayground();
});

/* ── Hero Canvas Animation ────────────────────────────── */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const nodes = [];
    for (let i = 0; i < 45; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            status: i < 5 ? 'labeled0' : (i < 10 ? 'labeled1' : 'unlabeled'),
            confidence: i < 10 ? 1.0 : Math.random() * 0.7
        });
    }

    let t = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        t += 0.02;

        // Draw propagation pulses
        nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 10 || n.x > canvas.width - 10) n.vx *= -1;
            if (n.y < 10 || n.y > canvas.height - 10) n.vy *= -1;

            if (n.status === 'unlabeled' && Math.sin(t + n.x) > 0.95) {
                n.confidence = Math.min(1.0, n.confidence + 0.1);
                if (n.confidence > 0.85) {
                    n.status = Math.random() > 0.5 ? 'pseudo0' : 'pseudo1';
                }
            }
        });

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 80) {
                    ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist / 80 * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.status.startsWith('labeled') ? 7 : 5, 0, Math.PI * 2);
            if (n.status === 'labeled0') ctx.fillStyle = '#38bdf8';
            else if (n.status === 'labeled1') ctx.fillStyle = '#f472b6';
            else if (n.status === 'pseudo0') ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
            else if (n.status === 'pseudo1') ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
            else ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ── Code Explainer ───────────────────────────────────── */
function initCodeExplainer() {
    const codeBlock = document.getElementById('codeBlockInteractive');
    const copyBtn = document.getElementById('btnCopyCode');
    const unlockBtn = document.getElementById('btnUnlockLine');
    const stepBtns = document.querySelectorAll('.code-tab-btn');
    if (!codeBlock) return;

    let selectedLine = 4;
    let isLocked = false;

    const CODE_LINES = [
        { num: 1, text: 'import numpy as np', html: '<span class="code-keyword">import</span> numpy <span class="code-keyword">as</span> np' },
        { num: 2, text: 'from sklearn.base import clone', html: '<span class="code-keyword">from</span> sklearn.base <span class="code-keyword">import</span> clone' },
        { num: 3, text: 'class SelfTrainingClassifier:', html: '<span class="code-keyword">class</span> <span class="code-func">SelfTrainingClassifier</span>:' },
        { num: 4, text: '    def __init__(self, base_estimator, threshold=0.85, max_iter=10):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, base_estimator, threshold=<span class="code-num">0.85</span>, max_iter=<span class="code-num">10</span>):' },
        { num: 5, text: '        self.base_estimator = base_estimator', html: '        self.base_estimator = base_estimator' },
        { num: 6, text: '        self.threshold, self.max_iter = threshold, max_iter', html: '        self.threshold, self.max_iter = threshold, max_iter' },
        { num: 7, text: '    def fit(self, X_labeled, y_labeled, X_unlabeled):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X_labeled, y_labeled, X_unlabeled):' },
        { num: 8, text: '        X_train, y_train = np.copy(X_labeled), np.copy(y_labeled)', html: '        X_train, y_train = np.copy(X_labeled), np.copy(y_labeled)' },
        { num: 9, text: '        X_u = np.copy(X_unlabeled)', html: '        X_u = np.copy(X_unlabeled)' },
        { num: 10, text: '        self.model_ = clone(self.base_estimator)', html: '        self.model_ = clone(self.base_estimator)' },
        { num: 11, text: '        for iteration in range(self.max_iter):', html: '        <span class="code-keyword">for</span> iteration <span class="code-keyword">in</span> range(self.max_iter):' },
        { num: 12, text: '            self.model_.fit(X_train, y_train)', html: '            self.model_.fit(X_train, y_train)' },
        { num: 13, text: '            if len(X_u) == 0: break', html: '            <span class="code-keyword">if</span> len(X_u) == <span class="code-num">0</span>: <span class="code-keyword">break</span>' },
        { num: 14, text: '            probs = self.model_.predict_proba(X_u)', html: '            probs = self.model_.predict_proba(X_u)' },
        { num: 15, text: '            max_probs = np.max(probs, axis=1)', html: '            max_probs = np.max(probs, axis=<span class="code-num">1</span>)' },
        { num: 16, text: '            confident_mask = max_probs >= self.threshold', html: '            confident_mask = max_probs >= self.threshold' },
        { num: 17, text: '            if not np.any(confident_mask): break', html: '            <span class="code-keyword">if</span> <span class="code-keyword">not</span> np.any(confident_mask): <span class="code-keyword">break</span>' },
        { num: 18, text: '            pseudo_labels = np.argmax(probs[confident_mask], axis=1)', html: '            pseudo_labels = np.argmax(probs[confident_mask], axis=<span class="code-num">1</span>)' },
        { num: 19, text: '            X_train = np.vstack([X_train, X_u[confident_mask]])', html: '            X_train = np.vstack([X_train, X_u[confident_mask]])' },
        { num: 20, text: '            y_train = np.hstack([y_train, pseudo_labels])', html: '            y_train = np.hstack([y_train, pseudo_labels])' },
        { num: 21, text: '            X_u = X_u[~confident_mask]', html: '            X_u = X_u[~confident_mask]' },
        { num: 22, text: '        return self', html: '        <span class="code-keyword">return</span> self' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast array manipulation and masking.", math: "\\text{import numpy as np}" },
        2: { title: "Import Estimator Cloning", text: "Imports clone to instantiate fresh base estimators each iteration.", math: "\\text{clone}(estimator)" },
        3: { title: "SelfTrainingClassifier Class", text: "Encapsulates iterative pseudo-label bootstrapping wrapper.", math: "\\mathcal{M}_{\\text{SelfTrain}}" },
        4: { title: "Classifier Constructor", text: "Initializes base model, confidence threshold tau, and maximum rounds.", math: "\\tau = 0.85, \\quad \\text{max\\_iter} = 10" },
        5: { title: "Save Base Estimator", text: "Stores reference to underlying supervised classifier (e.g. SVM or Logistic).", math: "f_0" },
        6: { title: "Save Threshold Hyperparameter", text: "Sets cutoff probability tau determining pseudo-label acceptance.", math: "P(y \\mid x) \\ge \\tau" },
        7: { title: "Fit Algorithm Entrypoint", text: "Receives small labeled dataset X_labeled and large unlabeled dataset X_unlabeled.", math: "\\mathcal{D}_L, \\mathcal{D}_U" },
        8: { title: "Initialize Training Dataset", text: "Copies initial seed labeled samples into active training buffers.", math: "\\mathbf{X}_{train} = \\mathbf{X}_L, \\, \\mathbf{y}_{train} = \\mathbf{y}_L" },
        9: { title: "Copy Unlabeled Array", text: "Copies unlabeled samples buffer X_u to be consumed iteratively.", math: "\\mathbf{X}_U" },
        10: { title: "Clone Base Estimator", text: "Creates a clean copy of base classifier prior to loop training.", math: "f^{(t)}" },
        11: { title: "Iterative Bootstrapping Loop", text: "Executes up to max_iter rounds of self-training augmentation.", math: "t = 1, \\dots, T" },
        12: { title: "Train Model on Current Buffer", text: "Fits classifier on expanded dataset combining initial labels and pseudo-labels.", math: "\\theta^{(t)} = \\arg\\min_\\theta \\mathcal{L}(\\mathbf{X}_{train}, \\mathbf{y}_{train})" },
        13: { title: "Check Unlabeled Pool Depletion", text: "Terminates early if all unlabeled samples have been assigned pseudo-labels.", math: "|\\mathbf{X}_U| = 0" },
        14: { title: "Predict Unlabeled Probabilities", text: "Evaluates class probability distribution across remaining unlabeled samples.", math: "P(y = k \\mid x_u)" },
        15: { title: "Compute Maximum Class Probabilities", text: "Finds highest probability score per unlabeled sample.", math: "\\max_k P(y = k \\mid x_u)" },
        16: { title: "Apply Confidence Masking", text: "Filters samples where max confidence exceeds threshold tau.", math: "\\mathbb{I}(\\max_k P(y = k \\mid x_u) \\ge \\tau)" },
        17: { title: "Check High-Confidence Convergence", text: "Stops iterations if no unlabeled sample satisfies confidence cutoff tau.", math: "\\text{count}(mask) = 0" },
        18: { title: "Generate Pseudo-Label Assignments", text: "Assigns argmax predicted class label to high-confidence samples.", math: "\\hat{y}_u = \\arg\\max_k P(y = k \\mid x_u)" },
        19: { title: "Augment Feature Vector Buffer", text: "Appends high-confidence unlabeled feature vectors to training set.", math: "\\mathbf{X}_{train} \\leftarrow \\mathbf{X}_{train} \\cup \\mathbf{X}_{u,\\text{conf}}" },
        20: { title: "Augment Target Label Buffer", text: "Appends generated pseudo-labels to training target array.", math: "\\mathbf{y}_{train} \\leftarrow \\mathbf{y}_{train} \\cup \\hat{\\mathbf{y}}_u" },
        21: { title: "Remove Pseudo-Labeled Samples", text: "Drops assigned samples from unlabeled candidate pool X_u.", math: "\\mathbf{X}_U \\leftarrow \\mathbf{X}_{U, \\text{remaining}}" },
        22: { title: "Return Fitted Model", text: "Returns trained self-training classifier instance.", math: "\\mathcal{M}_{\\text{fitted}}" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#38bdf8; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(56,189,248,0.15)'}; color:${isLocked ? '#f472b6' : '#38bdf8'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(56,189,248,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#38bdf8; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Expands dataset coverage with high-confidence pseudo-labels to boost downstream accuracy.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#38bdf8;">
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
            else if (step === 'step2') targetLine = 12;
            else if (step === 'step3') targetLine = 16;
            else if (step === 'step4') targetLine = 19;

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

/* ── Sample Section ───────────────────────────────────── */
function initSampleSection() {
    const tableBody = document.querySelector('#sampleTable tbody');
    const metricLabeled = document.getElementById('metricLabeled');
    const metricPseudo = document.getElementById('metricPseudo');
    const metricUnlabeled = document.getElementById('metricUnlabeled');
    const metricAcc = document.getElementById('metricAcc');
    const trainBtn = document.getElementById('trainSampleBtn');

    let round = 0;
    const sampleData = [
        { id: 1, x1: 0.25, x2: 0.75, trueLabel: 0, status: 'Labeled (Seed)' },
        { id: 2, x1: 0.35, x2: 0.85, trueLabel: 0, status: 'Labeled (Seed)' },
        { id: 3, x1: 0.75, x2: 0.25, trueLabel: 1, status: 'Labeled (Seed)' },
        { id: 4, x1: 0.85, x2: 0.15, trueLabel: 1, status: 'Labeled (Seed)' },
        { id: 5, x1: 0.30, x2: 0.70, trueLabel: 0, status: 'Unlabeled' },
        { id: 6, x1: 0.40, x2: 0.65, trueLabel: 0, status: 'Unlabeled' },
        { id: 7, x1: 0.70, x2: 0.30, trueLabel: 1, status: 'Unlabeled' },
        { id: 8, x1: 0.80, x2: 0.35, trueLabel: 1, status: 'Unlabeled' }
    ];

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        let numLabeled = 0, numPseudo = 0, numUnlabeled = 0;
        sampleData.forEach(d => {
            if (d.status.startsWith('Labeled')) numLabeled++;
            else if (d.status.startsWith('Pseudo')) numPseudo++;
            else numUnlabeled++;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${d.id}</td>
                <td>${d.x1.toFixed(2)}</td>
                <td>${d.x2.toFixed(2)}</td>
                <td><span style="color:${d.trueLabel === 0 ? '#38bdf8' : '#f472b6'}; font-weight:700;">Class ${d.trueLabel}</span></td>
                <td><span style="padding:0.2rem 0.5rem; border-radius:12px; font-size:0.75rem; background:${d.status.startsWith('Labeled') ? 'rgba(56,189,248,0.15)' : (d.status.startsWith('Pseudo') ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.08)')}; color:${d.status.startsWith('Labeled') ? '#38bdf8' : (d.status.startsWith('Pseudo') ? '#c084fc' : 'var(--text-secondary)')};">${d.status}</span></td>
            `;
            tableBody.appendChild(tr);
        });

        if (metricLabeled) metricLabeled.textContent = numLabeled;
        if (metricPseudo) metricPseudo.textContent = numPseudo;
        if (metricUnlabeled) metricUnlabeled.textContent = numUnlabeled;
        if (metricAcc) metricAcc.textContent = `${(85 + round * 4.5).toFixed(1)}%`;
    }

    // Chart.js init
    const ctxAcc = document.getElementById('chartAcc')?.getContext('2d');
    const ctxConf = document.getElementById('chartConf')?.getContext('2d');
    let chartAcc, chartConf;

    if (ctxAcc) {
        chartAcc = new Chart(ctxAcc, {
            type: 'line',
            data: {
                labels: ['Round 0', 'Round 1', 'Round 2', 'Round 3'],
                datasets: [{ label: 'Accuracy (%)', data: [82.5, 87.0, 92.4, 95.8], borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.1)', fill: true, tension: 0.3 }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (ctxConf) {
        chartConf = new Chart(ctxConf, {
            type: 'bar',
            data: {
                labels: ['0.50-0.60', '0.60-0.70', '0.70-0.80', '0.80-0.90', '0.90-1.00'],
                datasets: [{ label: 'Sample Count', data: [3, 5, 8, 14, 22], backgroundColor: '#c084fc', borderRadius: 4 }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    if (trainBtn) {
        trainBtn.addEventListener('click', () => {
            round++;
            sampleData.forEach(d => {
                if (d.status === 'Unlabeled' && Math.random() > 0.3) {
                    d.status = `Pseudo-Labeled (R${round})`;
                }
            });
            renderTable();
        });
    }

    renderTable();
}

/* ── Interactive Playground ───────────────────────────── */
function initPlayground() {
    const canvas = document.getElementById('semiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sliderTau = document.getElementById('sliderTau');
    const valTau = document.getElementById('valTau');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const btnStep = document.getElementById('btnStepRound');
    const btnReset = document.getElementById('btnResetPlayground');
    const toolLabel = document.getElementById('activeToolLabel');
    const lblRound = document.getElementById('lblRound');
    const lblAdded = document.getElementById('lblAdded');

    let tau = 0.85;
    let addMode = 'class0';
    let currentRound = 0;
    let totalAdded = 0;
    let points = [];

    function generatePreset(type) {
        points = [];
        currentRound = 0;
        totalAdded = 0;
        const w = canvas.width, h = canvas.height;

        if (type === 'moons') {
            for (let i = 0; i < 40; i++) {
                const theta = (i / 40) * Math.PI;
                points.push({ x: w * 0.35 + Math.cos(theta) * 120 + (Math.random() - 0.5) * 20, y: h * 0.45 - Math.sin(theta) * 100 + (Math.random() - 0.5) * 20, cls: i < 3 ? 0 : -1 });
                points.push({ x: w * 0.55 - Math.cos(theta) * 120 + (Math.random() - 0.5) * 20, y: h * 0.55 + Math.sin(theta) * 100 + (Math.random() - 0.5) * 20, cls: i < 3 ? 1 : -1 });
            }
        } else if (type === 'blobs') {
            for (let i = 0; i < 35; i++) {
                points.push({ x: w * 0.3 + (Math.random() - 0.5) * 120, y: h * 0.3 + (Math.random() - 0.5) * 120, cls: i < 3 ? 0 : -1 });
                points.push({ x: w * 0.7 + (Math.random() - 0.5) * 120, y: h * 0.7 + (Math.random() - 0.5) * 120, cls: i < 3 ? 1 : -1 });
            }
        } else {
            for (let i = 0; i < 40; i++) {
                const angle = (i / 40) * Math.PI * 3;
                const r = (i / 40) * 160 + 20;
                points.push({ x: w / 2 + Math.cos(angle) * r, y: h / 2 + Math.sin(angle) * r, cls: i < 3 ? 0 : -1 });
                points.push({ x: w / 2 + Math.cos(angle + Math.PI) * r, y: h / 2 + Math.sin(angle + Math.PI) * r, cls: i < 3 ? 1 : -1 });
            }
        }
        render();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.cls !== -1 ? 7 : 5, 0, Math.PI * 2);
            if (p.cls === 0) ctx.fillStyle = '#38bdf8';
            else if (p.cls === 1) ctx.fillStyle = '#f472b6';
            else if (p.cls === 10) ctx.fillStyle = 'rgba(56,189,248,0.5)';
            else if (p.cls === 11) ctx.fillStyle = 'rgba(244,114,182,0.5)';
            else ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = p.cls >= 10 ? 1.5 : 1;
            ctx.stroke();
        });

        if (lblRound) lblRound.textContent = `Round ${currentRound}`;
        if (lblAdded) lblAdded.textContent = totalAdded;
    }

    function stepRound() {
        currentRound++;
        let newlyPseudo = 0;
        const labeled = points.filter(p => p.cls === 0 || p.cls === 1 || p.cls === 10 || p.cls === 11);
        if (labeled.length === 0) return;

        points.forEach(p => {
            if (p.cls === -1) {
                // Find nearest labeled neighbor distance (including pseudo-labeled points from previous rounds)
                let minD0 = Infinity, minD1 = Infinity;
                labeled.forEach(l => {
                    const d = Math.sqrt((p.x - l.x) ** 2 + (p.y - l.y) ** 2);
                    if ((l.cls === 0 || l.cls === 10) && d < minD0) minD0 = d;
                    if ((l.cls === 1 || l.cls === 11) && d < minD1) minD1 = d;
                });

                const conf0 = 1 / (1 + minD0 * 0.02);
                const conf1 = 1 / (1 + minD1 * 0.02);
                const maxConf = Math.max(conf0, conf1);

                if (maxConf >= tau) {
                    p.cls = conf0 > conf1 ? 10 : 11;
                    newlyPseudo++;
                }
            }
        });

        totalAdded += newlyPseudo;
        render();
    }

    if (sliderTau) {
        sliderTau.addEventListener('input', (e) => {
            tau = parseFloat(e.target.value);
            if (valTau) valTau.textContent = tau.toFixed(2);
        });
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            addMode = btn.getAttribute('data-mode');
            if (toolLabel) toolLabel.textContent = btn.textContent;
        });
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            generatePreset(btn.getAttribute('data-preset'));
        });
    });

    if (btnStep) btnStep.addEventListener('click', stepRound);
    if (btnReset) btnReset.addEventListener('click', () => generatePreset('moons'));

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let c = -1;
        if (addMode === 'class0') c = 0;
        else if (addMode === 'class1') c = 1;
        points.push({ x, y, cls: c });
        render();
    });

    generatePreset('moons');
}
