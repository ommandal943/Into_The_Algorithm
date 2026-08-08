/* ════════════════════════════════════════════════════════════
   KNN Interactive Application — Premium Visualizations
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
    initKNNLab();
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

/* ── Hero Canvas Particle/KNN Simulation ──────────────── */
function initHeroAnimation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    // Generate random 2D points with binary class
    const points = [];
    const numPoints = 40;
    const classColors = ['#f59e0b', '#ef4444'];

    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: Math.random() * (width - 40) + 20,
            y: Math.random() * (height - 40) + 20,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            cls: Math.random() > 0.5 ? 1 : 0
        });
    }

    // Query point moving around smoothly
    let queryX = width / 2;
    let queryY = height / 2;
    let queryAngle = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update points
        for (let p of points) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 20 || p.x > width - 20) p.vx *= -1;
            if (p.y < 20 || p.y > height - 20) p.vy *= -1;
        }

        // Orbit query point
        queryAngle += 0.015;
        queryX = width / 2 + Math.cos(queryAngle) * 120 + Math.sin(queryAngle * 2) * 30;
        queryY = height / 2 + Math.sin(queryAngle) * 90;

        // Calculate K=5 nearest neighbors
        const dists = points.map((p, idx) => ({
            dist: Math.hypot(p.x - queryX, p.y - queryY),
            point: p,
            idx
        }));
        dists.sort((a, b) => a.dist - b.dist);
        const k5 = dists.slice(0, 5);

        // Draw connections to K nearest
        for (let item of k5) {
            ctx.beginPath();
            ctx.moveTo(queryX, queryY);
            ctx.lineTo(item.point.x, item.point.y);
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw dots
        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = classColors[p.cls];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Determine voted class
        let count0 = 0, count1 = 0;
        for (let item of k5) {
            if (item.point.cls === 0) count0++;
            else count1++;
        }
        const predClass = count1 > count0 ? 1 : 0;

        // Draw query point halo & core
        ctx.beginPath();
        ctx.arc(queryX, queryY, k5[4].dist, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(queryX, queryY, 8, 0, Math.PI * 2);
        ctx.fillStyle = classColors[predClass];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        requestAnimationFrame(animate);
    }

    animate();
}

