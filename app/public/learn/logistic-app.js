let currentParsedCSV = null;

// ─── Utility : Logistic Regression Engine ──────────────────
class LogisticRegression {
    constructor(learningRate = 0.1, epochs = 1000, threshold = 0.5) {
        this.learningRate = learningRate;
        this.epochs = epochs;
        this.threshold = threshold;
        this.weight = 0;
        this.bias = 0;
        this.meanX = 0;
        this.stdX = 1;
        // Evaluation results
        this.accuracy = 0;
        this.precision = 0;
        this.recall = 0;
        this.f1 = 0;
        this.logLoss = 0;
        this.tp = 0; this.tn = 0; this.fp = 0; this.fn = 0;
        this.probabilities = [];
        this.predictions = [];
    }

    sigmoid(z) {
        if (z >= 40) return 1;
        if (z <= -40) return 0;
        if (z >= 0) return 1 / (1 + Math.exp(-z));
        const ez = Math.exp(z);
        return ez / (1 + ez);
    }

    fit(xArr, yArr) {
        const n = xArr.length;
        if (n < 2) throw new Error('Need at least 2 data points');

        // Normalize X
        this.meanX = xArr.reduce((a, b) => a + b, 0) / n;
        const variance = xArr.reduce((a, x) => a + (x - this.meanX) ** 2, 0) / n;
        this.stdX = Math.sqrt(variance) || 1;
        const xNorm = xArr.map(x => (x - this.meanX) / this.stdX);

        // Initialize weights
        this.weight = 0;
        this.bias = 0;

        // Gradient descent
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            let dw = 0, db = 0;
            for (let i = 0; i < n; i++) {
                const z = this.weight * xNorm[i] + this.bias;
                const p = this.sigmoid(z);
                const err = p - yArr[i];
                dw += err * xNorm[i];
                db += err;
            }
            this.weight -= this.learningRate * (dw / n);
            this.bias -= this.learningRate * (db / n);
        }

        // Compute probabilities & predictions
        this.probabilities = xArr.map(x => this.predictProba(x));
        this.predictions = this.probabilities.map(p => p >= this.threshold ? 1 : 0);

        // Confusion matrix
        this.tp = 0; this.tn = 0; this.fp = 0; this.fn = 0;
        for (let i = 0; i < n; i++) {
            if (yArr[i] === 1 && this.predictions[i] === 1) this.tp++;
            else if (yArr[i] === 0 && this.predictions[i] === 0) this.tn++;
            else if (yArr[i] === 0 && this.predictions[i] === 1) this.fp++;
            else this.fn++;
        }

        // Metrics
        this.accuracy = (this.tp + this.tn) / n;
        this.precision = (this.tp + this.fp) > 0 ? this.tp / (this.tp + this.fp) : 0;
        this.recall = (this.tp + this.fn) > 0 ? this.tp / (this.tp + this.fn) : 0;
        this.f1 = (this.precision + this.recall) > 0
            ? 2 * (this.precision * this.recall) / (this.precision + this.recall) : 0;

        // Log Loss
        const eps = 1e-7;
        this.logLoss = -yArr.reduce((sum, y, i) => {
            const p = Math.max(eps, Math.min(1 - eps, this.probabilities[i]));
            return sum + (y * Math.log(p) + (1 - y) * Math.log(1 - p));
        }, 0) / n;

        return this;
    }

    predictProba(x) {
        const xNorm = (x - this.meanX) / this.stdX;
        return this.sigmoid(this.weight * xNorm + this.bias);
    }

    predict(x) {
        return this.predictProba(x) >= this.threshold ? 1 : 0;
    }

    getDecisionBoundary() {
        // Solve: weight * xNorm + bias = 0  =>  xNorm = -bias / weight
        if (Math.abs(this.weight) < 1e-10) return null;
        const xNormBoundary = -this.bias / this.weight;
        return xNormBoundary * this.stdX + this.meanX;
    }
}

// ─── Sample Datasets ──────────────────────────────────────
const DATASETS = {
    exam: {
        name: 'Exam Score vs Pass/Fail',
        xLabel: 'Exam Score',
        yLabel: 'Pass (1) / Fail (0)',
        x: [20, 25, 30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 70, 75, 80, 85, 90, 92, 95, 98],
        y: [0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1]
    },
    tumor: {
        name: 'Tumor Size vs Malignant',
        xLabel: 'Tumor Size (cm)',
        yLabel: 'Malignant (1) / Benign (0)',
        x: [1, 1.5, 2, 2.2, 2.5, 2.8, 3, 3.2, 3.5, 3.8, 4, 4.2, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5],
        y: [0, 0,   0, 0,   0,   0,   0, 0,   0,   1,   0, 1,   1,   1, 1,   1, 1,   1, 1,   1, 1,   1, 1,   1,  1]
    },
    churn: {
        name: 'Account Age vs Churn',
        xLabel: 'Account Age (months)',
        yLabel: 'Churned (1) / Retained (0)',
        x: [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 36, 40, 48, 52, 56, 60, 66, 72, 80],
        y: [1, 1, 1, 1, 1, 1, 1, 1,  0,  1,  0,  0,  0,  0,  1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0]
    }
};

