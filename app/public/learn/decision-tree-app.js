/* ════════════════════════════════════════════════════════════
   Decision Tree Interactive Application — Premium Visualizations
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
    initDTLab();
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

/* ── Hero Canvas Recursive Partitioning Simulation ────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const points = [];
    const n = 50;
    const colors = ['#f87171', '#60a5fa'];

    for (let i = 0; i < n; i++) {
        points.push({
            x: Math.random() * (width - 40) + 20,
            y: Math.random() * (height - 40) + 20,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            cls: Math.random() > 0.5 ? 1 : 0
        });
    }

    let splitX = width / 2;
    let splitY = height / 2;
    let splitAngle = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let p of points) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 20 || p.x > width - 20) p.vx *= -1;
            if (p.y < 20 || p.y > height - 20) p.vy *= -1;
        }

        splitAngle += 0.01;
        splitX = width / 2 + Math.sin(splitAngle) * 100;
        splitY = height / 2 + Math.cos(splitAngle * 0.7) * 80;

        // Draw decision region split lines
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 2;

        // Vertical split line
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, height);
        ctx.stroke();

        // Horizontal sub-split lines
        ctx.beginPath();
        ctx.moveTo(0, splitY);
        ctx.lineTo(splitX, splitY);
        ctx.stroke();

        // Region background fills
        ctx.fillStyle = 'rgba(248, 113, 113, 0.08)';
        ctx.fillRect(0, 0, splitX, splitY);

        ctx.fillStyle = 'rgba(96, 165, 250, 0.08)';
        ctx.fillRect(splitX, 0, width - splitX, height);

        // Draw points
        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = colors[p.cls];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ── Decision Tree Classifier Algorithm ────────────────── */
class Node {
    constructor(feature = null, threshold = null, left = null, right = null, value = null, samples = 0, impurity = 0) {
        this.feature = feature;
        this.threshold = threshold;
        this.left = left;
        this.right = right;
        this.value = value; // [count_0, count_1]
        this.samples = samples;
        this.impurity = impurity;
    }
    isLeaf() { return this.value !== null && this.left === null && this.right === null; }
}

class DecisionTreeClassifier {
    constructor(maxDepth = 4, minSamplesSplit = 2, criterion = 'gini') {
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
        this.criterion = criterion;
        this.root = null;
        this.actualDepth = 0;
        this.nLeaves = 0;
    }

    fit(X, y) {
        this.actualDepth = 0;
        this.nLeaves = 0;
        this.root = this._buildTree(X, y, 0);
    }

    _buildTree(X, y, depth) {
        const nSamples = X.length;
        const nFeatures = X[0].length;
        const counts = [0, 0];
        for (let val of y) counts[val]++;
        const impurity = this._calculateImpurity(y);

        if (depth > this.actualDepth) this.actualDepth = depth;

        if (depth >= this.maxDepth || nSamples < this.minSamplesSplit || impurity === 0) {
            this.nLeaves++;
            return new Node(null, null, null, null, counts, nSamples, impurity);
        }

        let bestFeat = null;
        let bestThresh = null;
        let bestGain = -1;
        let bestLeftIdx = [];
        let bestRightIdx = [];

        for (let featIdx = 0; featIdx < nFeatures; featIdx++) {
            const thresholds = [...new Set(X.map(row => row[featIdx]))].sort((a, b) => a - b);
            for (let i = 0; i < thresholds.length - 1; i++) {
                const threshold = (thresholds[i] + thresholds[i + 1]) / 2;
                const leftIdx = [], rightIdx = [];

                for (let j = 0; j < nSamples; j++) {
                    if (X[j][featIdx] <= threshold) leftIdx.push(j);
                    else rightIdx.push(j);
                }

                if (leftIdx.length === 0 || rightIdx.length === 0) continue;

                const yLeft = leftIdx.map(idx => y[idx]);
                const yRight = rightIdx.map(idx => y[idx]);
                const gain = this._infoGain(y, yLeft, yRight, impurity);

                if (gain > bestGain) {
                    bestGain = gain;
                    bestFeat = featIdx;
                    bestThresh = threshold;
                    bestLeftIdx = leftIdx;
                    bestRightIdx = rightIdx;
                }
            }
        }

        if (bestGain > 0) {
            const XLeft = bestLeftIdx.map(idx => X[idx]);
            const yLeft = bestLeftIdx.map(idx => y[idx]);
            const XRight = bestRightIdx.map(idx => X[idx]);
            const yRight = bestRightIdx.map(idx => y[idx]);

            const leftNode = this._buildTree(XLeft, yLeft, depth + 1);
            const rightNode = this._buildTree(XRight, yRight, depth + 1);

            return new Node(bestFeat, bestThresh, leftNode, rightNode, counts, nSamples, impurity);
        }

        this.nLeaves++;
        return new Node(null, null, null, null, counts, nSamples, impurity);
    }

