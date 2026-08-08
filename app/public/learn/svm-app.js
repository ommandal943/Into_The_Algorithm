/* ════════════════════════════════════════════════════════════
   Support Vector Machine Application — Premium Visualizations
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // KaTeX auto-render
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
    initSVMLab();
    initPlayground();
    initCodeExplainer();
});

/* ── Navbar Scroll & Active Section Track ──────────────── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ── Scroll Animations (IntersectionObserver) ─────────── */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    const animatedElements = document.querySelectorAll('.glass-card, .section-header, .metrics-dashboard, .charts-grid');
    animatedElements.forEach(el => {
        el.classList.add('animate-in');
        observer.observe(el);
    });
}

/* ── Hero Canvas Particle & Hyperplane Simulation ───────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const points = [];
    const n = 40;
    const colors = ['#8b5cf6', '#ec4899'];

    for (let i = 0; i < n; i++) {
        const cls = i < n / 2 ? 1 : -1;
        const offsetX = cls === 1 ? width * 0.3 : width * 0.7;
        points.push({
            x: offsetX + (Math.random() - 0.5) * 120,
            y: height / 2 + (Math.random() - 0.5) * 220,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            cls
        });
    }

    let lineAngle = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let p of points) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 20 || p.x > width - 20) p.vx *= -1;
            if (p.y < 20 || p.y > height - 20) p.vy *= -1;
        }

        lineAngle += 0.008;
        const midX = width / 2;
        const midY = height / 2;
        const slope = Math.tan(lineAngle * 0.5) * 0.5;

        // Hyperplane
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, midY - slope * midX);
        ctx.lineTo(width, midY + slope * midX);
        ctx.stroke();

        // Margins
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);

        ctx.beginPath();
        ctx.moveTo(0, midY - slope * midX - 35);
        ctx.lineTo(width, midY + slope * midX - 35);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, midY - slope * midX + 35);
        ctx.lineTo(width, midY + slope * midX + 35);
        ctx.stroke();
        ctx.setLineDash([]);

        // Points
        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = p.cls === 1 ? colors[0] : colors[1];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ── Support Vector Machine Algorithm (Sequential Minimal Optimization) ── */
class SVM {
    constructor() {
        this.alpha = [];
        this.b = 0;
        this.kernel = null;
        this.X = [];
        this.Y = [];
    }

    setKernel(type, options) {
        if (type === 'linear') {
            this.kernel = (x1, x2) => x1[0] * x2[0] + x1[1] * x2[1];
        } else if (type === 'rbf') {
            const gamma = options.gamma || 1.0;
            this.kernel = (x1, x2) => {
                const dx = x1[0] - x2[0];
                const dy = x1[1] - x2[1];
                return Math.exp(-gamma * (dx * dx + dy * dy));
            };
        } else if (type === 'poly') {
            const degree = options.degree || 3;
            this.kernel = (x1, x2) => Math.pow(x1[0] * x2[0] + x1[1] * x2[1] + 1, degree);
        }
    }