// ─── Chart Instances Registry ─────────────────────────────
const charts = {};

function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

// ─── Chart Color Palette ──────────────────────────────────
const COLORS = {
    accent:     'rgba(96, 165, 250, 1)',
    accentFade: 'rgba(96, 165, 250, 0.25)',
    purple:     'rgba(167, 139, 250, 1)',
    purpleFade: 'rgba(167, 139, 250, 0.25)',
    green:      'rgba(52, 211, 153, 1)',
    greenFade:  'rgba(52, 211, 153, 0.25)',
    red:        'rgba(248, 113, 113, 1)',
    redFade:    'rgba(248, 113, 113, 0.25)',
    yellow:     'rgba(251, 191, 36, 1)',
    yellowFade: 'rgba(251, 191, 36, 0.25)',
    grid:       'rgba(255,255,255,0.06)',
    gridTick:   'rgba(148,163,184,0.7)',
};

Chart.defaults.color = COLORS.gridTick;
Chart.defaults.borderColor = COLORS.grid;
Chart.defaults.font.family = "'Inter', sans-serif";

function chartBase() {
    return {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
            legend: {
                labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 } }
            }
        },
        scales: {
            x: { grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } },
            y: { grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } }
        }
    };
}

// ─── Hero Canvas Animation ─────────────────────────────────
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    // Generate binary classification data
    const N = 28;
    const points = [];
    for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const cls = t > 0.5 + (Math.random() - 0.5) * 0.15 ? 1 : 0;
        points.push({
            x: 0.08 + t * 0.84,
            y: 0.2 + Math.random() * 0.6,
            cls,
            phase: Math.random() * Math.PI * 2,
            appear: i * 0.06,
            radius: 3.5 + Math.random() * 2
        });
    }

    let startTime = null;
    const POINT_DURATION = 0.5;
    const SIGMOID_START = N * 0.06 + 0.3;
    const SIGMOID_DURATION = 1.5;

    function drawSigmoid(ctx, w, h, progress) {
        const ease = 1 - Math.pow(1 - progress, 3);
        const steps = Math.floor(200 * ease);
        if (steps < 2) return;

        // Glow
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.12)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const t = i / 200;
            const px = t * w;
            const z = (t - 0.5) * 12;
            const sig = 1 / (1 + Math.exp(-z));
            const py = (1 - sig) * h * 0.7 + h * 0.15;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Main curve
        const grad = ctx.createLinearGradient(0, 0, w * ease, 0);
        grad.addColorStop(0, 'rgba(167, 139, 250, 0.9)');
        grad.addColorStop(1, 'rgba(248, 113, 113, 0.9)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const t = i / 200;
            const px = t * w;
            const z = (t - 0.5) * 12;
            const sig = 1 / (1 + Math.exp(-z));
            const py = (1 - sig) * h * 0.7 + h * 0.15;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Labels
        if (ease > 0.85) {
            const labelAlpha = (ease - 0.85) / 0.15;
            ctx.font = 'bold 12px JetBrains Mono, monospace';
            ctx.fillStyle = `rgba(96, 165, 250, ${labelAlpha})`;
            ctx.fillText('Class 0', 20, h - 16);
            ctx.fillStyle = `rgba(248, 113, 113, ${labelAlpha})`;
            ctx.fillText('Class 1', w - 70, 28);
            ctx.fillStyle = `rgba(167, 139, 250, ${labelAlpha})`;
            ctx.fillText('σ(z) = 1/(1+e⁻ᶻ)', w / 2 - 65, h * 0.15 - 8);
        }

        // Decision boundary
        if (ease > 0.6) {
            const lineAlpha = (ease - 0.6) / 0.4 * 0.5;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);
            const midX = w * 0.5;
            ctx.beginPath(); ctx.moveTo(midX, 0); ctx.lineTo(midX, h); ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function draw(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;

        const w = W(), h = H();
        ctx.clearRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 8; i++) {
            const gx = (i / 8) * w;
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
            const gy = (i / 8) * h;
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        // Points
        points.forEach(p => {
            const t = Math.max(0, Math.min(1, (elapsed - p.appear) / POINT_DURATION));
            if (t <= 0) return;
            const ease = 1 - Math.pow(1 - t, 3);
            const px = p.x * w;
            const py = p.y * h;
            const floatY = Math.sin(elapsed * 1.2 + p.phase) * 2;
            const color = p.cls === 1
                ? `rgba(248, 113, 113, ${0.9 * ease})`
                : `rgba(96, 165, 250, ${0.9 * ease})`;
            const glowColor = p.cls === 1
                ? 'rgba(248, 113, 113, 0.25)'
                : 'rgba(96, 165, 250, 0.25)';

            // Glow
            const grd = ctx.createRadialGradient(px, py + floatY, 0, px, py + floatY, 16 * ease);
            grd.addColorStop(0, glowColor);
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(px, py + floatY, 16 * ease, 0, Math.PI * 2);
            ctx.fill();

            // Point
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px, py + floatY, p.radius * ease, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(255,255,255, ${0.3 * ease})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Sigmoid
        const sigProg = Math.max(0, Math.min(1, (elapsed - SIGMOID_START) / SIGMOID_DURATION));
        if (sigProg > 0) drawSigmoid(ctx, w, h, sigProg);

        // Loop
        if (elapsed > SIGMOID_START + SIGMOID_DURATION + 3) startTime = timestamp;
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

// ─── Render Sample Table ──────────────────────────────────
function renderSampleTable(datasetKey) {
    const ds = DATASETS[datasetKey];
    const tbody = document.querySelector('#sampleTable tbody');
    const thead = document.querySelector('#sampleTable thead tr');
    thead.innerHTML = `<th>#</th><th>${ds.xLabel}</th><th>${ds.yLabel}</th>`;
    tbody.innerHTML = '';
    ds.x.forEach((xv, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i + 1}</td><td>${xv}</td><td>${ds.y[i]}</td>`;
        tbody.appendChild(tr);
    });
}

// ─── Train & Visualise Sample ─────────────────────────────
function trainSampleModel(datasetKey) {
    const ds = DATASETS[datasetKey];
    const lr = new LogisticRegression(0.5, 2000, 0.5).fit(ds.x, ds.y);

    // Show metrics
    document.getElementById('sampleMetrics').style.display = 'grid';
    document.getElementById('metricAccuracy').textContent = (lr.accuracy * 100).toFixed(1) + '%';
    document.getElementById('metricPrecision').textContent = (lr.precision * 100).toFixed(1) + '%';
    document.getElementById('metricRecall').textContent = (lr.recall * 100).toFixed(1) + '%';
    document.getElementById('metricF1').textContent = lr.f1.toFixed(4);
    document.getElementById('metricLogLoss').textContent = lr.logLoss.toFixed(4);
    document.getElementById('metricThreshold').textContent = lr.threshold.toFixed(2);

    // Show charts
    document.getElementById('sampleCharts').style.display = 'grid';

    renderScatter('scatterChart', ds.x, ds.y, lr, ds.xLabel, ds.yLabel);
    renderProbChart('probChart', ds.x, ds.y, lr, ds.xLabel);
    renderConfusionMatrix('confusionMatrixDiv', lr);
    renderMetricsBar('metricsBarChart', lr);
}

// ─── Chart Renderers ──────────────────────────────────────

function renderScatter(canvasId, xData, yData, lr, xLabel, yLabel) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const xMin = Math.min(...xData);
    const xMax = Math.max(...xData);
    const margin = (xMax - xMin) * 0.1;

    // Sigmoid curve data
    const sigmoidPoints = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const x = (xMin - margin) + (i / steps) * (xMax - xMin + 2 * margin);
        sigmoidPoints.push({ x, y: lr.predictProba(x) });
    }

    // Split data by class
    const class0 = [], class1 = [];
    xData.forEach((x, i) => {
        if (yData[i] === 0) class0.push({ x, y: 0 });
        else class1.push({ x, y: 1 });
    });

    // Decision boundary
    const boundary = lr.getDecisionBoundary();
    const boundaryData = boundary !== null ? [
        { x: boundary, y: -0.05 },
        { x: boundary, y: 1.05 }
    ] : [];

    charts[canvasId] = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Class 0',
                    data: class0,
                    backgroundColor: COLORS.accentFade,
                    borderColor: COLORS.accent,
                    borderWidth: 2,
                    pointRadius: 7,
                    pointHoverRadius: 10,
                },
                {
                    label: 'Class 1',
                    data: class1,
                    backgroundColor: COLORS.redFade,
                    borderColor: COLORS.red,
                    borderWidth: 2,
                    pointRadius: 7,
                    pointHoverRadius: 10,
                },
                {
                    label: 'Sigmoid Curve',
                    data: sigmoidPoints,
                    type: 'line',
                    borderColor: COLORS.purple,
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.4,
                },
                {
                    label: 'Decision Boundary',
                    data: boundaryData,
                    type: 'line',
                    borderColor: 'rgba(255,255,255,0.4)',
                    borderWidth: 2,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false,
                    tension: 0,
                }
            ]
        },
        options: {
            ...chartBase(),
            scales: {
                x: { title: { display: true, text: xLabel, color: COLORS.gridTick }, grid: { color: COLORS.grid } },
                y: { title: { display: true, text: 'P(y=1)', color: COLORS.gridTick }, grid: { color: COLORS.grid }, min: -0.1, max: 1.1 }
            }
        }
    });
}

function renderProbChart(canvasId, xData, yData, lr, xLabel) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = xData.map((x, i) => `${x}`);
    const probs = xData.map(x => lr.predictProba(x));

    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'P(Class 1)',
                data: probs,
                backgroundColor: yData.map(y => y === 1 ? COLORS.redFade : COLORS.accentFade),
                borderColor: yData.map(y => y === 1 ? COLORS.red : COLORS.accent),
                borderWidth: 1.5,
                borderRadius: 4,
            }]
        },
        options: {
            ...chartBase(),
            scales: {
                x: { title: { display: true, text: xLabel, color: COLORS.gridTick }, grid: { color: COLORS.grid },
                      ticks: { maxRotation: 45, font: { size: 9 } } },
                y: { title: { display: true, text: 'Probability', color: COLORS.gridTick }, grid: { color: COLORS.grid }, min: 0, max: 1 }
            },
            plugins: {
                legend: { display: false },
                annotation: undefined
            }
        },
        plugins: [{
            id: 'thresholdLine',
            afterDraw(chart) {
                const yScale = chart.scales.y;
                const ctx = chart.ctx;
                const y = yScale.getPixelForValue(0.5);
                ctx.save();
                ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(chart.chartArea.left, y);
                ctx.lineTo(chart.chartArea.right, y);
                ctx.stroke();
                ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
                ctx.font = 'bold 11px Inter, sans-serif';
                ctx.fillText('Threshold = 0.5', chart.chartArea.right - 110, y - 6);
                ctx.restore();
            }
        }]
    });
}

function renderConfusionMatrix(divId, lr) {
    const div = document.getElementById(divId);
    div.innerHTML = `
        <div class="confusion-grid">
            <div class="cm-corner"></div>
            <div class="cm-header">Pred. 0</div>
            <div class="cm-header">Pred. 1</div>
            <div class="cm-row-header">Actual 0</div>
            <div class="cm-cell cm-tn">
                <span class="cm-value">${lr.tn}</span>
                <span class="cm-label">TN</span>
            </div>
            <div class="cm-cell cm-fp">
                <span class="cm-value">${lr.fp}</span>
                <span class="cm-label">FP</span>
            </div>
            <div class="cm-row-header">Actual 1</div>
            <div class="cm-cell cm-fn">
                <span class="cm-value">${lr.fn}</span>
                <span class="cm-label">FN</span>
            </div>
            <div class="cm-cell cm-tp">
                <span class="cm-value">${lr.tp}</span>
                <span class="cm-label">TP</span>
            </div>
        </div>
    `;
}

function renderMetricsBar(canvasId, lr) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId).getContext('2d');

    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
            datasets: [{
                label: 'Metric Value',
                data: [lr.accuracy, lr.precision, lr.recall, lr.f1],
                backgroundColor: [COLORS.greenFade, COLORS.accentFade, COLORS.purpleFade, COLORS.yellowFade],
                borderColor: [COLORS.green, COLORS.accent, COLORS.purple, COLORS.yellow],
                borderWidth: 2,
                borderRadius: 6,
                barPercentage: 0.6,
            }]
        },
        options: {
            ...chartBase(),
            indexAxis: 'y',
            scales: {
                x: { min: 0, max: 1.05, grid: { color: COLORS.grid }, ticks: { font: { size: 11 } } },
                y: { grid: { color: COLORS.grid }, ticks: { font: { size: 12, weight: '600' } } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ─── Playground : CSV Parsing ─────────────────────────────
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV must have a header row + data.');
    const delim = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(delim).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cells.length === headers.length) rows.push(cells);
    }
    return { headers, rows };
}

function renderCSVPreview(parsed) {
    currentParsedCSV = parsed;
    const preview = document.getElementById('csvPreview');
    const x1Sel = document.getElementById('x1ColSelect') || document.getElementById('xColSelect');
    const x2Sel = document.getElementById('x2ColSelect');
    const ySel = document.getElementById('yColSelect');
    const tableDiv = document.getElementById('csvTablePreview');

    if (!preview || !tableDiv) return;

    if (x1Sel) {
        x1Sel.innerHTML = '';
        parsed.headers.forEach((h, i) => {
            x1Sel.innerHTML += `<option value="${i}">${h}</option>`;
        });
    }
    if (x2Sel) {
        x2Sel.innerHTML = '<option value="-1">None (1D Feature)</option>';
        parsed.headers.forEach((h, i) => {
            x2Sel.innerHTML += `<option value="${i}" ${i === 1 ? 'selected' : ''}>${h}</option>`;
        });
        if (parsed.headers.length > 1) x2Sel.value = '1';
    }
    if (ySel) {
        ySel.innerHTML = '';
        parsed.headers.forEach((h, i) => {
            const isLast = i === (parsed.headers.length - 1);
            ySel.innerHTML += `<option value="${i}" ${isLast ? 'selected' : ''}>${h}</option>`;
        });
        if (parsed.headers.length > 0) ySel.value = String(parsed.headers.length - 1);
    }

    let html = '<table><thead><tr>';
    parsed.headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';
    const maxRows = Math.min(parsed.rows.length, 50);
    for (let i = 0; i < maxRows; i++) {
        html += '<tr>';
        parsed.rows[i].forEach(c => html += `<td>${c}</td>`);
        html += '</tr>';
    }
    if (parsed.rows.length > 50) html += `<tr><td colspan="${parsed.headers.length}" style="text-align:center;color:var(--text-muted);">... ${parsed.rows.length - 50} more rows</td></tr>`;
    html += '</tbody></table>';
    tableDiv.innerHTML = html;
    preview.style.display = 'block';
}

// ─── Playground : Manual Entry ────────────────────────────
function addManualRow(xVal = '', yVal = '') {
    const container = document.getElementById('manualRows');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'manual-row';
    row.innerHTML = `
        <input type="number" step="any" placeholder="X" value="${xVal}">
        <input type="number" step="1" min="0" max="1" placeholder="0 or 1" value="${yVal}">
        <button class="remove-row" title="Remove">&times;</button>
    `;
    row.querySelector('.remove-row').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function initManualRows(count = 5) {
    const container = document.getElementById('manualRows');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) addManualRow();
}

function loadExampleData() {
    const container = document.getElementById('manualRows');
    if (!container) return;
    container.innerHTML = '';
    const xs = [10, 20, 30, 40, 45, 50, 55, 60, 70, 80, 90, 95];
    const ys = [0,  0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1];
    xs.forEach((x, i) => addManualRow(x, ys[i]));
}

// ─── Playground : Train Custom ────────────────────────────
function trainCustomModel() {
    let xData = [], yData = [], xLabel = 'X', yLabel = 'Y';

    const activeTab = document.querySelector('.tab-content.active')?.id || 'tab-csv';

    if (activeTab === 'tab-csv') {
        if (!currentParsedCSV || !currentParsedCSV.rows.length) {
            alert('Please upload or paste a CSV dataset first.');
            return;
        }
        const x1Sel = document.getElementById('x1ColSelect') || document.getElementById('xColSelect');
        const ySel = document.getElementById('yColSelect');
        if (!x1Sel || !ySel) { alert('Please select X and Y columns.'); return; }

        const x1Idx = parseInt(x1Sel.value);
        const yIdx = parseInt(ySel.value);
        if (isNaN(x1Idx) || isNaN(yIdx)) { alert('Please select valid X and Y columns.'); return; }

        currentParsedCSV.rows.forEach(cells => {
            if (cells.length > Math.max(x1Idx, yIdx)) {
                const xv = parseFloat(cells[x1Idx]);
                let yvRaw = cells[yIdx];
                let yv = parseFloat(yvRaw);
                if (isNaN(yv)) {
                    yv = (String(yvRaw).toLowerCase().includes('1') || String(yvRaw).toLowerCase().includes('true') || String(yvRaw).toLowerCase().includes('pos') || String(yvRaw).toLowerCase().includes('pass')) ? 1 : 0;
                } else {
                    yv = yv > 0.5 ? 1 : 0;
                }
                if (!isNaN(xv)) { xData.push(xv); yData.push(yv); }
            }
        });

        xLabel = x1Sel.options[x1Sel.selectedIndex]?.text || 'X';
        yLabel = ySel.options[ySel.selectedIndex]?.text || 'Y';
    } else {
        const x1LabelEl = document.getElementById('x1Label') || document.getElementById('xLabel');
        xLabel = x1LabelEl?.value || 'X';
        yLabel = 'Label';
        document.querySelectorAll('.manual-row').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                const xv = parseFloat(inputs[0].value);
                const yv = parseFloat(inputs[inputs.length - 1].value);
                if (!isNaN(xv) && (yv === 0 || yv === 1)) { xData.push(xv); yData.push(yv); }
            }
        });
    }

    if (xData.length < 2) {
        alert('Please provide at least 2 valid data points with binary Y labels (0 or 1).');
        return;
    }

    const lr = new LogisticRegression(0.5, 2000, 0.5).fit(xData, yData);

    const results = document.getElementById('customResults');
    if (results) {
        results.style.display = 'block';
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Set metrics matching exact IDs in logistic-regression.html
    const elAcc = document.getElementById('cMetricAcc') || document.getElementById('cMetricAccuracy');
    if (elAcc) elAcc.textContent = (lr.accuracy * 100).toFixed(1) + '%';

    const elLoss = document.getElementById('cMetricLoss') || document.getElementById('cMetricLogLoss');
    if (elLoss) elLoss.textContent = lr.logLoss.toFixed(4);

    const elPrec = document.getElementById('cMetricPrecision');
    if (elPrec) elPrec.textContent = (lr.precision * 100).toFixed(1) + '%';

    const elRec = document.getElementById('cMetricRecall');
    if (elRec) elRec.textContent = (lr.recall * 100).toFixed(1) + '%';

    const elF1 = document.getElementById('cMetricF1');
    if (elF1) elF1.textContent = lr.f1.toFixed(4);

    const elEq = document.getElementById('cMetricEq') || document.getElementById('cMetricThreshold');
    if (elEq) {
        const b = lr.getDecisionBoundary();
        elEq.textContent = b !== null ? `${xLabel} = ${b.toFixed(2)}` : 'P(y=1)';
    }

    if (document.getElementById('cScatterChart')) renderScatter('cScatterChart', xData, yData, lr, xLabel, yLabel);
    if (document.getElementById('cLossChart')) renderProbChart('cLossChart', xData, yData, lr, xLabel);
    else if (document.getElementById('cProbChart')) renderProbChart('cProbChart', xData, yData, lr, xLabel);
    if (document.getElementById('cConfusionMatrixDiv')) renderConfusionMatrix('cConfusionMatrixDiv', lr);

    window._customLR = lr;
    const predictRes = document.getElementById('predictResult');
    if (predictRes) predictRes.style.display = 'none';
}

// ─── Intersection Observer for Animations ─────────────────
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

// ─── Navbar Scroll ─────────────────────────────────────────
function initNavbar() {
    const nav = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const links = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) current = section.id;
        });
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });
}

// ─── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // KaTeX auto-render
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\[', right: '\\]', display: true },
                { left: '\\(', right: '\\)', display: false },
                { left: '$', right: '$', display: false }
            ]
        });
    } else {
        setTimeout(() => {
            if (typeof renderMathInElement === 'function') {
                renderMathInElement(document.body, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '\\[', right: '\\]', display: true },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '$', right: '$', display: false }
                    ]
                });
            }
        }, 1000);
    }

    // Hero animation
    initHeroAnimation();

    // Navbar
    initNavbar();

    // Scroll animations
    initScrollAnimations();

    // Load default sample dataset
    renderSampleTable('exam');

    // ── Event Listeners ─────────────────────
    document.getElementById('sampleDatasetSelect').addEventListener('change', (e) => {
        renderSampleTable(e.target.value);
        document.getElementById('sampleMetrics').style.display = 'none';
        document.getElementById('sampleCharts').style.display = 'none';
    });

    document.getElementById('trainSampleBtn').addEventListener('click', () => {
        const key = document.getElementById('sampleDatasetSelect').value;
        trainSampleModel(key);
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // CSV upload
    const csvInput = document.getElementById('csvFileInput');
    const uploadZone = document.getElementById('uploadZone');

    csvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = parseCSV(ev.target.result);
                window._csvParsed = parsed;
                renderCSVPreview(parsed);
                uploadZone.style.display = 'none';
            } catch (err) {
                alert('Error parsing CSV: ' + err.message);
            }
        };
        reader.readAsText(file);
    });

    // Drag & drop
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = parseCSV(ev.target.result);
                    window._csvParsed = parsed;
                    renderCSVPreview(parsed);
                    uploadZone.style.display = 'none';
                } catch (err) {
                    alert('Error parsing CSV: ' + err.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please drop a .csv file.');
        }
    });

    // Manual entry
    initManualRows(5);
    document.getElementById('addRowBtn').addEventListener('click', () => addManualRow());
    document.getElementById('clearRowsBtn').addEventListener('click', () => initManualRows(5));
    document.getElementById('loadExampleBtn').addEventListener('click', loadExampleData);

    // Train custom
    document.getElementById('trainCustomBtn').addEventListener('click', trainCustomModel);

    // Predict
    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.addEventListener('click', () => {
            const lr = window._customLR;
            if (!lr) { alert('Please train a model first!'); return; }
            const inputEl = document.getElementById('predictX1') || document.getElementById('predictInput');
            if (!inputEl) return;
            const xv = parseFloat(inputEl.value);
            if (isNaN(xv)) { alert('Please enter a valid numeric value for prediction.'); return; }
            const prob = lr.predictProba(xv);
            const cls = lr.predict(xv);
            const result = document.getElementById('predictResult');
            if (result) {
                result.style.display = 'block';
                result.innerHTML = `
                    <div style="padding: 0.85rem 1.1rem; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; margin-top: 0.75rem; font-family: var(--font-mono, monospace);">
                        <strong style="color:#38bdf8;">🔮 Prediction Result:</strong><br>
                        P(Y = 1 | X = ${xv}) = <strong style="color:#fbbf24;">${(prob * 100).toFixed(1)}%</strong><br>
                        Predicted Output: <span style="color:${cls === 1 ? '#38bdf8' : '#f472b6'}; font-weight:700;">Class ${cls}</span>
                    </div>
                `;
            }
        });
    }

    initCodeExplainer();
});

/* ═════════════════════════════════════════════════════════
   SECTION 6: INTERACTIVE LINE-BY-LINE CODE EXPLAINER
   ═════════════════════════════════════════════════════════ */
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
        { num: 2, text: 'class LogisticRegressionScratch:', html: '<span class="code-keyword">class</span> <span class="code-func">LogisticRegressionScratch</span>:' },
        { num: 3, text: '    def __init__(self, lr=0.01, n_iters=1000):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, lr=<span class="code-num">0.01</span>, n_iters=<span class="code-num">1000</span>):' },
        { num: 4, text: '        self.lr, self.n_iters = lr, n_iters', html: '        self.lr, self.n_iters = lr, n_iters' },
        { num: 5, text: '        self.weights, self.bias = None, None', html: '        self.weights, self.bias = <span class="code-keyword">None</span>, <span class="code-keyword">None</span>' },
        { num: 6, text: '    def _sigmoid(self, z):', html: '    <span class="code-keyword">def</span> <span class="code-func">_sigmoid</span>(self, z):' },
        { num: 7, text: '        return 1 / (1 + np.exp(-z))', html: '        <span class="code-keyword">return</span> <span class="code-num">1</span> / (<span class="code-num">1</span> + np.exp(-z))' },
        { num: 8, text: '    def fit(self, X, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X, y):' },
        { num: 9, text: '        n_samples, n_features = X.shape', html: '        n_samples, n_features = X.shape' },
        { num: 10, text: '        self.weights = np.zeros(n_features); self.bias = 0.0', html: '        self.weights = np.zeros(n_features); self.bias = <span class="code-num">0.0</span>' },
        { num: 11, text: '        for _ in range(self.n_iters):', html: '        <span class="code-keyword">for</span> _ <span class="code-keyword">in</span> range(self.n_iters):' },
        { num: 12, text: '            linear_model = np.dot(X, self.weights) + self.bias', html: '            linear_model = np.dot(X, self.weights) + self.bias' },
        { num: 13, text: '            y_predicted = self._sigmoid(linear_model)', html: '            y_predicted = self._sigmoid(linear_model)' },
        { num: 14, text: '            dw = (1 / n_samples) * np.dot(X.T, (y_predicted - y))', html: '            dw = (<span class="code-num">1</span> / n_samples) * np.dot(X.T, (y_predicted - y))' },
        { num: 15, text: '            db = (1 / n_samples) * np.sum(y_predicted - y)', html: '            db = (<span class="code-num">1</span> / n_samples) * np.sum(y_predicted - y)' },
        { num: 16, text: '            self.weights -= self.lr * dw', html: '            self.weights -= self.lr * dw' },
        { num: 17, text: '            self.bias -= self.lr * db', html: '            self.bias -= self.lr * db' },
        { num: 18, text: '    def predict_proba(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">predict_proba</span>(self, X):' },
        { num: 19, text: '        return self._sigmoid(np.dot(X, self.weights) + self.bias)', html: '        <span class="code-keyword">return</span> self._sigmoid(np.dot(X, self.weights) + self.bias)' },
        { num: 20, text: '    def predict(self, X, threshold=0.5):', html: '    <span class="code-keyword">def</span> <span class="code-func">predict</span>(self, X, threshold=<span class="code-num">0.5</span>):' },
        { num: 21, text: '        return (self.predict_proba(X) >= threshold).astype(int)', html: '        <span class="code-keyword">return</span> (self.predict_proba(X) >= threshold).astype(int)' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for vectorized matrix operations and exponential sigmoid activation calculations.", math: "\\text{import numpy as np}" },
        2: { title: "Logistic Regression Class", text: "Encapsulates binary classification using linear combination and Sigmoid activation.", math: "\\mathcal{M}_{\\text{Logistic}}" },
        3: { title: "Logistic Regression Constructor", text: "Sets learning rate lr and gradient descent iteration cap.", math: "\\text{lr} = 0.01, \\quad \\text{n\\_iters} = 1000" },
        4: { title: "Store Hyperparameters", text: "Saves learning rate hyperparameter and iteration count instance attributes.", math: "\\eta = 0.01" },
        5: { title: "Initialize Weight Vector & Bias", text: "Prepares variables to store feature coefficients w and intercept bias b.", math: "\\mathbf{w} = \\text{None}, \\, b = \\text{None}" },
        6: { title: "Sigmoid Activation Function", text: "Defines S-shaped logistics curve mapping real values to probabilities in (0, 1).", math: "\\sigma(z) = \\frac{1}{1 + e^{-z}}" },
        7: { title: "Evaluate Sigmoid Formula", text: "Calculates 1 / (1 + exp(-z)) elementwise across inputs.", math: "P(y=1 \\mid x) = \\sigma(z)" },
        8: { title: "Fit Training Method", text: "Learns weights and bias via Gradient Descent optimization on Binary Cross-Entropy loss.", math: "\\min_{\\mathbf{w}, b} J(\\mathbf{w}, b)" },
        9: { title: "Get Sample and Feature Dimensions", text: "Extracts dataset row sample count N and feature column count P.", math: "N, P = \\text{X.shape}" },
        10: { title: "Initialize Parameters to Zero", text: "Instantiates zero weight vector w and zero scalar bias b.", math: "\\mathbf{w} = \\mathbf{0}, \\, b = 0" },
        11: { title: "Gradient Descent Training Loop", text: "Iteratively updates parameters to minimize log loss.", math: "t = 1, \\dots, \\text{n\\_iters}" },
        12: { title: "Compute Linear Combination (z)", text: "Calculates raw dot product score z = X * w + b for all training samples.", math: "z = \\mathbf{X} \\mathbf{w} + b" },
        13: { title: "Compute Predicted Probabilities (y_hat)", text: "Passes linear score z through Sigmoid function to obtain continuous probability output.", math: "\\hat{\\mathbf{y}} = \\sigma(\\mathbf{X} \\mathbf{w} + b)" },
        14: { title: "Compute Weight Gradient Vector (dw)", text: "Evaluates partial derivative dJ/dw = (1/N) * X^T * (y_hat - y).", math: "\\frac{\\partial J}{\\partial \\mathbf{w}} = \\frac{1}{N} \\mathbf{X}^T (\\hat{\\mathbf{y}} - \\mathbf{y})" },
        15: { title: "Compute Bias Gradient Scalar (db)", text: "Evaluates partial derivative dJ/db = (1/N) * sum(y_hat - y).", math: "\\frac{\\partial J}{\\partial b} = \\frac{1}{N} \\sum_{i=1}^N (\\hat{y}_i - y_i)" },
        16: { title: "Update Weight Parameters", text: "Applies gradient descent step w = w - lr * dw.", math: "\\mathbf{w} \\leftarrow \\mathbf{w} - \\eta \\frac{\\partial J}{\\partial \\mathbf{w}}" },
        17: { title: "Update Intercept Bias Parameter", text: "Applies gradient descent step b = b - lr * db.", math: "b \\leftarrow b - \\eta \\frac{\\partial J}{\\partial b}" },
        18: { title: "Predict Probabilities Method", text: "Outputs continuous calibrated probability scores P(y=1|X) between 0 and 1.", math: "P(y=1 \\mid \\mathbf{X})" },
        19: { title: "Compute Sigmoid Probabilities", text: "Evaluates Sigmoid on dot product of test matrix X.", math: "\\sigma(\\mathbf{X} \\mathbf{w} + b)" },
        20: { title: "Predict Class Labels Method", text: "Converts continuous probabilities into binary discrete class labels (0 or 1).", math: "\\hat{y} \\in \\{0, 1\\}" },
        21: { title: "Apply Threshold Decision Rule", text: "Compares probabilities to decision threshold (default 0.5) to assign final class.", math: "\\hat{y} = \\mathbb{I}(P(y=1 \\mid \\mathbf{x}) \\ge 0.5)" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#818cf8; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(129,140,248,0.15)'}; color:${isLocked ? '#f472b6' : '#818cf8'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(129,140,248,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#818cf8; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
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
                        ${info.why || 'Optimizes decision boundary parameters to maximize binary classification probability.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#818cf8;">
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
            else if (step === 'step2') targetLine = 13;
            else if (step === 'step3') targetLine = 14;
            else if (step === 'step4') targetLine = 21;

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