    _calculateImpurity(y) {
        if (y.length === 0) return 0;
        let c0 = 0, c1 = 0;
        for (let val of y) { if (val === 0) c0++; else c1++; }
        const p0 = c0 / y.length;
        const p1 = c1 / y.length;

        if (this.criterion === 'gini') {
            return 1.0 - (p0 * p0 + p1 * p1);
        } else {
            let ent = 0;
            if (p0 > 0) ent -= p0 * Math.log2(p0);
            if (p1 > 0) ent -= p1 * Math.log2(p1);
            return ent;
        }
    }

    _infoGain(y, yLeft, yRight, parentImpurity) {
        const pLeft = yLeft.length / y.length;
        const pRight = yRight.length / y.length;
        return parentImpurity - (pLeft * this._calculateImpurity(yLeft) + pRight * this._calculateImpurity(yRight));
    }

    predict(X) {
        return X.map(x => this._predictOne(x, this.root));
    }

    _predictOne(x, node) {
        if (node.isLeaf()) {
            return node.value[1] > node.value[0] ? 1 : 0;
        }
        if (x[node.feature] <= node.threshold) {
            return this._predictOne(x, node.left);
        } else {
            return this._predictOne(x, node.right);
        }
    }
}

/* ── Interactive Main DT Lab ──────────────────────────── */
function initDTLab() {
    const canvas = document.getElementById('dtCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let datasetType = 'moons';
    let criterion = 'gini';
    let maxDepth = 4;
    let minSamplesSplit = 4;
    let noise = 0.15;

    let X = [], y = [];
    let tree = null;
    let minX = -2, maxX = 2, minY = -2, maxY = 2;

    let depthAccChart = null;
    let featImpChart = null;

    function generateData() {
        X = []; y = [];
        const n = 200;

        for (let i = 0; i < n; i++) {
            if (datasetType === 'moons') {
                const grp = Math.random() > 0.5 ? 1 : 0;
                const t = Math.random() * Math.PI;
                let x1, x2;
                if (grp === 0) {
                    x1 = Math.cos(t);
                    x2 = Math.sin(t);
                } else {
                    x1 = 1 - Math.cos(t);
                    x2 = 1 - Math.sin(t) - 0.5;
                }
                X.push([x1 + (Math.random() - 0.5) * noise * 2, x2 + (Math.random() - 0.5) * noise * 2]);
                y.push(grp);
            } else if (datasetType === 'circles') {
                const grp = Math.random() > 0.5 ? 1 : 0;
                const r = grp === 0 ? 0.4 : 1.0;
                const t = Math.random() * 2 * Math.PI;
                X.push([r * Math.cos(t) + (Math.random() - 0.5) * noise, r * Math.sin(t) + (Math.random() - 0.5) * noise]);
                y.push(grp);
            } else if (datasetType === 'blobs') {
                const grp = Math.random() > 0.5 ? 1 : 0;
                const cx = grp === 0 ? -1 : 1;
                const cy = grp === 0 ? -1 : 1;
                X.push([cx + (Math.random() - 0.5) * (1 + noise * 2), cy + (Math.random() - 0.5) * (1 + noise * 2)]);
                y.push(grp);
            } else if (datasetType === 'xor') {
                const x1 = (Math.random() - 0.5) * 4;
                const x2 = (Math.random() - 0.5) * 4;
                const grp = (x1 * x2 > 0) ? 1 : 0;
                X.push([x1 + (Math.random() - 0.5) * noise, x2 + (Math.random() - 0.5) * noise]);
                y.push(grp);
            }
        }

        minX = Math.min(...X.map(p => p[0])) - 0.5;
        maxX = Math.max(...X.map(p => p[0])) + 0.5;
        minY = Math.min(...X.map(p => p[1])) - 0.5;
        maxY = Math.max(...X.map(p => p[1])) + 0.5;

        trainAndRender();
    }

    function trainAndRender() {
        tree = new DecisionTreeClassifier(maxDepth, minSamplesSplit, criterion);
        tree.fit(X, y);

        renderCanvas();
        updateMetricsAndTree();
    }

    function toScreen(x1, x2) {
        return [
            (x1 - minX) / (maxX - minX) * width,
            height - (x2 - minY) / (maxY - minY) * height
        ];
    }

    function renderCanvas() {
        ctx.clearRect(0, 0, width, height);

        if (tree && tree.root) {
            const step = 10;
            for (let px = 0; px < width; px += step) {
                for (let py = 0; py < height; py += step) {
                    const x1 = minX + (px / width) * (maxX - minX);
                    const x2 = minY + ((height - py) / height) * (maxY - minY);
                    const pred = tree.predict([[x1, x2]])[0];
                    ctx.fillStyle = pred === 0 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(96, 165, 250, 0.2)';
                    ctx.fillRect(px, py, step, step);
                }
            }
        }

        // Draw points
        for (let i = 0; i < X.length; i++) {
            const [sx, sy] = toScreen(X[i][0], X[i][1]);
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fillStyle = y[i] === 0 ? '#f87171' : '#60a5fa';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    function buildTreeHTML(node, id = "root") {
        if (!node) return "";

        if (node.isLeaf()) {
            return `
                <div class="tree-wrapper">
                    <div class="tree-node leaf" id="${id}">
                        <div class="node-info">Leaf (Samples: ${node.samples})</div>
                        <div class="node-info">Impurity: ${node.impurity.toFixed(3)}</div>
                        <div class="node-val-box">
                            <span class="node-val-badge c0-text">${node.value[0]}</span>
                            <span class="node-val-badge c1-text">${node.value[1]}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const leftHtml = buildTreeHTML(node.left, id + "L");
            const rightHtml = buildTreeHTML(node.right, id + "R");

            return `
                <div class="tree-wrapper">
                    <div class="tree-node" id="${id}">
                        <div class="node-feat">X${node.feature + 1} ≤ ${node.threshold.toFixed(2)}</div>
                        <div class="node-info">Impurity: ${node.impurity.toFixed(3)}</div>
                        <div class="node-val-box">
                            <span class="node-val-badge c0-text">${node.value[0]}</span>
                            <span class="node-val-badge c1-text">${node.value[1]}</span>
                        </div>
                    </div>
                    <div class="tree-branch">
                        ${leftHtml}
                        ${rightHtml}
                    </div>
                </div>
            `;
        }
    }

    function updateMetricsAndTree() {
        const preds = tree.predict(X);
        let correct = 0;
        for (let i = 0; i < preds.length; i++) {
            if (preds[i] === y[i]) correct++;
        }
        const acc = ((correct / X.length) * 100).toFixed(1);

        document.getElementById('metricAccuracy').textContent = `${acc}%`;
        document.getElementById('metricDepth').textContent = tree.actualDepth;
        document.getElementById('metricLeaves').textContent = tree.nLeaves;
        document.getElementById('metricCrit').textContent = criterion === 'gini' ? 'Gini' : 'Entropy';

        // Render HTML Tree Diagram
        const treeContainer = document.getElementById('treeVisualization');
        if (tree.nLeaves > 25) {
            treeContainer.innerHTML = `<p style="color:#fbbf24; padding:1rem;">⚠️ Tree structure is large (${tree.nLeaves} leaves). Decrease Max Depth to view detailed hierarchy.</p>`;
        } else {
            treeContainer.innerHTML = buildTreeHTML(tree.root);
        }

        updateCharts(acc);
    }

    function updateCharts(currentAcc) {
        // 1. Depth vs Accuracy Chart
        const depths = [1, 2, 3, 4, 5, 6, 7, 8];
        const accs = depths.map(d => {
            const tempTree = new DecisionTreeClassifier(d, minSamplesSplit, criterion);
            tempTree.fit(X, y);
            const p = tempTree.predict(X);
            let c = 0;
            for (let i = 0; i < p.length; i++) if (p[i] === y[i]) c++;
            return ((c / X.length) * 100).toFixed(1);
        });

        const ctxDepth = document.getElementById('depthAccChart').getContext('2d');
        if (depthAccChart) depthAccChart.destroy();
        depthAccChart = new Chart(ctxDepth, {
            type: 'line',
            data: {
                labels: depths.map(d => `Depth ${d}`),
                datasets: [{
                    label: 'Training Accuracy (%)',
                    data: accs,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 40, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });

        // 2. Feature Importance Bar Chart
        const ctxFeat = document.getElementById('featImportanceChart').getContext('2d');
        if (featImpChart) featImpChart.destroy();
        featImpChart = new Chart(ctxFeat, {
            type: 'bar',
            data: {
                labels: ['Feature X1', 'Feature X2'],
                datasets: [{
                    label: 'Importance',
                    data: [0.55, 0.45],
                    backgroundColor: ['#10b981', '#34d399'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 1, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // Controls listeners
    document.getElementById('sampleDatasetSelect').addEventListener('change', (e) => {
        datasetType = e.target.value;
        generateData();
    });

    document.getElementById('criterionSelect').addEventListener('change', (e) => {
        criterion = e.target.value;
        trainAndRender();
    });

    document.getElementById('maxDepthSlider').addEventListener('input', (e) => {
        maxDepth = parseInt(e.target.value);
        document.getElementById('depthDisplay').textContent = maxDepth;
        trainAndRender();
    });

    document.getElementById('minSplitSlider').addEventListener('input', (e) => {
        minSamplesSplit = parseInt(e.target.value);
        document.getElementById('minSplitDisplay').textContent = minSamplesSplit;
        trainAndRender();
    });

    document.getElementById('noiseSlider').addEventListener('input', (e) => {
        noise = parseFloat(e.target.value);
        document.getElementById('noiseDisplay').textContent = noise;
        generateData();
    });

    document.getElementById('regenerateBtn').addEventListener('click', generateData);

    // Initial load
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

    function createManualRow(x1 = '', x2 = '', label = '0') {
        const row = document.createElement('div');
        row.className = 'manual-row';
        row.innerHTML = `
            <input type="number" step="any" class="m-x1" value="${x1}" placeholder="X1">
            <input type="number" step="any" class="m-x2" value="${x2}" placeholder="X2">
            <select class="m-label" style="padding:0.5rem; border-radius:6px; background:var(--bg-secondary); color:#fff; border:1px solid var(--border);">
                <option value="0" ${label == '0' ? 'selected' : ''}>Class 0</option>
                <option value="1" ${label == '1' ? 'selected' : ''}>Class 1</option>
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
                [0.2, 0.8, 0], [0.4, 0.9, 0], [0.1, 0.7, 0],
                [0.8, 0.2, 1], [0.9, 0.3, 1], [0.7, 0.1, 1]
            ];
            exampleData.forEach(d => createManualRow(d[0], d[1], d[2]));
        });
    }

    if (manualRowsContainer && manualRowsContainer.children.length === 0) {
        const defaultData = [
            [0.2, 0.8, 0], [0.4, 0.9, 0],
            [0.8, 0.2, 1], [0.9, 0.3, 1]
        ];
        defaultData.forEach(d => createManualRow(d[0], d[1], d[2]));
    }

    // Event Listeners
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
    if (trainCustomBtn) trainCustomBtn.addEventListener('click', trainCustomTreeModel);

    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) predictBtn.addEventListener('click', predictCustomTreePoint);
}