/* ── Interactive Main KNN Laboratory ──────────────────── */
function initKNNLab() {
    const canvas = document.getElementById('knnCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    let datasetType = 'blobs';
    let metric = 'euclidean';
    let k = 5;
    let isWeighted = false;
    let showBoundary = true;

    let points = []; // [{x, y, label}]
    let clickedPoint = null;
    let nearestNeighbors = [];

    const colors = ['#f59e0b', '#3b82f6']; // Class 0 (Amber), Class 1 (Blue)
    const bgColors0 = 'rgba(245, 158, 11, ';
    const bgColors1 = 'rgba(59, 130, 246, ';

    // Chart instances
    let accuracyChart = null;
    let classDistChart = null;
    let distHistChart = null;

    // Generators
    function generateData() {
        points = [];
        const n = 160;

        if (datasetType === 'blobs') {
            for (let i = 0; i < n; i++) {
                const label = Math.random() > 0.5 ? 1 : 0;
                const cx = label === 0 ? width * 0.32 : width * 0.68;
                const cy = label === 0 ? height * 0.35 : height * 0.65;
                points.push({
                    x: cx + (gaussianRandom() * 65),
                    y: cy + (gaussianRandom() * 65),
                    label
                });
            }
        } else if (datasetType === 'moons') {
            for (let i = 0; i < n; i++) {
                const label = Math.random() > 0.5 ? 1 : 0;
                const t = Math.random() * Math.PI;
                const r = 110 + (gaussianRandom() * 15);
                let x, y;
                if (label === 0) {
                    x = width / 2 - 60 + Math.cos(t) * r;
                    y = height / 2 - 30 - Math.sin(t) * r;
                } else {
                    x = width / 2 + 60 + Math.cos(t) * r;
                    y = height / 2 + 30 + Math.sin(t) * r;
                }
                points.push({ x, y, label });
            }
        } else if (datasetType === 'circles') {
            for (let i = 0; i < n; i++) {
                const label = Math.random() > 0.5 ? 1 : 0;
                const r = label === 0 ? (40 + Math.random() * 45) : (140 + Math.random() * 45);
                const t = Math.random() * Math.PI * 2;
                points.push({
                    x: width / 2 + Math.cos(t) * r,
                    y: height / 2 + Math.sin(t) * r,
                    label
                });
            }
        } else if (datasetType === 'xor') {
            for (let i = 0; i < n; i++) {
                const x = Math.random() * (width - 60) + 30;
                const y = Math.random() * (height - 60) + 30;
                const label = ((x > width / 2) !== (y > height / 2)) ? 1 : 0;
                points.push({ x, y, label });
            }
        } else if (datasetType === 'spiral') {
            for (let i = 0; i < n; i++) {
                const label = Math.random() > 0.5 ? 1 : 0;
                const t = (Math.random() * 2.5 + (label * Math.PI)) * 1.2;
                const r = 25 * t;
                points.push({
                    x: width / 2 + Math.cos(t) * r + (gaussianRandom() * 10),
                    y: height / 2 + Math.sin(t) * r + (gaussianRandom() * 10),
                    label
                });
            }
        }

        // Clamp points to canvas boundaries
        points.forEach(p => {
            p.x = Math.max(15, Math.min(width - 15, p.x));
            p.y = Math.max(15, Math.min(height - 15, p.y));
        });

        clickedPoint = null;
        updateUI();
    }

    function gaussianRandom() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    function calcDistance(p1, p2) {
        if (metric === 'euclidean') {
            return Math.hypot(p1.x - p2.x, p1.y - p2.y);
        } else {
            return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
        }
    }

    function classify(pt, drawK = false) {
        if (points.length === 0) return 0;
        const dists = points.map(p => ({
            d: calcDistance(pt, p),
            label: p.label,
            p
        }));
        dists.sort((a, b) => a.d - b.d);
        const kNeighbors = dists.slice(0, Math.min(k, points.length));

        if (drawK) nearestNeighbors = kNeighbors;

        let score0 = 0, score1 = 0;
        for (let item of kNeighbors) {
            const w = isWeighted ? (1 / Math.max(0.001, Math.pow(item.d, 2))) : 1;
            if (item.label === 0) score0 += w;
            else score1 += w;
        }

        return score1 > score0 ? 1 : 0;
    }

    function renderDecisionBoundary() {
        if (!showBoundary) return;
        const step = 12; // grid resolution
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const octx = offscreen.getContext('2d');

        for (let x = 0; x < width; x += step) {
            for (let y = 0; y < height; y += step) {
                const pred = classify({ x: x + step / 2, y: y + step / 2 });
                octx.fillStyle = pred === 0 ? `${bgColors0}0.18)` : `${bgColors1}0.18)`;
                octx.fillRect(x, y, step, step);
            }
        }
        ctx.drawImage(offscreen, 0, 0);
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Boundary
        renderDecisionBoundary();

        // Points
        for (let p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = colors[p.label];
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        // Clicked Point & Neighbors
        if (clickedPoint) {
            const predClass = classify(clickedPoint, true);

            // Draw neighbor dashed lines & halos
            for (let item of nearestNeighbors) {
                ctx.beginPath();
                ctx.moveTo(clickedPoint.x, clickedPoint.y);
                ctx.lineTo(item.p.x, item.p.y);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Neighbor highlight ring
                ctx.beginPath();
                ctx.arc(item.p.x, item.p.y, 8, 0, Math.PI * 2);
                ctx.strokeStyle = colors[item.label];
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Target Point
            ctx.beginPath();
            ctx.arc(clickedPoint.x, clickedPoint.y, 9, 0, Math.PI * 2);
            ctx.fillStyle = colors[predClass];
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Outer pulse ring
            const maxDist = nearestNeighbors.length > 0 ? nearestNeighbors[nearestNeighbors.length - 1].d : 20;
            ctx.beginPath();
            ctx.arc(clickedPoint.x, clickedPoint.y, maxDist, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    function calculateLOOAccuracy() {
        if (points.length === 0) return 0;
        let correct = 0;

        for (let i = 0; i < points.length; i++) {
            const target = points[i];
            const dists = [];

            for (let j = 0; j < points.length; j++) {
                if (i === j) continue; // leave one out
                dists.push({
                    d: calcDistance(target, points[j]),
                    label: points[j].label
                });
            }

            dists.sort((a, b) => a.d - b.d);
            const kNeighbors = dists.slice(0, Math.min(k, dists.length));

            let s0 = 0, s1 = 0;
            for (let item of kNeighbors) {
                const w = isWeighted ? (1 / Math.max(0.001, Math.pow(item.d, 2))) : 1;
                if (item.label === 0) s0 += w;
                else s1 += w;
            }

            const pred = s1 > s0 ? 1 : 0;
            if (pred === target.label) correct++;
        }

        return ((correct / points.length) * 100).toFixed(1);
    }

    function updateUI() {
        draw();

        // LOO Acc
        const acc = calculateLOOAccuracy();
        document.getElementById('metricAccuracy').textContent = `${acc}%`;
        document.getElementById('metricK').textContent = k;
        document.getElementById('metricPoints').textContent = points.length;
        document.getElementById('metricWeighted').textContent = isWeighted ? 'Yes' : 'No';
        document.getElementById('metricDistType').textContent = metric === 'euclidean' ? 'Euclidean' : 'Manhattan';

        const datasetNames = {
            blobs: 'Two Blobs',
            moons: 'Moons',
            circles: 'Concentric Circles',
            xor: 'XOR Pattern',
            spiral: 'Spiral'
        };
        document.getElementById('metricDataset').textContent = datasetNames[datasetType];

        // Classification panel sidebar
        const resultDiv = document.getElementById('classificationResult');
        if (clickedPoint) {
            resultDiv.style.display = 'block';
            const predClass = classify(clickedPoint, true);
            const classBadge = document.getElementById('classBadge');
            const classDot = document.getElementById('classDot');
            const classLabel = document.getElementById('classLabel');

            classBadge.className = `classification-badge class-${predClass}`;
            classDot.style.background = colors[predClass];
            classLabel.textContent = `Classified as Class ${predClass} (${predClass === 0 ? 'Amber' : 'Blue'})`;

            // Populate neighbor list
            const neighborList = document.getElementById('neighborList');
            neighborList.innerHTML = nearestNeighbors.map((n, i) => `
                <div class="neighbor-item">
                    <span style="color:var(--text-muted);">#${i + 1}</span>
                    <span class="neighbor-dot" style="background:${colors[n.label]};"></span>
                    <span>Class ${n.label}</span>
                    <span class="neighbor-dist">${n.d.toFixed(1)} px</span>
                </div>
            `).join('');
        } else {
            resultDiv.style.display = 'none';
        }

        updateCharts();
    }

    function updateCharts() {
        // 1. K vs LOO Accuracy Chart
        const kValues = [1, 3, 5, 7, 9, 11, 15, 21];
        const accs = kValues.map(kVal => {
            let correct = 0;
            for (let i = 0; i < points.length; i++) {
                const target = points[i];
                const dists = [];
                for (let j = 0; j < points.length; j++) {
                    if (i === j) continue;
                    dists.push({
                        d: calcDistance(target, points[j]),
                        label: points[j].label
                    });
                }
                dists.sort((a, b) => a.d - b.d);
                const subK = dists.slice(0, Math.min(kVal, dists.length));
                let s0 = 0, s1 = 0;
                for (let item of subK) {
                    const w = isWeighted ? (1 / Math.max(0.001, Math.pow(item.d, 2))) : 1;
                    if (item.label === 0) s0 += w;
                    else s1 += w;
                }
                if ((s1 > s0 ? 1 : 0) === target.label) correct++;
            }
            return ((correct / points.length) * 100).toFixed(1);
        });

        const ctxKAcc = document.getElementById('kAccuracyChart').getContext('2d');
        if (accuracyChart) accuracyChart.destroy();
        accuracyChart = new Chart(ctxKAcc, {
            type: 'line',
            data: {
                labels: kValues.map(kv => `K=${kv}`),
                datasets: [{
                    label: 'Accuracy (%)',
                    data: accs,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#f59e0b'
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

        // 2. Class Distribution Doughnut
        const count0 = points.filter(p => p.label === 0).length;
        const count1 = points.filter(p => p.label === 1).length;

        const ctxClass = document.getElementById('classDistChart').getContext('2d');
        if (classDistChart) classDistChart.destroy();
        classDistChart = new Chart(ctxClass, {
            type: 'doughnut',
            data: {
                labels: ['Class 0 (Amber)', 'Class 1 (Blue)'],
                datasets: [{
                    data: [count0, count1],
                    backgroundColor: ['#f59e0b', '#3b82f6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#e2e8f0', font: { family: 'Inter' } } }
                }
            }
        });

        // 3. Distance Histogram to clicked point (or center)
        const refPt = clickedPoint || { x: width / 2, y: height / 2 };
        const allDists = points.map(p => calcDistance(refPt, p));
        allDists.sort((a, b) => a - b);

        const bins = [0, 0, 0, 0, 0];
        const binLabels = ['0-50px', '50-100px', '100-150px', '150-200px', '200px+'];
        allDists.forEach(d => {
            if (d < 50) bins[0]++;
            else if (d < 100) bins[1]++;
            else if (d < 150) bins[2]++;
            else if (d < 200) bins[3]++;
            else bins[4]++;
        });

        const ctxDist = document.getElementById('distHistChart').getContext('2d');
        if (distHistChart) distHistChart.destroy();
        distHistChart = new Chart(ctxDist, {
            type: 'bar',
            data: {
                labels: binLabels,
                datasets: [{
                    label: 'Point Count',
                    data: bins,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderRadius: 4
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
    }

    // Event Listeners
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        clickedPoint = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
        updateUI();
    });

    document.getElementById('sampleDatasetSelect').addEventListener('change', (e) => {
        datasetType = e.target.value;
        generateData();
    });

    document.getElementById('sampleMetricSelect').addEventListener('change', (e) => {
        metric = e.target.value;
        updateUI();
    });

    document.getElementById('kSlider').addEventListener('input', (e) => {
        k = parseInt(e.target.value);
        document.getElementById('kDisplay').textContent = k;
        updateUI();
    });

    document.getElementById('weightedToggle').addEventListener('change', (e) => {
        isWeighted = e.target.checked;
        updateUI();
    });

    document.getElementById('boundaryToggle').addEventListener('change', (e) => {
        showBoundary = e.target.checked;
        draw();
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

    // Manual Row Manager
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

    if (addRowBtn) {
        addRowBtn.addEventListener('click', () => createManualRow());
    }

    if (clearRowsBtn) {
        clearRowsBtn.addEventListener('click', () => {
            manualRowsContainer.innerHTML = '';
        });
    }

    if (loadExampleBtn) {
        loadExampleBtn.addEventListener('click', () => {
            manualRowsContainer.innerHTML = '';
            const exampleData = [
                [2.5, 3.1, 0], [1.8, 2.9, 0], [2.2, 4.0, 0], [3.0, 3.5, 0],
                [7.5, 8.1, 1], [8.8, 7.9, 1], [6.2, 9.0, 1], [7.0, 7.5, 1]
            ];
            exampleData.forEach(d => createManualRow(d[0], d[1], d[2]));
        });
    }

    // Default 4 rows
    if (manualRowsContainer && manualRowsContainer.children.length === 0) {
        const defaultData = [
            [2.5, 3.1, 0], [1.8, 2.9, 0],
            [7.5, 8.1, 1], [8.8, 7.9, 1]
        ];
        defaultData.forEach(d => createManualRow(d[0], d[1], d[2]));
    }

    // CSV File Upload & Drag-and-Drop Event Listeners
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
    if (trainCustomBtn) {
        trainCustomBtn.addEventListener('click', trainCustomModel);
    }

    const predictBtn = document.getElementById('predictBtn');
    if (predictBtn) {
        predictBtn.addEventListener('click', predictCustomPoint);
    }
}

// ─── Playground : Custom CSV Parsing & KNN Model Execution ──────
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

let customDatasetModel = null;

function trainCustomModel() {
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

    const kInput = parseInt(document.getElementById('playgroundK')?.value || '5');
    const kVal = Math.max(1, Math.min(kInput, processedPoints.length));

    let correct = 0;
    for (let i = 0; i < processedPoints.length; i++) {
        const target = processedPoints[i];
        const dists = [];
        for (let j = 0; j < processedPoints.length; j++) {
            if (i === j) continue;
            const p2 = processedPoints[j];
            const d = Math.hypot(target.norm1 - p2.norm1, target.norm2 - p2.norm2);
            dists.push({ d, label: p2.label });
        }
        dists.sort((a, b) => a.d - b.d);
        const neighbors = dists.slice(0, Math.min(kVal, dists.length));
        let c0 = 0, c1 = 0;
        neighbors.forEach(n => n.label === 1 ? c1++ : c0++);
        const pred = c1 >= c0 ? 1 : 0;
        if (pred === target.label) correct++;
    }

    const looAcc = processedPoints.length > 0 ? ((correct / processedPoints.length) * 100).toFixed(1) : '0.0';

    customDatasetModel = {
        points: processedPoints,
        min1, max1, range1,
        min2, max2, range2,
        k: kVal
    };

    document.getElementById('cMetricK').textContent = kVal;
    document.getElementById('cMetricAccuracy').textContent = `${looAcc}%`;
    document.getElementById('cMetricPoints').textContent = processedPoints.length;
    document.getElementById('customResults').style.display = 'block';

    renderCustomKNNChart(customDatasetModel);
}

function renderCustomKNNChart(model) {
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

            const dists = model.points.map(p => ({
                d: Math.hypot(norm1 - p.norm1, norm2 - p.norm2),
                label: p.label
            }));
            dists.sort((a, b) => a.d - b.d);
            const neighbors = dists.slice(0, Math.min(model.k, dists.length));
            let c0 = 0, c1 = 0;
            neighbors.forEach(n => n.label === 1 ? c1++ : c0++);
            const pred = c1 >= c0 ? 1 : 0;

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

function predictCustomPoint() {
    if (!customDatasetModel) {
        alert('Please train custom dataset first.');
        return;
    }
    const x1Val = parseFloat(document.getElementById('predictX1')?.value);
    const x2Val = parseFloat(document.getElementById('predictX2')?.value);

    if (isNaN(x1Val) || isNaN(x2Val)) {
        alert('Please enter valid numeric X1 and X2 values.');
        return;
    }

    const norm1 = (x1Val - customDatasetModel.min1) / customDatasetModel.range1;
    const norm2 = (x2Val - customDatasetModel.min2) / customDatasetModel.range2;

    const dists = customDatasetModel.points.map(p => ({
        d: Math.hypot(norm1 - p.norm1, norm2 - p.norm2),
        label: p.label
    }));
    dists.sort((a, b) => a.d - b.d);
    const neighbors = dists.slice(0, Math.min(customDatasetModel.k, dists.length));

    let c0 = 0, c1 = 0;
    neighbors.forEach(n => n.label === 1 ? c1++ : c0++);
    const predClass = c1 >= c0 ? 1 : 0;
    const confidence = ((Math.max(c0, c1) / neighbors.length) * 100).toFixed(0);

    const resDiv = document.getElementById('predictResult');
    if (resDiv) {
        resDiv.style.display = 'block';
        resDiv.innerHTML = `
            <div style="padding:0.75rem; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); margin-top:0.75rem;">
                <span style="font-weight:700; color:${predClass === 1 ? '#3b82f6' : '#f59e0b'};">Classified as Class ${predClass}</span> (${confidence}% Confidence via K=${customDatasetModel.k})
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
        { num: 2, text: 'from collections import Counter', html: '<span class="code-keyword">from</span> collections <span class="code-keyword">import</span> Counter' },
        { num: 3, text: 'class KNNScratch:', html: '<span class="code-keyword">class</span> <span class="code-func">KNNScratch</span>:' },
        { num: 4, text: '    def __init__(self, k=5, metric="euclidean"):', html: '    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, k=<span class="code-num">5</span>, metric=<span class="code-string">"euclidean"</span>):' },
        { num: 5, text: '        self.k, self.metric = k, metric', html: '        self.k, self.metric = k, metric' },
        { num: 6, text: '    def fit(self, X, y):', html: '    <span class="code-keyword">def</span> <span class="code-func">fit</span>(self, X, y):' },
        { num: 7, text: '        self.X_train, self.y_train = X, y', html: '        self.X_train, self.y_train = X, y' },
        { num: 8, text: '    def predict(self, X):', html: '    <span class="code-keyword">def</span> <span class="code-func">predict</span>(self, X):' },
        { num: 9, text: '        return np.array([self._predict_one(x) for x in X])', html: '        <span class="code-keyword">return</span> np.array([self._predict_one(x) <span class="code-keyword">for</span> x <span class="code-keyword">in</span> X])' },
        { num: 10, text: '    def _predict_one(self, x):', html: '    <span class="code-keyword">def</span> <span class="code-func">_predict_one</span>(self, x):' },
        { num: 11, text: '        if self.metric == "euclidean":', html: '        <span class="code-keyword">if</span> self.metric == <span class="code-string">"euclidean"</span>:' },
        { num: 12, text: '            distances = np.sqrt(np.sum((self.X_train - x)**2, axis=1))', html: '            distances = np.sqrt(np.sum((self.X_train - x)**<span class="code-num">2</span>, axis=<span class="code-num">1</span>))' },
        { num: 13, text: '        else: distances = np.sum(np.abs(self.X_train - x), axis=1)', html: '        <span class="code-keyword">else</span>: distances = np.sum(np.abs(self.X_train - x), axis=<span class="code-num">1</span>)' },
        { num: 14, text: '        k_indices = np.argsort(distances)[:self.k]', html: '        k_indices = np.argsort(distances)[:self.k]' },
        { num: 15, text: '        k_nearest_labels = [self.y_train[i] for i in k_indices]', html: '        k_nearest_labels = [self.y_train[i] <span class="code-keyword">for</span> i <span class="code-keyword">in</span> k_indices]' },
        { num: 16, text: '        most_common = Counter(k_nearest_labels).most_common(1)', html: '        most_common = Counter(k_nearest_labels).most_common(<span class="code-num">1</span>)' },
        { num: 17, text: '        return most_common[0][0]', html: '        <span class="code-keyword">return</span> most_common[<span class="code-num">0</span>][<span class="code-num">0</span>]' }
    ];

    const CODE_EXPLANATIONS = {
        1: { title: "Import NumPy Library", text: "Imports NumPy for fast array Broadcasting and Euclidean distance calculations.", math: "\\text{import numpy as np}" },
        2: { title: "Import Counter Utility", text: "Imports collections.Counter for fast majority voting frequency tallying.", math: "\\text{from collections import Counter}" },
        3: { title: "KNN Class Definition", text: "Encapsulates instance-based lazy learning classifier logic.", math: "\\mathcal{M}_{\\text{KNN}}" },
        4: { title: "KNN Constructor", text: "Sets hyperparameter K (number of neighbors) and distance metric (Euclidean/Manhattan).", math: "K = 5, \\quad d(\\mathbf{x}, \\mathbf{z})" },
        5: { title: "Store Instance Hyperparameters", text: "Saves K value and distance metric choice attributes.", math: "K, \\, \\text{metric}" },
        6: { title: "Lazy Learning Fit Method", text: "Stores training dataset in memory without explicit model parameter training.", math: "\\mathcal{D} = \\{(\\mathbf{x}_i, y_i)\\}_{i=1}^N" },
        7: { title: "Store Training Coordinates & Labels", text: "Saves reference matrices X_train and target label array y_train.", math: "\\mathbf{X}_{\\text{train}}, \\mathbf{y}_{\\text{train}}" },
        8: { title: "Batch Predict Method", text: "Evaluates nearest neighbor classification row by row for test matrix X.", math: "\\hat{\\mathbf{y}} = f_{\\text{KNN}}(\\mathbf{X})" },
        9: { title: "Iterate Test Samples", text: "Applies single-sample KNN classifier over each test row vector x.", math: "\\hat{y}_i = \\text{\\_predict\\_one}(\\mathbf{x}_i)" },
        10: { title: "Single Point Prediction Engine", text: "Computes distances from query x to all training points in memory.", math: "d(\\mathbf{x}, \\mathbf{x}_j) \\quad \\forall j=1 \\dots N" },
        11: { title: "Check Distance Metric Selection", text: "Branches to Euclidean L2 norm or Manhattan L1 norm distance formula.", math: "\\text{metric} = \\text{Euclidean vs Manhattan}" },
        12: { title: "Compute Vectorized L2 Euclidean Distance", text: "Calculates sqrt(sum((X_train - x)^2, axis=1)) distance array.", math: "d_{\\text{L2}}(\\mathbf{x}_j, \\mathbf{x}) = \\sqrt{\\sum_{p=1}^P (x_{j,p} - x_p)^2}" },
        13: { title: "Compute Vectorized L1 Manhattan Distance", text: "Calculates sum(|X_train - x|, axis=1) taxicab distance array.", math: "d_{\\text{L1}}(\\mathbf{x}_j, \\mathbf{x}) = \\sum_{p=1}^P |x_{j,p} - x_p|" },
        14: { title: "Argsort K Smallest Distances", text: "Sorts distance array to extract indices of top K closest training points.", math: "\\mathbf{i}_k = \\arg\\text{sort}(d)[:K]" },
        15: { title: "Gather K Nearest Target Labels", text: "Extracts class labels y_train[i] for the K nearest neighbor indices.", math: "\\{y_{i_1}, y_{i_2}, \\dots, y_{i_K}\\}" },
        16: { title: "Majority Vote Class Frequency", text: "Counts occurrences of each class among K neighbors using Counter.", math: "\\text{mode}\\{y_{i_1}, \\dots, y_{i_K}\\}" },
        17: { title: "Return Winning Majority Class", text: "Returns most frequent class label for query point prediction.", math: "\\hat{y} = \\arg\\max_c \\sum_{j \\in N_K(\\mathbf{x})} \\mathbb{I}(y_j = c)" }
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
                    <span style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:#fbbf24; letter-spacing:0.05em; text-transform:uppercase;">💡 INTERACTIVE LINE-BY-LINE CODE INSPECTOR</span>
                    <span style="font-size:0.78rem; font-weight:600; color:${isLocked ? '#f472b6' : 'var(--text-secondary)'}; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:0.25rem 0.75rem; border-radius:50px;">
                        ${isLocked ? '📌 Line Locked – Click another line or click again to unlock' : '💡 Hovering Line – Click line to lock inspection'}
                    </span>
                </div>

                <div style="margin-bottom:0.75rem;">
                    <span style="background:${isLocked ? 'rgba(244,114,182,0.15)' : 'rgba(251,191,36,0.15)'}; color:${isLocked ? '#f472b6' : '#fbbf24'}; border:1px solid ${isLocked ? 'rgba(244,114,182,0.3)' : 'rgba(251,191,36,0.3)'}; padding:0.25rem 0.75rem; border-radius:50px; font-size:0.8rem; font-weight:700; font-family:var(--font-mono); display:inline-block;">
                        📌 Line ${selectedLine} ${isLocked ? '(Locked)' : '(Hover preview)'}
                    </span>
                </div>

                <h3 style="font-size:1.25rem; font-weight:700; color:#ffffff; margin:0.5rem 0 1rem 0;">${info.title}</h3>

                <div style="margin-bottom:0.85rem;">
                    <div style="font-weight:700; color:#fbbf24; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>🔍</span> <span>What This Line Does:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.text}
                    </p>
                </div>

                <div style="margin-bottom:1rem;">
                    <div style="font-weight:700; color:#34d399; font-size:0.88rem; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>⚡</span> <span>Why It Is Used:</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.65; margin:0;">
                        ${info.why || 'Classifies query points via majority vote across K-nearest feature space neighbors.'}
                    </p>
                </div>

                ${info.math ? `
                <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:1rem 1.25rem; margin-top:1rem;">
                    <div style="font-weight:700; color:#a78bfa; font-size:0.85rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
                        <span>📐</span> <span>Math Formulation:</span>
                    </div>
                    <div style="margin:0; padding:0; background:transparent; border:none; text-align:center; font-size:1rem; color:#fbbf24;">
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
            else if (step === 'step3') targetLine = 14;
            else if (step === 'step4') targetLine = 16;

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
