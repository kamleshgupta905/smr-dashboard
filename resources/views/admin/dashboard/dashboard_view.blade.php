@if (session()->has('error'))
<script>
    showToast('error', '{{ session('error') }}')
</script>
@endif

<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">

<style>

/* ===== GLOBAL ===== */
.content-wrapper {
    background: #F8FAFC !important;
    padding: 20px !important;
}

/* ===== CARD ===== */
.card {
    background: #FFFFFF !important;
    border-radius: 16px !important;
    border: 1px solid #E5E7EB !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
    transition: 0.25s;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
}

/* ===== TOP CHART CARDS ===== */
.chart-top {
    padding: 18px;
}

.chart-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart-title {
    font-size: 13px;
    color: #64748B;
}

.chart-value {
    font-size: 22px;
    font-weight: 700;
    color: #0F172A;
}

/* ===== BOTTOM CHART ===== */
.chart-card {
    padding: 20px;
}

.chart-card h6 {
    font-weight: 600;
    color: #0F172A;
}

/* ===== CANVAS ===== */
canvas {
    width: 100% !important;
}

/* ===== RESPONSIVE ===== */
@media(max-width:768px){
    .chart-value {
        font-size: 18px;
    }
}

</style>

<div class="container-fluid">

    <!-- 🔥 TOP CHARTS -->
    <div class="row g-3 mb-4">

        <div class="col-md-3 col-sm-6">
            <div class="card chart-top">
                <div class="chart-head mb-2">
                    <div class="chart-title">Active Vendors</div>
                    <div class="chart-value">{{ $totalVendors }}</div>
                </div>
                <canvas id="chart1"></canvas>
            </div>
        </div>

        <div class="col-md-3 col-sm-6">
            <div class="card chart-top">
                <div class="chart-head mb-2">
                    <div class="chart-title">Pending Leads</div>
                    <div class="chart-value">{{ $pendingLeads }}</div>
                </div>
                <canvas id="chart2"></canvas>
            </div>
        </div>

        <div class="col-md-3 col-sm-6">
            <div class="card chart-top">
                <div class="chart-head mb-2">
                    <div class="chart-title">Total Clicks</div>
                    <div class="chart-value">{{ $totalClick }}</div>
                </div>
                <canvas id="chart3"></canvas>
            </div>
        </div>

        <div class="col-md-3 col-sm-6">
            <div class="card chart-top">
                <div class="chart-head mb-2">
                    <div class="chart-title">Active Projects</div>
                    <div class="chart-value">{{ $activeProjects }}</div>
                </div>
                <canvas id="chart4"></canvas>
            </div>
        </div>

    </div>

    <!-- 📊 IMPROVED CHARTS -->
    <div class="row g-4">

        <div class="col-md-8">
            <div class="card chart-card">
                <h6 class="mb-3">Performance Overview</h6>
                <canvas id="barChart"></canvas>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card chart-card">
                <h6 class="mb-3">Vendor Distribution</h6>
                <canvas id="donutChart"></canvas>
            </div>
        </div>

    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>

// ===== TREND GENERATOR (TOP CHARTS SAME) =====
function trend(base) {
    let arr = [];
    for (let i = 0; i < 7; i++) {
        arr.push(base + Math.floor(Math.random() * 10 - 5));
    }
    return arr;
}

// ===== MINI CHART =====
function miniChart(id, data, color) {
    new Chart(document.getElementById(id), {
        type: 'line',
        data: {
            labels: ['M','T','W','T','F','S','S'],
            datasets: [{
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            plugins: { legend: { display: false }},
            scales: { x: { display: false }, y: { display: false }}
        }
    });
}

// ===== TOP CHARTS =====
miniChart('chart1', trend({{ $totalVendors }}), '#4F46E5');
miniChart('chart2', trend({{ $pendingLeads }}), '#F59E0B');
miniChart('chart3', trend({{ $totalClick }}), '#10B981');
miniChart('chart4', trend({{ $activeProjects }}), '#EF4444');


// ===== BAR CHART (PREMIUM) =====
const rawData = <?php echo $chartData; ?>;

let labels = [];
let values = [];

for (let key in rawData) {
    labels.push(key);
    values.push(rawData[key].quantity ?? 0);
}

const ctxBar = document.getElementById('barChart').getContext('2d');

// gradient
const gradient = ctxBar.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, '#6366F1');
gradient.addColorStop(1, '#4F46E5');

new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            data: values,
            backgroundColor: gradient,
            borderRadius: 12,
            barThickness: 22
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0F172A',
                titleColor: '#fff',
                bodyColor: '#CBD5F5',
                padding: 10,
                borderColor: '#4F46E5',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748B' }
            },
            y: {
                grid: { color: '#E5E7EB' },
                ticks: { color: '#64748B' }
            }
        }
    }
});


// ===== DONUT CHART (PREMIUM) =====
const donutData = <?php echo $donutChartData ?? json_encode([]); ?>;

const ctxDonut = document.getElementById('donutChart');

// plugin for center text
const centerText = {
    id: 'centerText',
    beforeDraw(chart) {
        const { width } = chart;
        const { height } = chart;
        const ctx = chart.ctx;

        ctx.restore();
        ctx.font = "bold 20px Inter";
        ctx.textBaseline = "middle";

        const total = donutData.reduce((sum, d) => sum + d.value, 0);
        const text = total;

        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;

        ctx.fillStyle = "#0F172A";
        ctx.fillText(text, textX, textY);
        ctx.save();
    }
};

new Chart(ctxDonut, {
    type: 'doughnut',
    data: {
        labels: donutData.map(d => d.category),
        datasets: [{
            data: donutData.map(d => d.value),
            backgroundColor: [
                '#4F46E5',
                '#6366F1',
                '#818CF8',
                '#A5B4FC'
            ],
            borderWidth: 0,
            hoverOffset: 8
        }]
    },
    options: {
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#64748B',
                    padding: 15
                }
            },
            tooltip: {
                backgroundColor: '#0F172A',
                titleColor: '#fff',
                bodyColor: '#CBD5F5'
            }
        }
    },
    plugins: [centerText]
});

</script>