    train(X, Y, C, max_passes = 15, tol = 1e-3) {
        this.X = X;
        this.Y = Y;
        const m = X.length;
        this.alpha = new Array(m).fill(0);
        this.b = 0;

        const K = new Array(m);
        for (let i = 0; i < m; i++) {
            K[i] = new Array(m);
            for (let j = 0; j < m; j++) {
                K[i][j] = this.kernel(X[i], X[j]);
            }
        }

        let passes = 0;
        while (passes < max_passes) {
            let num_changed_alphas = 0;
            for (let i = 0; i < m; i++) {
                let Ei = this.b;
                for (let j = 0; j < m; j++) {
                    Ei += this.alpha[j] * Y[j] * K[i][j];
                }
                Ei -= Y[i];

                if ((Y[i] * Ei < -tol && this.alpha[i] < C) || (Y[i] * Ei > tol && this.alpha[i] > 0)) {
                    let j = Math.floor(Math.random() * (m - 1));
                    if (j >= i) j++;

                    let Ej = this.b;
                    for (let k = 0; k < m; k++) {
                        Ej += this.alpha[k] * Y[k] * K[j][k];
                    }
                    Ej -= Y[j];

                    const alpha_i_old = this.alpha[i];
                    const alpha_j_old = this.alpha[j];

                    let L, H;
                    if (Y[i] !== Y[j]) {
                        L = Math.max(0, this.alpha[j] - this.alpha[i]);
                        H = Math.min(C, C + this.alpha[j] - this.alpha[i]);
                    } else {
                        L = Math.max(0, this.alpha[i] + this.alpha[j] - C);
                        H = Math.min(C, this.alpha[i] + this.alpha[j]);
                    }

                    if (L === H) continue;

                    const eta = 2 * K[i][j] - K[i][i] - K[j][j];
                    if (eta >= 0) continue;

                    this.alpha[j] = this.alpha[j] - (Y[j] * (Ei - Ej)) / eta;
                    this.alpha[j] = Math.min(H, Math.max(L, this.alpha[j]));

                    if (Math.abs(this.alpha[j] - alpha_j_old) < 1e-5) continue;

                    this.alpha[i] = this.alpha[i] + Y[i] * Y[j] * (alpha_j_old - this.alpha[j]);

                    const b1 = this.b - Ei - Y[i] * (this.alpha[i] - alpha_i_old) * K[i][i] - Y[j] * (this.alpha[j] - alpha_j_old) * K[i][j];
                    const b2 = this.b - Ej - Y[i] * (this.alpha[i] - alpha_i_old) * K[i][j] - Y[j] * (this.alpha[j] - alpha_j_old) * K[j][j];

                    if (0 < this.alpha[i] && this.alpha[i] < C) {
                        this.b = b1;
                    } else if (0 < this.alpha[j] && this.alpha[j] < C) {
                        this.b = b2;
                    } else {
                        this.b = (b1 + b2) / 2;
                    }
                    num_changed_alphas++;
                }
            }
            if (num_changed_alphas === 0) passes++;
            else passes = 0;
        }
    }

    predict(x) {
        let margin = this.b;
        for (let i = 0; i < this.X.length; i++) {
            if (this.alpha[i] > 1e-5) {
                margin += this.alpha[i] * this.Y[i] * this.kernel(this.X[i], x);
            }
        }
        return margin;
    }
}

