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

// ================= MINI CHART =================

function trend(base) {
    base = parseInt(base) || 0;

    let arr = [];

    for (let i = 0; i < 7; i++) {
        arr.push(Math.max(0, base + Math.floor(Math.random() * 10 - 5)));
    }

    return arr;
}

function miniChart(id, data, color){

    const el=document.getElementById(id);

    if(!el) return;

    new Chart(el,{
        type:'line',
        data:{
            labels:['M','T','W','T','F','S','S'],
            datasets:[{
                data:data,
                borderColor:color,
                backgroundColor:color+'20',
                fill:true,
                tension:.4,
                pointRadius:0
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{display:false}
            },
            scales:{
                x:{display:false},
                y:{display:false}
            }
        }
    });

}

miniChart('chart1',trend({{ $totalVendors ?? 0 }}),'#4F46E5');
miniChart('chart2',trend({{ $pendingLeads ?? 0 }}),'#F59E0B');
miniChart('chart3',trend({{ $totalClick ?? 0 }}),'#10B981');
miniChart('chart4',trend({{ $activeProjects ?? 0 }}),'#EF4444');


// ================= BAR CHART =================

const rawData = {!! $chartData ?? '{}' !!};

let labels=[];
let values=[];

for(let project in rawData){

    labels.push(project);

    let total=0;

    Object.values(rawData[project]).forEach(function(clicks){
        total += parseInt(clicks);
    });

    values.push(total);

}

if(document.getElementById('barChart')){

    const ctx=document.getElementById('barChart').getContext('2d');

    const gradient=ctx.createLinearGradient(0,0,0,300);

    gradient.addColorStop(0,'#6366F1');
    gradient.addColorStop(1,'#4F46E5');

    new Chart(ctx,{
        type:'bar',
        data:{
            labels:labels,
            datasets:[{
                data:values,
                backgroundColor:gradient,
                borderRadius:12,
                barThickness:22
            }]
        },
        options:{
            responsive:true,
            plugins:{
                legend:{
                    display:false
                }
            },
            scales:{
                x:{
                    grid:{
                        display:false
                    }
                },
                y:{
                    beginAtZero:true
                }
            }
        }
    });

}



// ================= DONUT =================

const donutData = {!! $donutChartData ?? '[]' !!};

if(document.getElementById('donutChart') && donutData.length){

    const centerText={
        id:'centerText',
        beforeDraw(chart){

            const ctx=chart.ctx;
            const width=chart.width;
            const height=chart.height;

            ctx.restore();

            ctx.font='bold 20px Arial';

            let total=0;

            donutData.forEach(function(i){
                total+=parseInt(i.value);
            });

            const x=(width-ctx.measureText(total).width)/2;

            const y=height/2;

            ctx.fillStyle='#0F172A';
            ctx.fillText(total,x,y);

            ctx.save();

        }
    };

    new Chart(document.getElementById('donutChart'),{

        type:'doughnut',

        data:{
            labels:donutData.map(x=>x.category),
            datasets:[{
                data:donutData.map(x=>x.value),
                backgroundColor:[
                    '#4F46E5',
                    '#6366F1',
                    '#818CF8',
                    '#A5B4FC'
                ],
                borderWidth:0
            }]
        },

        options:{
            cutout:'75%',
            plugins:{
                legend:{
                    position:'bottom'
                }
            }
        },

        plugins:[centerText]

    });

}

</script>