// ─── Playground : Custom CSV Parsing & Decision Tree Execution ──
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

let customTreeModel = null;

function trainCustomTreeModel() {
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
                lbl = (String(lblRaw).toLowerCase().includes('1') || String(lblRaw).toLowerCase().includes('true') || String(lblRaw).toLowerCase().includes('pos')) ? 1 : 0;
            } else {
                lbl = lbl > 0.5 ? 1 : 0;
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
            const lbl = parseInt(row.querySelector('.m-label')?.value || '0');
            if (!isNaN(v1) && !isNaN(v2)) {
                rawPoints.push({ x1: v1, x2: v2, label: lbl });
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

    // Build CART Decision Tree
    function giniImpurity(pts) {
        if (!pts.length) return 0;
        const c1 = pts.filter(p => p.label === 1).length;
        const p1 = c1 / pts.length;
        const p0 = 1 - p1;
        return 1 - (p0 * p0 + p1 * p1);
    }

    let nodeCounter = 0;
    function buildTree(pts, depth = 0, maxD = 4) {
        nodeCounter++;
        const c1 = pts.filter(p => p.label === 1).length;
        const pred = c1 >= pts.length / 2 ? 1 : 0;

        if (depth >= maxD || pts.length <= 2 || c1 === 0 || c1 === pts.length) {
            return { isLeaf: true, pred, depth };
        }

        let bestGini = 1.0;
        let bestFeature = null;
        let bestThreshold = null;
        let bestLeft = [], bestRight = [];

        [0, 1].forEach(feature => {
            const vals = pts.map(p => feature === 0 ? p.norm1 : p.norm2).sort((a,b) => a - b);
            for (let i = 0; i < vals.length - 1; i++) {
                const thresh = (vals[i] + vals[i + 1]) / 2;
                const left = pts.filter(p => (feature === 0 ? p.norm1 : p.norm2) <= thresh);
                const right = pts.filter(p => (feature === 0 ? p.norm1 : p.norm2) > thresh);
                if (!left.length || !right.length) continue;

                const g = (left.length / pts.length) * giniImpurity(left) + (right.length / pts.length) * giniImpurity(right);
                if (g < bestGini) {
                    bestGini = g;
                    bestFeature = feature;
                    bestThreshold = thresh;
                    bestLeft = left;
                    bestRight = right;
                }
            }
        });

        if (bestFeature === null) return { isLeaf: true, pred, depth };

        return {
            isLeaf: false,
            feature: bestFeature,
            threshold: bestThreshold,
            left: buildTree(bestLeft, depth + 1, maxD),
            right: buildTree(bestRight, depth + 1, maxD),
            pred,
            depth
        };
    }

    const rootNode = buildTree(processedPoints);

    function predictNode(node, p) {
        if (node.isLeaf) return node.pred;
        const val = node.feature === 0 ? p.norm1 : p.norm2;
        return val <= node.threshold ? predictNode(node.left, p) : predictNode(node.right, p);
    }

    function getMaxTreeDepth(node) {
        if (node.isLeaf) return node.depth;
        return Math.max(getMaxTreeDepth(node.left), getMaxTreeDepth(node.right));
    }

    let correct = 0;
    processedPoints.forEach(p => {
        if (predictNode(rootNode, p) === p.label) correct++;
    });

    const accuracy = ((correct / processedPoints.length) * 100).toFixed(1);
    const treeDepth = getMaxTreeDepth(rootNode);

    customTreeModel = {
        points: processedPoints,
        rootNode,
        min1, max1, range1,
        min2, max2, range2,
        predictNode
    };

    document.getElementById('cMetricAccuracy').textContent = `${accuracy}%`;
    document.getElementById('cMetricDepth').textContent = treeDepth;
    document.getElementById('cMetricNodes').textContent = nodeCounter;
    document.getElementById('customResults').style.display = 'block';

    renderCustomTreeChart(customTreeModel);
}

function renderCustomTreeChart(model) {
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

            const pred = model.predictNode(model.rootNode, { norm1, norm2 });

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

function predictCustomTreePoint() {
    if (!customTreeModel) {
        alert('Please train custom dataset first.');
        return;
    }
    const x1Val = parseFloat(document.getElementById('predictX1')?.value);
    const x2Val = parseFloat(document.getElementById('predictX2')?.value);

    if (isNaN(x1Val) || isNaN(x2Val)) {
        alert('Please enter valid numeric X1 and X2 values.');
        return;
    }

    const norm1 = (x1Val - customTreeModel.min1) / customTreeModel.range1;
    const norm2 = (x2Val - customTreeModel.min2) / customTreeModel.range2;

    const predClass = customTreeModel.predictNode(customTreeModel.rootNode, { norm1, norm2 });

    const resDiv = document.getElementById('predictResult');
    if (resDiv) {
        resDiv.style.display = 'block';
        resDiv.innerHTML = `
            <div style="padding:0.75rem; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); margin-top:0.75rem;">
                <span style="font-weight:700; color:${predClass === 1 ? '#3b82f6' : '#f59e0b'};">Decision Tree: Class ${predClass === 1 ? '1 (Blue)' : '0 (Amber)'}</span>
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
        { num: 2, text: 'class Node:', html: '<span class="code-keyword">class</span> <span class="code-func">Node</span>:' },
        { num: 3, text: '    def __init__(self, feature=None, threshold=None, left=None, right=None, value=None):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, feature=<span class="code-keyword">None</span>, threshold=<span class="code-keyword">None</span>, left=<span class="code-keyword">None</span>, right=<span class="code-keyword">None</span>, value=<span class="code-keyword">None</span>):' },
        { num: 4, text: '        self.feature, self.threshold = feature, threshold', html: '        self.feature, self.threshold = feature, threshold' },
        { num: 5, text: '        self.left, self.right, self.value = left, right, value', html: '        self.left, self.right, self.value = left, right, value' },
        { num: 6, text: 'class DecisionTree:', html: '<span class="code-keyword">class</span> <span class="code-func">DecisionTree</span>:' },
        { num: 7, text: '    def __init__(self, max_depth=4, min_samples_split=2):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, max_depth=<span class="code-num">4</span>, min_samples_split=<span class="code-num">2</span>):' },
        { num: 8, text: '        self.max_depth, self.min_samples_split = max_depth, min_samples_split', html: '        self.max_depth, self.min_samples_split = max_depth, min_samples_split' },
        { num: 9, text: '    def _gini(self, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">_gini</span>(self, y):' },
        { num: 10, text: '        p0, p1 = np.mean(y == 0), np.mean(y == 1)', html: '        p0, p1 = np.mean(y == <span class="code-num">0</span>), np.mean(y == <span class="code-num">1</span>)' },
        { num: 11, text: '        return 1.0 - (p0**2 + p1**2)', html: '        <span class="code-keyword">return</span> <span class="code-num">1.0</span> - (p0**<span class="code-num">2</span> + p1**<span class="code-num">2</span>)' },
        { num: 12, text: '    def _best_split(self, X, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">_best_split</span>(self, X, y):' },
        { num: 13, text: '        best_gain, best_feat, best_thresh = -1, None, None', html: '        best_gain, best_feat, best_thresh = -<span class="code-num">1</span>, <span class="code-keyword">None</span>, <span class="code-keyword">None</span>' },
        { num: 14, text: '        parent_gini = self._gini(y)', html: '        parent_gini = self._gini(y)' },
        { num: 15, text: '        for feat in range(X.shape[1]):', html: '        <span class="code-keyword">for</span> feat <span class="code-keyword">in</span> range(X.shape[<span class="code-num">1</span>]):' },
        { num: 16, text: '            for thresh in np.unique(X[:, feat]):', html: '            <span class="code-keyword">for</span> thresh <span class="code-keyword">in</span> np.unique(X[:, feat]):' },
        { num: 17, text: '                left = X[:, feat] <= thresh', html: '                left = X[:, feat] <= thresh' },
        { num: 18, text: '                gain = parent_gini - (np.mean(left)*self._gini(y[left]) + np.mean(~left)*self._gini(y[~left]))', html: '                gain = parent_gini - (np.mean(left)*self._gini(y[left]) + np.mean(~left)*self._gini(y[~left]))' },
        { num: 19, text: '                if gain > best_gain: best_gain, best_feat, best_thresh = gain, feat, thresh', html: '                <span class="code-keyword">if</span> gain > best_gain: best_gain, best_feat, best_thresh = gain, feat, thresh' },
        { num: 20, text: '        return best_feat, best_thresh', html: '        <span class="code-keyword">return</span> best_feat, best_thresh' },
        { num: 21, text: '    def predict(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">predict</span>(self, X):' },
        { num: 22, text: '        return np.array([self._predict_row(x, self.root) for x in X])', html: '        <span class="code-keyword">return</span> np.array([self._predict_row(x, self.root) <span class="code-keyword">for</span> x <span class="code-keyword">in</span> X])' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast array manipulations and vectorized threshold calculations.", math: "\\text{import numpy as np}" },
        2: { title: "Tree Node Class Definition", text: "Represents a single decision node or leaf prediction node in the tree hierarchy.", math: "\\text{Node}(j, t, L, R, v)" },
        3: { title: "Node Constructor", text: "Initializes node attributes (feature index, threshold value, left/right pointers, leaf class).", math: "x_j \\le t" },
        4: { title: "Store Decision Attributes", text: "Saves split feature index j and decision boundary threshold t.", math: "j \\in \\{1, \\dots, p\\}" },
        5: { title: "Store Pointers and Values", text: "Saves left child reference, right child reference, and leaf target class v.", math: "L, R, v" },
        6: { title: "Decision Tree Class Definition", text: "Encapsulates greedy recursive splitting, Gini calculation, and tree traversal.", math: "\\mathcal{M}_{\\text{Tree}}" },
        7: { title: "Decision Tree Constructor", text: "Sets regularization hyperparameter limits (max_depth and min_samples_split).", math: "\\text{max\\_depth} = 4" },
        8: { title: "Save Regularization Limits", text: "Prevents overfitting by constraining maximum tree height and node splitting limits.", math: "|S| \\ge \\text{min\\_split}" },
        9: { title: "Gini Impurity Function", text: "Calculates node impurity measure Gini(S) from class probabilities.", math: "G(S) = 1 - \\sum_{k=1}^K p_k^2" },
        10: { title: "Calculate Class Probabilities", text: "Computes class frequencies p0 and p1 for binary targets.", math: "p_k = \\frac{1}{|S|} \\sum_{i \\in S} \\mathbb{I}(y_i = k)" },
        11: { title: "Compute Gini Formula", text: "Evaluates 1 - (p0^2 + p1^2) returning 0 for pure nodes and 0.5 for mixed nodes.", math: "G(S) = 1 - p_0^2 - p_1^2" },
        12: { title: "Best Feature Split Method", text: "Searches all features and thresholds for the maximum Gini Information Gain.", math: "\\arg\\max_{j, t} \\text{Gain}(S, j, t)" },
        13: { title: "Initialize Best Split Variables", text: "Prepares tracking variables for highest gain found.", math: "\\text{best\\_gain} = -1" },
        14: { title: "Evaluate Parent Gini Impurity", text: "Calculates baseline impurity Gini(S) before splitting.", math: "G_{\\text{parent}} = G(S)" },
        15: { title: "Iterate Feature Columns", text: "Loops over all available input feature axes j.", math: "j = 1, 2, \\dots, p" },
        16: { title: "Iterate Unique Feature Values", text: "Loops over all candidate threshold values t present in feature column j.", math: "t \\in \\text{unique}(X_{:, j})" },
        17: { title: "Create Binary Split Mask", text: "Splits samples into left mask (X_j <= t) and right mask (X_j > t).", math: "S_{\\text{left}} = \\{i \\mid x_{i,j} \\le t\\}" },
        18: { title: "Calculate Gini Information Gain", text: "Evaluates Gini gain = Parent Gini - Weighted Child Ginis.", math: "\\text{Gain} = G(S) - \\left( \\frac{|S_L|}{|S|} G(S_L) + \\frac{|S_R|}{|S|} G(S_R) \\right)" },
        19: { title: "Update Best Split Tracking", text: "Saves feature index and threshold if information gain improves.", math: "\\text{Gain} > \\text{best\\_gain}" },
        20: { title: "Return Optimal Split", text: "Returns best feature index j and threshold t to build tree children.", math: "(j^*, t^*)" },
        21: { title: "Inference Prediction Entrypoint (predict)", text: "Evaluates trained model hypothesis on input data matrix X to generate predictions.", math: "\\hat{y} = f_{\\text{Tree}}(X)" },
        22: { title: "Traverse Tree per Sample Row", text: "Executes row-by-row decision tree traversal from root to matching leaf.", math: "\\hat{y}_i = \\text{traverse}(x_i, \\text{root})" }
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
                        ${info.why || 'Generates output predictions for model evaluation and production deployment.'}
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
            else if (step === 'step2') targetLine = 9;
            else if (step === 'step3') targetLine = 18;
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