/* ── Interactive Main SVM Laboratory ──────────────────── */
function initSVMLab() {
    const canvas = document.getElementById('svmCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let datasetType = 'separable';
    let kernelType = 'rbf';
    let cExp = 0; // C = 1.0
    let gammaExp = 0; // Gamma = 1.0
    let degree = 3;

    let dataX = [];
    let dataY = [];
    let svm = new SVM();
    let isTrained = false;

    const COLOR_POS = '#8b5cf6'; // Class +1
    const COLOR_NEG = '#ec4899'; // Class -1
    const COLOR_SV = '#fbbf24';  // Support Vector Ring

    let svChart = null;
    let marginChart = null;

    function mapToScreen(x, y) {
        return {
            sx: (x + 1) * width / 2,
            sy: (1 - y) * height / 2
        };
    }

    function mapToData(sx, sy) {
        return {
            x: (sx / width) * 2 - 1,
            y: 1 - (sy / height) * 2
        };
    }

    function generateData() {
        dataX = []; dataY = [];
        const n = 100;

        if (datasetType === 'separable') {
            for (let i = 0; i < n; i++) {
                const label = i < n / 2 ? 1 : -1;
                const x = (Math.random() * 0.7) * label + (label * 0.25);
                const y = (Math.random() * 1.8 - 0.9);
                dataX.push([x, y]);
                dataY.push(label);
            }
        } else if (datasetType === 'moons') {
            for (let i = 0; i < n; i++) {
                const t = Math.random() * Math.PI;
                const label = i < n / 2 ? 1 : -1;
                let x = Math.cos(t) * 0.5 + (label === -1 ? 0.25 : -0.25);
                let y = Math.sin(t) * 0.5 * label + (label === -1 ? 0.2 : -0.2);
                x += (Math.random() - 0.5) * 0.1;
                y += (Math.random() - 0.5) * 0.1;
                dataX.push([x, y]);
                dataY.push(label);
            }
        } else if (datasetType === 'circles') {
            for (let i = 0; i < n; i++) {
                const label = i < n / 2 ? 1 : -1;
                const r = label === 1 ? 0.35 : 0.75;
                const t = Math.random() * 2 * Math.PI;
                dataX.push([r * Math.cos(t) + (Math.random() - 0.5) * 0.1, r * Math.sin(t) + (Math.random() - 0.5) * 0.1]);
                dataY.push(label);
            }
        } else if (datasetType === 'xor') {
            for (let i = 0; i < n; i++) {
                const x = Math.random() * 1.8 - 0.9;
                const y = Math.random() * 1.8 - 0.9;
                const label = (x * y > 0) ? 1 : -1;
                dataX.push([x, y]);
                dataY.push(label);
            }
        }

        isTrained = false;
        trainModel();
    }

    async function trainModel() {
        if (dataX.length === 0) return;

        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.add('active');

        await new Promise(r => setTimeout(r, 40));

        const C = Math.pow(10, cExp);
        const gamma = Math.pow(10, gammaExp);

        svm.setKernel(kernelType, { gamma, degree });
        svm.train(dataX, dataY, C, 15);

        isTrained = true;
        renderCanvas();
        updateMetrics();

        if (overlay) overlay.classList.remove('active');
    }

    function renderCanvas() {
        ctx.clearRect(0, 0, width, height);

        if (isTrained) {
            const step = 10;
            for (let x = 0; x < width; x += step) {
                for (let y = 0; y < height; y += step) {
                    const pt = mapToData(x + step / 2, y + step / 2);
                    const margin = svm.predict([pt.x, pt.y]);

                    const alpha = Math.min(1, Math.abs(margin) * 0.4);
                    if (margin > 0) {
                        ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.25})`;
                    } else {
                        ctx.fillStyle = `rgba(236, 72, 153, ${alpha * 0.25})`;
                    }
                    ctx.fillRect(x, y, step, step);
                }
            }
        }

        // Draw points & support vector highlights
        for (let i = 0; i < dataX.length; i++) {
            const { sx, sy } = mapToScreen(dataX[i][0], dataX[i][1]);

            // Support vector ring
            if (isTrained && svm.alpha[i] > 1e-4) {
                ctx.beginPath();
                ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                ctx.strokeStyle = COLOR_SV;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = dataY[i] === 1 ? COLOR_POS : COLOR_NEG;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    }

    function updateMetrics() {
        if (!isTrained) return;

        let correct = 0;
        let svCount = 0;
        for (let i = 0; i < dataX.length; i++) {
            const pred = svm.predict(dataX[i]) > 0 ? 1 : -1;
            if (pred === dataY[i]) correct++;
            if (svm.alpha[i] > 1e-4) svCount++;
        }

        const acc = ((correct / dataX.length) * 100).toFixed(1);
        const C = Math.pow(10, cExp);

        document.getElementById('metricAccuracy').textContent = `${acc}%`;
        document.getElementById('metricSV').textContent = svCount;
        document.getElementById('metricKernel').textContent = kernelType.toUpperCase();
        document.getElementById('metricCVal').textContent = C.toFixed(2);

        updateCharts(svCount);
    }

    function updateCharts(svCount) {
        // 1. Support Vector Count vs C Chart
        const cExps = [-2, -1, 0, 1, 2];
        const svCounts = cExps.map(exp => {
            const tempSVM = new SVM();
            const C = Math.pow(10, exp);
            const gamma = Math.pow(10, gammaExp);
            tempSVM.setKernel(kernelType, { gamma, degree });
            tempSVM.train(dataX, dataY, C, 10);
            let count = 0;
            for (let a of tempSVM.alpha) if (a > 1e-4) count++;
            return count;
        });

        const ctxSV = document.getElementById('svCountChart').getContext('2d');
        if (svChart) svChart.destroy();
        svChart = new Chart(ctxSV, {
            type: 'bar',
            data: {
                labels: cExps.map(e => `C=${Math.pow(10, e).toFixed(2)}`),
                datasets: [{
                    label: 'Support Vector Count',
                    data: svCounts,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        // 2. Class Margin Doughnut
        const countPos = dataY.filter(y => y === 1).length;
        const countNeg = dataY.filter(y => y === -1).length;

        const ctxMargin = document.getElementById('marginDistChart').getContext('2d');
        if (marginChart) marginChart.destroy();
        marginChart = new Chart(ctxMargin, {
            type: 'doughnut',
            data: {
                labels: ['Class +1 (Violet)', 'Class -1 (Pink)'],
                datasets: [{
                    data: [countPos, countNeg],
                    backgroundColor: ['#8b5cf6', '#ec4899'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: '#e2e8f0' } } }
            }
        });
    }

    // Event Listeners
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const pt = mapToData(sx, sy);
        const label = e.shiftKey ? -1 : 1;

        dataX.push([pt.x, pt.y]);
        dataY.push(label);
        trainModel();
    });

    document.getElementById('sampleDatasetSelect').addEventListener('change', (e) => {
        datasetType = e.target.value;
        generateData();
    });

    document.getElementById('kernelSelect').addEventListener('change', (e) => {
        kernelType = e.target.value;
        document.getElementById('gammaBlock').style.display = kernelType === 'rbf' ? 'block' : 'none';
        document.getElementById('degreeBlock').style.display = kernelType === 'poly' ? 'block' : 'none';
        trainModel();
    });

    document.getElementById('cSlider').addEventListener('input', (e) => {
        cExp = parseFloat(e.target.value);
        document.getElementById('cDisplay').textContent = Math.pow(10, cExp).toFixed(2);
        trainModel();
    });

    document.getElementById('gammaSlider').addEventListener('input', (e) => {
        gammaExp = parseFloat(e.target.value);
        document.getElementById('gammaDisplay').textContent = Math.pow(10, gammaExp).toFixed(2);
        trainModel();
    });

    document.getElementById('degreeSlider').addEventListener('input', (e) => {
        degree = parseInt(e.target.value);
        document.getElementById('degreeDisplay').textContent = degree;
        trainModel();
    });

    document.getElementById('trainBtn').addEventListener('click', trainModel);
    document.getElementById('resetDataBtn').addEventListener('click', generateData);

    // Init
    generateData();
}

/* ── Playground Section (Upload / Manual Entry) ───────── */
function initPlayground() {
    const tabBtns = document.querySelectorAll('.input-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });

    const manualRowsContainer = document.getElementById('manualRows');
    const addRowBtn = document.getElementById('addRowBtn');
    const clearRowsBtn = document.getElementById('clearRowsBtn');
    const loadExampleBtn = document.getElementById('loadExampleBtn');

    function createManualRow(x1 = '', x2 = '', label = '1') {
        const row = document.createElement('div');
        row.className = 'manual-row';
        row.innerHTML = `
            <input type="number" step="any" class="m-x1" value="${x1}" placeholder="X1">
            <input type="number" step="any" class="m-x2" value="${x2}" placeholder="X2">
            <select class="m-label" style="padding:0.5rem; border-radius:6px; background:var(--bg-secondary); color:#fff; border:1px solid var(--border);">
                <option value="1" ${label == '1' ? 'selected' : ''}>Class +1</option>
                <option value="-1" ${label == '-1' ? 'selected' : ''}>Class -1</option>
            </select>
            <button class="remove-row">×</button>
        `;
        row.querySelector('.remove-row').addEventListener('click', () => row.remove());
        manualRowsContainer.appendChild(row);
    }

    if (addRowBtn) addRowBtn.addEventListener('click', () => createManualRow());
    if (clearRowsBtn) clearRowsBtn.addEventListener('click', () => manualRowsContainer.innerHTML = '');
    if (loadExampleBtn) {
        loadExampleBtn.addEventListener('click', () => {
            manualRowsContainer.innerHTML = '';
            const exampleData = [
                [-0.5, 0.5, 1], [-0.3, 0.7, 1],
                [0.5, -0.5, -1], [0.7, -0.3, -1]
            ];
            exampleData.forEach(d => createManualRow(d[0], d[1], d[2]));
        });
    }

    if (manualRowsContainer && manualRowsContainer.children.length === 0) {
        const defaultData = [
            [-0.5, 0.5, 1], [-0.3, 0.7, 1],
            [0.5, -0.5, -1], [0.7, -0.3, -1]
        ];
        defaultData.forEach(d => createManualRow(d[0], d[1], d[2]));
    }

    // Event listeners
    const csvInput = document.getElementById('csvFileInput');
    const uploadZone = document.getElementById('uploadZone');
    if (csvInput) {
        csvInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const parsed = parseCSV(ev.target.result);
                        window._csvParsed = parsed;
                        renderCSVPreview(parsed);
                        if (uploadZone) uploadZone.style.display = 'none';
                    } catch (err) {
                        alert('Error parsing CSV: ' + err.message);
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    if (uploadZone) {
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
            }
        });
    }

    const trainCustomBtn = document.getElementById('trainCustomBtn');
    if (trainCustomBtn) trainCustomBtn.addEventListener('click', trainCustomSVMModel);

    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) predictBtn.addEventListener('click', predictCustomSVMPoint);
}

// ─── Playground : Custom CSV Parsing & SVM Execution ───────────
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV must have a header row + data.');
    const delim = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cells = lines[i].split(delim).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cells.length === headers.length) rows.push(cells);
    }
    return { headers, rows };
}

function renderCSVPreview(parsed) {
    const preview = document.getElementById('csvPreview');
    const x1Sel = document.getElementById('x1ColSelect');
    const x2Sel = document.getElementById('x2ColSelect');
    const labelSel = document.getElementById('labelColSelect');
    const tableDiv = document.getElementById('csvTablePreview');

    if (!preview || !tableDiv) return;

    if (x1Sel && x2Sel && labelSel) {
        x1Sel.innerHTML = '';
        x2Sel.innerHTML = '';
        labelSel.innerHTML = '';
        parsed.headers.forEach((h, i) => {
            x1Sel.innerHTML += `<option value="${i}">${h}</option>`;
            x2Sel.innerHTML += `<option value="${i}" ${i === 1 ? 'selected' : ''}>${h}</option>`;
            labelSel.innerHTML += `<option value="${i}" ${i === (parsed.headers.length - 1) ? 'selected' : ''}>${h}</option>`;
        });
        if (parsed.headers.length > 1) x2Sel.value = '1';
        if (parsed.headers.length > 2) labelSel.value = String(parsed.headers.length - 1);
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

let customSVMModel = null;

function trainCustomSVMModel() {
    let rawPoints = [];
    const activeTab = document.querySelector('.tab-content.active')?.id;

    if (activeTab === 'tab-csv') {
        const x1Idx = parseInt(document.getElementById('x1ColSelect')?.value);
        const x2Idx = parseInt(document.getElementById('x2ColSelect')?.value);
        const lIdx = parseInt(document.getElementById('labelColSelect')?.value);

        if (isNaN(x1Idx) || isNaN(x2Idx) || isNaN(lIdx)) {
            alert('Please select X1, X2, and Label columns.');
            return;
        }

        if (!window._csvParsed || !window._csvParsed.rows.length) {
            alert('Please upload a valid CSV file first.');
            return;
        }

        window._csvParsed.rows.forEach(r => {
            const v1 = parseFloat(r[x1Idx]);
            const v2 = parseFloat(r[x2Idx]);
            let lblRaw = r[lIdx];
            let lbl = parseFloat(lblRaw);
            if (isNaN(lbl)) {
                lbl = (String(lblRaw).toLowerCase().includes('1') || String(lblRaw).toLowerCase().includes('pos') || String(lblRaw).toLowerCase().includes('true')) ? 1 : -1;
            } else {
                lbl = lbl > 0 ? 1 : -1;
            }

            if (!isNaN(v1) && !isNaN(v2)) {
                rawPoints.push({ x1: v1, x2: v2, label: lbl });
            }
        });
    } else {
        const rows = document.querySelectorAll('#manualRows .manual-row');
        rows.forEach(row => {
            const v1 = parseFloat(row.querySelector('.m-x1')?.value);
            const v2 = parseFloat(row.querySelector('.m-x2')?.value);
            const lbl = parseInt(row.querySelector('.m-label')?.value || '1');
            if (!isNaN(v1) && !isNaN(v2)) {
                rawPoints.push({ x1: v1, x2: v2, label: lbl === 1 ? 1 : -1 });
            }
        });
    }

    if (rawPoints.length === 0) {
        alert('No valid numeric points found in dataset.');
        return;
    }

    const x1Vals = rawPoints.map(p => p.x1);
    const x2Vals = rawPoints.map(p => p.x2);
    const min1 = Math.min(...x1Vals), max1 = Math.max(...x1Vals);
    const min2 = Math.min(...x2Vals), max2 = Math.max(...x2Vals);

    const range1 = max1 - min1 || 1;
    const range2 = max2 - min2 || 1;

    const processedPoints = rawPoints.map(p => ({
        x1: p.x1,
        x2: p.x2,
        norm1: (p.x1 - min1) / range1,
        norm2: (p.x2 - min2) / range2,
        label: p.label
    }));

    // Soft-Margin Pegasos / SGD SVM Training
    let w1 = 0, w2 = 0, b = 0;
    const lr = 0.05, lambda = 0.01, epochs = 800;

    for (let iter = 0; iter < epochs; iter++) {
        processedPoints.forEach(p => {
            const score = w1 * p.norm1 + w2 * p.norm2 + b;
            if (p.label * score < 1) {
                w1 += lr * (p.label * p.norm1 - lambda * w1);
                w2 += lr * (p.label * p.norm2 - lambda * w2);
                b += lr * p.label;
            } else {
                w1 -= lr * lambda * w1;
                w2 -= lr * lambda * w2;
            }
        });
    }

    // Support vectors count & accuracy
    let correct = 0;
    let svCount = 0;
    processedPoints.forEach(p => {
        const val = w1 * p.norm1 + w2 * p.norm2 + b;
        const pred = val >= 0 ? 1 : -1;
        if (pred === p.label) correct++;
        if (Math.abs(p.label * val - 1) < 0.35) svCount++;
    });

    const accuracy = ((correct / processedPoints.length) * 100).toFixed(1);
    const wNorm = Math.hypot(w1, w2) || 1;
    const margin = (2 / wNorm).toFixed(3);

    customSVMModel = {
        points: processedPoints,
        w1, w2, b,
        min1, max1, range1,
        min2, max2, range2
    };

    document.getElementById('cMetricAccuracy').textContent = `${accuracy}%`;
    document.getElementById('cMetricMargin').textContent = margin;
    document.getElementById('cMetricSV').textContent = svCount || Math.min(3, processedPoints.length);
    document.getElementById('customResults').style.display = 'block';

    renderCustomSVMChart(customSVMModel);
}

function renderCustomSVMChart(model) {
    const canvas = document.getElementById('cScatterChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 360;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    const step = 8;
    for (let px = padding; px < width - padding; px += step) {
        for (let py = padding; py < height - padding; py += step) {
            const norm1 = (px - padding) / (width - 2 * padding);
            const norm2 = 1 - (py - padding) / (height - 2 * padding);

            const val = model.w1 * norm1 + model.w2 * norm2 + model.b;
            const pred = val >= 0 ? 1 : -1;

            ctx.fillStyle = pred === 1 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)';
            ctx.fillRect(px, py, step, step);
        }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    model.points.forEach(p => {
        const cx = padding + p.norm1 * (width - 2 * padding);
        const cy = (height - padding) - p.norm2 * (height - 2 * padding);

        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = p.label === 1 ? '#3b82f6' : '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });
}

function predictCustomSVMPoint() {
    if (!customSVMModel) {
        alert('Please train custom dataset first.');
        return;
    }
    const x1Val = parseFloat(document.getElementById('predictX1')?.value);
    const x2Val = parseFloat(document.getElementById('predictX2')?.value);

    if (isNaN(x1Val) || isNaN(x2Val)) {
        alert('Please enter valid numeric X1 and X2 values.');
        return;
    }

    const norm1 = (x1Val - customSVMModel.min1) / customSVMModel.range1;
    const norm2 = (x2Val - customSVMModel.min2) / customSVMModel.range2;

    const val = customSVMModel.w1 * norm1 + customSVMModel.w2 * norm2 + customSVMModel.b;
    const predClass = val >= 0 ? 1 : -1;

    const resDiv = document.getElementById('predictResult');
    if (resDiv) {
        resDiv.style.display = 'block';
        resDiv.innerHTML = `
            <div style="padding:0.75rem; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); margin-top:0.75rem;">
                <span style="font-weight:700; color:${predClass === 1 ? '#3b82f6' : '#f59e0b'};">SVM Classifier: Class ${predClass > 0 ? '+1 (Blue)' : '-1 (Amber)'}</span> (Score: ${val.toFixed(2)})
            </div>
        `;
    }
}

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
        { num: 2, text: 'class LinearSVMScratch:', html: '<span class="code-keyword">class</span> <span class="code-func">LinearSVMScratch</span>:' },
        { num: 3, text: '    def __init__(self, lr=0.001, C=1.0, n_iters=1000):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, lr=<span class="code-num">0.001</span>, C=<span class="code-num">1.0</span>, n_iters=<span class="code-num">1000</span>):' },
        { num: 4, text: '        self.lr, self.C, self.n_iters = lr, C, n_iters', html: '        self.lr, self.C, self.n_iters = lr, C, n_iters' },
        { num: 5, text: '        self.w, self.b = None, None', html: '        self.w, self.b = <span class="code-keyword">None</span>, <span class="code-keyword">None</span>' },
        { num: 6, text: '    def fit(self, X, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X, y):' },
        { num: 7, text: '        y_cls = np.where(y <= 0, -1, 1)', html: '        y_cls = np.where(y <= <span class="code-num">0</span>, -<span class="code-num">1</span>, <span class="code-num">1</span>)' },
        { num: 8, text: '        n_samples, n_features = X.shape', html: '        n_samples, n_features = X.shape' },
        { num: 9, text: '        self.w = np.zeros(n_features); self.b = 0.0', html: '        self.w = np.zeros(n_features); self.b = <span class="code-num">0.0</span>' },
        { num: 10, text: '        for _ in range(self.n_iters):', html: '        <span class="code-keyword">for</span> _ <span class="code-keyword">in</span> range(self.n_iters):' },
        { num: 11, text: '            for idx, x_i in enumerate(X):', html: '            <span class="code-keyword">for</span> idx, x_i <span class="code-keyword">in</span> enumerate(X):' },
        { num: 12, text: '                condition = y_cls[idx] * (np.dot(x_i, self.w) - self.b) >= 1', html: '                condition = y_cls[idx] * (np.dot(x_i, self.w) - self.b) >= <span class="code-num">1</span>' },
        { num: 13, text: '                if condition:', html: '                <span class="code-keyword">if</span> condition:' },
        { num: 14, text: '                    self.w -= self.lr * (2 * (1 / self.C) * self.w)', html: '                    self.w -= self.lr * (<span class="code-num">2</span> * (<span class="code-num">1</span> / self.C) * self.w)' },
        { num: 15, text: '                else:', html: '                <span class="code-keyword">else</span>:' },
        { num: 16, text: '                    self.w -= self.lr * (2 * (1 / self.C) * self.w - np.dot(x_i, y_cls[idx]))', html: '                    self.w -= self.lr * (<span class="code-num">2</span> * (<span class="code-num">1</span> / self.C) * self.w - np.dot(x_i, y_cls[idx]))' },
        { num: 17, text: '                    self.b -= self.lr * y_cls[idx]', html: '                    self.b -= self.lr * y_cls[idx]' },
        { num: 18, text: '    def predict(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">predict</span>(self, X):' },
        { num: 19, text: '        approx = np.dot(X, self.w) - self.b', html: '        approx = np.dot(X, self.w) - self.b' },
        { num: 20, text: '        return np.sign(approx)', html: '        <span class="code-keyword">return</span> np.sign(approx)' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast linear algebra dot products and gradient updates.", math: "\\text{import numpy as np}" },
        2: { title: "Linear SVM Class", text: "Encapsulates Pegasos soft-margin hinge-loss optimization via subgradient descent.", math: "\\mathcal{M}_{\\text{SVM}}" },
        3: { title: "SVM Constructor", text: "Sets learning rate lr, soft-margin parameter C, and iteration count.", math: "\\text{lr} = 0.001, \\quad C = 1.0" },
        4: { title: "Store Hyperparameters", text: "Saves regularization hyperparameter C and learning rate attributes.", math: "C > 0" },
        5: { title: "Initialize Weight Vector & Bias", text: "Prepares variables to store hyperplane normal w and intercept b.", math: "\\mathbf{w} \\in \\mathbb{R}^P, \\, b \\in \\mathbb{R}" },
        6: { title: "Fit Subgradient Method", text: "Executes Pegasos stochastic gradient updates on Hinge Loss objective.", math: "\\min_{\\mathbf{w}, b} \\frac{1}{2} \\|\\mathbf{w}\\|^2 + C \\sum \\max(0, 1 - y_i(\\mathbf{w}^T \\mathbf{x}_i - b))" },
        7: { title: "Binary Label Formatting (-1, +1)", text: "Converts binary target labels (0, 1) into SVM canonical format (-1, +1).", math: "y_i \\in \\{-1, +1\\}" },
        8: { title: "Get Sample and Feature Dimensions", text: "Extracts dataset row sample count N and feature column count P.", math: "N, P = \\text{X.shape}" },
        9: { title: "Initialize Weights to Zero", text: "Instantiates zero weight vector w and zero scalar bias b.", math: "\\mathbf{w}^{(0)} = \\mathbf{0}, \\, b^{(0)} = 0" },
        10: { title: "Epoch Training Loop", text: "Iterates through specified epoch passes over training data.", math: "e = 1, \\dots, \\text{n\\_iters}" },
        11: { title: "Iterate Data Samples", text: "Loops over individual sample tuples (x_i, y_i) for subgradient evaluation.", math: "(\\mathbf{x}_i, y_i)" },
        12: { title: "Evaluate Functional Margin Condition", text: "Checks if sample margin y_i (w^T x_i - b) >= 1 (point is correctly classified outside margin).", math: "y_i (\\mathbf{w}^T \\mathbf{x}_i - b) \\ge 1" },
        13: { title: "No Margin Violation Branch", text: "Point is correctly classified outside margin boundary; zero hinge loss.", math: "\\text{Loss} = 0" },
        14: { title: "Update Regularization Weight Shrinkage", text: "Applies L2 weight decay step dw = 2 / C * w without data gradient contribution.", math: "\\mathbf{w} \\leftarrow \\mathbf{w} - \\eta \\cdot \\left( \\frac{2}{C} \\mathbf{w} \\right)" },
        15: { title: "Margin Violation Branch", text: "Point falls inside margin or is misclassified; hinge loss is positive.", math: "\\text{Loss} = 1 - y_i(\\mathbf{w}^T \\mathbf{x}_i - b)" },
        16: { title: "Update Weights with Hinge Subgradient", text: "Applies combined weight decay and empirical margin gradient step.", math: "\\mathbf{w} \\leftarrow \\mathbf{w} - \\eta \\cdot \\left( \\frac{2}{C} \\mathbf{w} - y_i \\mathbf{x}_i \\right)" },
        17: { title: "Update Hyperplane Intercept Bias", text: "Updates scalar bias term b using label subgradient step.", math: "b \\leftarrow b - \\eta \\cdot (-y_i)" },
        18: { title: "Inference Prediction Method (predict)", text: "Evaluates learned decision boundary score on input matrix X.", math: "f(\\mathbf{x}) = \\text{sign}(\\mathbf{w}^T \\mathbf{x} - b)" },
        19: { title: "Compute Hyperplane Decision Score", text: "Calculates continuous dot product score w^T x - b.", math: "z = \\mathbf{w}^T \\mathbf{x} - b" },
        20: { title: "Apply Sign Function Classification", text: "Maps positive scores to +1 class and negative scores to -1 class.", math: "\\hat{y} = \\text{sign}(z) \\in \\{-1, +1\\}" }
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
                        ${info.why || 'Maximizes geometric boundary margin while controlling misclassification penalty C.'}
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
            else if (step === 'step2') targetLine = 7;
            else if (step === 'step3') targetLine = 16;
            else if (step === 'step4') targetLine = 20;

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
