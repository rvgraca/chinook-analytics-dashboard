import {formatCurrency, formatNumber, generateColors, downsample, getLastYearData, escapeHtml, buildRevenueSeriesByGenre} from './modules/utils.js'

const menuBtn = document.querySelector(".menu-btn");
const sideBar = document.querySelector(".sidebar");
const iconOpen = document.querySelector(".icon-open");
const iconClose = document.querySelector(".icon-close");
const backdrop = document.querySelector(".backdrop");

menuBtn.addEventListener("click", toggleMenu);

function toggleMenu() {
  sideBar.classList.toggle("show-menu");

  const open = sideBar.classList.contains("show-menu");
  iconOpen.style.display = open ? "none" : "inline-block";
  iconClose.style.display = open ? "inline-block" : "none";
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

backdrop.addEventListener("click", () => {
  if (sideBar.classList.contains("show-menu")) toggleMenu();
}); 



const buttons = document.querySelectorAll('.sidebar-nav button');
const views = document.querySelectorAll('.view');
const topBar = document.querySelector('.topbar');


document.addEventListener("DOMContentLoaded", () => {
    setView("overview");
});


buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;

    buttons.forEach(b => {b.classList.toggle("active", b === btn)})

    views.forEach(v => {v.classList.toggle("active", v.dataset.view === view)});
    setView(btn.dataset.view);
  });
});



function setView(view) {
    switch(view) {
        case "overview":
            loadOverview();
            break;
        case "sales":
            loadSales();
            break;
        case "music":
            loadMusic();
            break;
        case "customers":
            loadCustomers();
            break;
        case "geography":
            loadGeography();
            break;
        case "employees":
            loadEmployees();
            break;
    }
}

const viewLoadingState = {
  sales: null,
  overview: null,
  music: null,
  customers: null,
  geography: null,
  employees: null,
};

const graphLoadingState = {
    //overview
    overview_revenueOverTime: null,
    revenueByGenre: null,
    lastYearRevenue: null,
    topArtists: null,
    //sales
    sales_revenueOverTime: null,
    sales_revenueByCountry: null,
    //music
    genreDistributionByGenre:null,
    revenueByTopGenresOverTime:null,
    //customers
    customers_revenueByCountry: null,
    newCustomersOverTime: null,
};


// -------------------------------------LOADING VIEWS-------------------------------------

async function loadOverview() {
    //
    topBar.innerHTML = "<h1>Overview</h1>";
    //
    const data = await fetchOverview();
    renderOverview(data);
}
async function loadSales() {
    //
    topBar.innerHTML = "<h1>Sales</h1>";
    //
    const data = await fetchSales();
    renderSales(data);
}
async function loadMusic() {
    //
    topBar.innerHTML = "<h1>Music</h1>";
    //
    const data = await fetchMusic();
    renderMusic(data);
}
async function loadCustomers() {
    //
    topBar.innerHTML = "<h1>Customers</h1>";
    //
    const data = await fetchCustomers();
    renderCustomers(data);
}
async function loadGeography() {
    //
    topBar.innerHTML = "<h1>Geography</h1>";
    //
    const data = await fetchGeography();
    renderGeography(data);
}
async function loadEmployees() {
    //
    topBar.innerHTML = "<h1>Employees</h1>";
    //
    const data = await fetchEmployees();
    renderEmployees(data);
}



// -------------------------------------FETCHES-------------------------------------
async function fetchOverview() {
    if (!viewLoadingState.overview) {
        console.log("cargando overview");
        const res = await fetch("/api/analytics/overview");
        const data = await res.json();
        viewLoadingState.overview = data;
    }
    return viewLoadingState.overview;
}

async function fetchSales() {
    if (!viewLoadingState.sales) {
        console.log("cargando sales");
        const res = await fetch("/api/analytics/sales");
        const data = await res.json();
        viewLoadingState.sales = data;
    }
    return viewLoadingState.sales;
}
async function fetchMusic() {
    if (!viewLoadingState.music) {
        console.log("cargando music");
        const res = await fetch("/api/analytics/music");
        const data = await res.json();
        viewLoadingState.music = data;
    }
    return viewLoadingState.music;
}
async function fetchCustomers() {
    if (!viewLoadingState.customers) {
        console.log("cargando customers");
        const res = await fetch("/api/analytics/customers");
        const data = await res.json();
        viewLoadingState.customers = data;
    }
    return viewLoadingState.customers;
}
async function fetchGeography() {
    if (!viewLoadingState.geography) {
        console.log("cargando geography");
        const res = await fetch("/api/analytics/geography");
        const data = await res.json();
        viewLoadingState.geography = data;
    }
    return viewLoadingState.geography;
}
async function fetchEmployees() {
    if (!viewLoadingState.employees) {
        console.log("cargando employees");
        const res = await fetch("/api/analytics/employees");
        const data = await res.json();
        viewLoadingState.employees = data;
    }
    return viewLoadingState.employees;
}

// -------------------------------------RENDERING-------------------------------------

// -------------------------------------RENDER OVERVIEW-------------------------------------
function renderOverview(data) {
    // const view = document.querySelector('.view[data-view="overview"]');
    renderOverviewMetrics(data);
    renderRevenueOverTime(data, "overview_revenueOverTime", "overview_revenueOverTime");
    renderRevenueByGenre(data);
    renderLastYearRevenue(data);
    renderTopArtists(data);

}

function renderOverviewMetrics(data) {
    document.getElementById("totalRevenue").innerHTML = `${formatCurrency(data.totalRevenue)}`;
    document.getElementById("totalInvoices").innerHTML = `${formatNumber(data.totalInvoices)}`;
    document.getElementById("uniqueCustomers").innerHTML = `${formatNumber(data.uniqueCustomers)}`;
    document.getElementById("tracksSold").innerHTML = `${formatNumber(data.tracksSold)}`;
}

function renderRevenueOverTime(data, canvasId = "overview_revenueOverTime", stateKey = "overview_revenueOverTime") {

    if (graphLoadingState[stateKey]) return;

    const sampled = downsample(data.revenueOverTime, 7);

    const dates = [];
    const totalRevenueList = [];

    for (const row of sampled) {
        dates.push(row.date);
        totalRevenueList.push(row.totalRevenue);
    }

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(59,130,246,0.35)");
    gradient.addColorStop(1, "rgba(59,130,246,0.05)");

    graphLoadingState[stateKey] = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Revenue",
                data: totalRevenueList,
                borderWidth: 2.5,
                borderColor: "#2563eb",
                backgroundColor: gradient,
                fill: true,
                pointRadius: 0,
                lineTension: 0.25,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            title: {
                display: false
            },
            tooltips: {
                mode: "index",
                intersect: false,
                backgroundColor: "#111827",
                callbacks: {
                    label: function(t) {
                        return formatCurrency(t.yLabel);
                    }
                }
            },
            hover: {
                mode: "index",
                intersect: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 6,
                        fontColor: "#6b7280"
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: "rgba(0,0,0,0.05)"
                    },
                    ticks: {
                        beginAtZero: true,
                        fontColor: "#6b7280",
                        callback: function(v) {
                            return formatCurrency(v);
                        }
                    }
                }]
            }
        }
    });
}


function renderRevenueByGenre(data) {
    if (graphLoadingState.revenueByGenre) return;

    const N_GENRES = 5;

    const genres = [];
    const revenueByGenreList = [];

    data.revenueByGenre.slice(0, N_GENRES).forEach(row => {
        genres.push(row.genre);
        revenueByGenreList.push(row.revenue);
    });

    graphLoadingState.revenueByGenre = new Chart(
        document.getElementById("revenueByGenre"),
        {
            type: "doughnut",
            data: {
                labels: genres,
                datasets: [{
                    data: revenueByGenreList,
                    backgroundColor: generateColors(genres.length),
                    borderWidth: 0
                }]
            },
            options: {
                cutoutPercentage: 65,
                legend: {
                    position: "right",
                    labels: {
                        boxWidth: 14,
                        padding: 20
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function(t, data) {
                            const value = data.datasets[0].data[t.index];
                            const total = data.datasets[0].data.reduce((a,b)=>a+b,0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${data.labels[t.index]}: ${percent}%`;
                        }
                    }
                }
            }
        }
    );
}


function renderLastYearRevenue(data) {
    if (graphLoadingState.lastYearRevenue) return;

    const lastYearData = getLastYearData(data.revenueOverTime);
    const sampled = downsample(lastYearData, 7);

    const dates = [];
    const totalRevenueList = [];

    for (const row of sampled) {
        dates.push(row.date);
        totalRevenueList.push(row.totalRevenue);
    }

    graphLoadingState.lastYearRevenue = new Chart(
        document.getElementById("lastYearRevenue"),
        {
            type: "bar",
            data: {
                labels: dates.slice(0, 12),
                datasets: [{
                    data: totalRevenueList.slice(0, 12),
                    backgroundColor: "rgba(37,99,235,0.85)",
                    borderRadius: 6
                }]
            },
            options: {
                legend: { display: false },
                tooltips: {
                    backgroundColor: "#111827",
                    callbacks: {
                        label: function(t) {
                            return formatCurrency(t.yLabel);
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: { display: false },
                        ticks: {
                            maxTicksLimit: 6,
                            fontColor: "#6b7280"
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: "rgba(0,0,0,0.05)"
                        },
                        ticks: {
                            beginAtZero: true,
                            fontColor: "#6b7280",
                            callback: function(v) {
                                return formatCurrency(v);
                            }
                        }
                    }]
                }
            }
        }
    );
}


function renderTopArtists(data) {
    if (graphLoadingState.topArtists) return;

    const N_ARTISTS = 10;

    const artists = [];
    const revenues = [];

    data.topArtistsByRevenue.slice(0, N_ARTISTS).forEach(row => {
        artists.push(row.artist);
        revenues.push(row.revenue);
    });

    graphLoadingState.topArtists = new Chart(
        document.getElementById("topArtistsByRevenue"),
        {
            type: "horizontalBar",
            data: {
                labels: artists,
                datasets: [{
                    data: revenues,
                    backgroundColor: "rgba(59,130,246,0.8)",
                }]
            },
            options: {
                legend: { display: false },
                tooltips: {
                    backgroundColor: "#111827",
                    callbacks: {
                        label: function(t) {
                            return formatCurrency(t.xLabel);
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: "rgba(0,0,0,0.05)"
                        },
                        ticks: {
                            beginAtZero: true,
                            fontColor: "#6b7280",
                            callback: function(v) {
                                return formatCurrency(v);
                            }
                        }
                    }],
                    yAxes: [{
                        gridLines: { display: false },
                        ticks: {
                            fontColor: "#374151"
                        }
                    }]
                }
            }
        }
    );
}


// -------------------------------------RENDER SALES-------------------------------------
function renderSales(data) {

    const view = document.querySelector('.view[data-view="sales"]');

    renderSalesMetric(data);
    renderRevenueOverTime(data, "sales_revenueOverTime", "sales_revenueOverTime");
    renderRevenueByCountry(data, "sales_revenueByCountry", "sales_revenueByCountry");
    renderTopTracksTable(data);
    renderTopCustomers(data);
}

function renderSalesMetric(data) {
    document.getElementById("totalSales").innerHTML = `${formatCurrency(data.totalRevenue)}`;
    document.getElementById("totalSalesInvoices").innerHTML = `${formatNumber(data.totalInvoices)}`;
    document.getElementById("tracksSalesSold").innerHTML = `${formatNumber(data.tracksSold)}`;
    document.getElementById("averageOrderPrice").innerHTML = `${formatCurrency(data.averageOrderPrice)}`;
}

function renderRevenueByCountry(data, canvasId = "sales_revenueByCountry", stateKey = "sales_revenueByCountry") {
    if (graphLoadingState[stateKey]) return;

    let countries = [];
    let revenueByCountryList = [];

    const N_COUNTRIES = 5;

    Object.values(data.revenueByCountry.slice(0, N_COUNTRIES)).forEach(row => {
        countries.push(row.BillingCountry);
        revenueByCountryList.push(row.revenueByCountry);
    });

    const ctx = document.getElementById(canvasId);
    if (!ctx) return; // evita crash silencioso
    
    graphLoadingState[stateKey] = new Chart(
        ctx,
        {
            type: "doughnut",
            data: {
                labels: countries,
                datasets: [{
                    data: revenueByCountryList,
                    backgroundColor: generateColors(countries.length),
                    borderWidth: 0
                }]
            },
            options: {
                cutoutPercentage: 65,
                legend: {
                    position: "right",
                    labels: {
                        boxWidth: 14,
                        padding: 20
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function(t, data) {
                            const value = data.datasets[0].data[t.index];
                            const total = data.datasets[0].data.reduce((a,b)=>a+b,0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${data.labels[t.index]}: ${percent}%`;
                        }
                    }
                }
            }
        }
    );
}

function renderTopTracksTable(data) {
    console.log(data);
    const N_TRACKS = 5;
    const rows = data.topTracksByRevenue.slice(0, N_TRACKS);


    const el = document.getElementById("topTracksTable");
    if (!el) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        el.innerHTML = "<p style='color:#6b7280;margin:0'>No data</p>";
        return;
    }

    const max = Math.max(...rows.map(r => Number(r.revenue) || 0)) || 1;

    el.innerHTML = `
        <table class="tableStyle">
        <thead>
            <tr>
            <th class="rank-cell">#</th>
            <th>Track</th>
            <th class="number-cell" style="text-align:right">Sales</th>
            </tr>
        </thead>
        <tbody>
            ${rows.map((r, i) => {
            const revenue = Number(r.revenue) || 0;
            const pct = (revenue / max) * 100;

            return `
                <tr>
                <td class="rank-cell">${i + 1}</td>
                <td>
                    <span class="table-title">${escapeHtml(r.track)}</span>
                    <span class="table-subtitle">${escapeHtml(r.artist)}</span>
                </td>
                <td class="number-cell">
                    <div style="display:flex; align-items:center; gap:10px; justify-content:flex-end;">
                    <div class="progress" style="flex:1; max-width:160px;">
                        <div style="width:${pct.toFixed(1)}%"></div>
                    </div>
                    <div style="min-width:60px; text-align:right;">
                        ${formatCurrency(revenue)}
                    </div>
                    </div>
                </td>
                </tr>
            `;
            }).join("")}
        </tbody>
        </table>
    `;
}

function renderTopCustomers(data) {
    console.log(data);
    const N_PEOPLE = 5;
    const rows = data.topCustomers.slice(0, N_PEOPLE);


    const el = document.getElementById("topCustomersTable");
    if (!el) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        el.innerHTML = "<p style='color:#6b7280;margin:0'>No data</p>";
        return;
    }

    const max = Math.max(...rows.map(r => Number(r.revenue) || 0)) || 1;

    el.innerHTML = `
        <table class="tableStyle">
            <thead>
                <tr>
                <th class="rank-cell">#</th>
                <th>Name</th>
                <th class="number-cell" style="text-align:right">Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map((r, i) => {
                const revenue = Number(r.revenue) || 0;
                const pct = (revenue / max) * 100;

                return `
                    <tr>
                    <td class="rank-cell">${i + 1}</td>
                    <td>
                        <span class="table-title">${escapeHtml(r.FirstName + ' ' + r.LastName)}</span>
                        <span class="table-subtitle">${escapeHtml(r.Country)}</span>
                    </td>
                    <td class="number-cell">
                        <div style="display:flex; align-items:center; gap:10px; justify-content:flex-end;">
                        <div class="progress" style="flex:1; max-width:160px;">
                            <div style="width:${pct.toFixed(1)}%"></div>
                        </div>
                        <div style="min-width:60px; text-align:right;">
                            ${formatCurrency(revenue)}
                        </div>
                        </div>
                    </td>
                    </tr>
                `;
                }).join("")}
            </tbody>
        </table>
    `;
}




// -------------------------------------RENDER MUSIC-------------------------------------

function renderMusic(data) {
    console.log(data);
    const view = document.querySelector('.view[data-view="music"]');
    renderTopGenresByRevenue(data);
    renderSalesOverTimeByGenre(data);
    renderTopGenresByUnitsSold(data);
    renderPlaylistsByRevenueCoverage(data);
}

function renderTopGenresByRevenue (data) {
    if (graphLoadingState.genreDistributionByGenre) return;

    let genres = [];
    let revenueByGenreList = [];

    const N_GENRES = 5;

    Object.values(data.topGenresByRevenue.slice(0, N_GENRES)).forEach(row => {
        genres.push(row.name);
        revenueByGenreList.push(row.revenue);
    });

    graphLoadingState.genreDistributionByGenre = new Chart(
        document.getElementById("genreDistributionByGenre"),
        {
            type: "doughnut",
            data: {
                labels: genres,
                datasets: [{
                    data: revenueByGenreList,
                    backgroundColor: generateColors(genres.length),
                    borderWidth: 0
                }]
            },
            options: {
                cutoutPercentage: 65,
                legend: {
                    position: "right",
                    labels: {
                        boxWidth: 14,
                        padding: 20
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function(t, data) {
                            const value = data.datasets[0].data[t.index];
                            const total = data.datasets[0].data.reduce((a,b)=>a+b,0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${data.labels[t.index]}: ${percent}%`;
                        }
                    }
                }
            }
        }
    );
}

function renderSalesOverTimeByGenre (data) {
    if (graphLoadingState.revenueByTopGenresOverTime) return;

    const rows = data?.revenueByTopGenresOverTime; 
    //the ? operator returns undefined if data is null or undefined.
    //the ?? operator returns the left value if not undefined/null or the right value if undefined/null
    const { periods, genres, seriesByGenre } = buildRevenueSeriesByGenre(rows, { maxGenres: 5 });

    if (periods.length === 0 || genres.length === 0) {
        console.warn("There is no data for revenueByTopGenresOverTime");
        return;
    }



    console.log("periods: ", periods);
    console.log("genres: ", genres);
    console.log("seriesBygenre: ", seriesByGenre);
    
    

    const ctx = document.getElementById("revenueByTopGenresOverTime");
    if (!ctx) return; // avoids crash
    
    const colors = generateColors(genres.length);
    
    const datasetsCharts = genres.map((g, i) => ({
        label: g,
        data: seriesByGenre[g],
        borderColor: colors[i],
        fill: false,          // NO área rellena
        pointRadius: 0,       // sin puntos (mucho más limpio)
        pointHitRadius: 8,    // hover sigue siendo fácil
        borderWidth: 2,
        lineTension: 0.25     // suaviza un poco (0 = rectas)
    }));




    graphLoadingState.revenueByTopGenresOverTime = new Chart(ctx, {
        type: "line",
        data: {
            labels: periods,
            datasets: datasetsCharts,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            title: {                 
                display: true,
                text: "Revenue Over Time By Genre"
            },

            legend: {                
                display: true,
                position: "top",
                labels: {
                    boxWidth: 18
                }
            },

            tooltips: {
                mode: "index",
                intersect: false,
                callbacks: {
                    label: function(tooltipItem, chartData) {
                    const label = chartData.datasets[tooltipItem.datasetIndex].label || "";
                    return `${label}: ${formatCurrency(tooltipItem.yLabel)}`;
                    }
                }
            },

            hover: {
                mode: "index",
                intersect: false
            },

            scales: {                // v2: xAxes/yAxes
                xAxes: [{
                    ticks: {
                    maxTicksLimit: 6,  // menos etiquetas = menos caos
                    autoSkip: true
                    },
                    gridLines: {
                    display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                    beginAtZero: true,
                    callback: function(v) { return formatCurrency(v); }
                    }
                }]
            },

            elements: {
            point: { radius: 0 }   // refuerzo global (por si algún dataset lo pisa)
            }
        }
    });
}

function renderTopGenresByUnitsSold (data) {
    const N_GENRES = 5;
    const rows = data.topGenresByUnitsSold.slice(0, N_GENRES);


    const el = document.getElementById("topGenresByUnitsSoldTable");
    if (!el) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        el.innerHTML = "<p style='color:#6b7280;margin:0'>No data</p>";
        return;
    }

    const max = Math.max(...rows.map(r => Number(r.revenue) || 0)) || 1;

    el.innerHTML = `
        <table class="tableStyle">
            <thead>
                <tr>
                <th class="rank-cell">#</th>
                <th>Genres</th>
                <th class="number-cell" style="text-align:right">Units Sold</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map((r, i) => {
                const revenue = Number(r.revenue) || 0;
                const pct = (revenue / max) * 100;

                return `
                    <tr>
                    <td class="rank-cell">${i + 1}</td>
                    <td>
                        <span class="table-title">${escapeHtml(r.name)}</span>
                    </td>
                    <td class="number-cell">
                        <div style="display:flex; align-items:center; gap:10px; justify-content:flex-end;">
                        <div class="progress" style="flex:1; max-width:160px;">
                            <div style="width:${pct.toFixed(1)}%"></div>
                        </div>
                        <div style="min-width:60px; text-align:right;">
                            ${formatNumber(r.unitsSold)}
                        </div>
                        </div>
                    </td>
                    </tr>
                `;
                }).join("")}
            </tbody>
        </table>
    `;
}

function renderPlaylistsByRevenueCoverage (data) {
    const N_PLAYLISTS = 5;

    //Eliminating repeated rows
    const unique = new Map();
    for (const item of data.playlistsByRevenueCoverage) {
        unique.set(item.playlist, item);
    }
    const finalArray = Array.from(unique.values());

    //slicing data
    const rows = finalArray.slice(0, N_PLAYLISTS);


    const el = document.getElementById("playlistsByRevenueCoverageTable");
    if (!el) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        el.innerHTML = "<p style='color:#6b7280;margin:0'>No data</p>";
        return;
    }

    const max = Math.max(...rows.map(r => Number(r.coverage_revenue) || 0)) || 1;

    el.innerHTML = `
        <table class="tableStyle">
            <thead>
                <tr>
                <th class="rank-cell">#</th>
                <th>Playlists</th>
                <th class="number-cell" style="text-align:right">Coverage Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map((r, i) => {
                const revenue = Number(r.coverage_revenue) || 0;
                const pct = (revenue / max) * 100;

                return `
                    <tr>
                    <td class="rank-cell">${i + 1}</td>
                    <td>
                        <span class="table-title">${escapeHtml(r.playlist)}</span>
                    </td>
                    <td class="number-cell">
                        <div style="display:flex; align-items:center; gap:10px; justify-content:flex-end;">
                        <div class="progress" style="flex:1; max-width:160px;">
                            <div style="width:${pct.toFixed(1)}%"></div>
                        </div>
                        <div style="min-width:60px; text-align:right;">
                            ${formatCurrency(r.coverage_revenue)}
                        </div>
                        </div>
                    </td>
                    </tr>
                `;
                }).join("")}
            </tbody>
        </table>
    `;
}

// -------------------------------------RENDER CUSTOMERS-------------------------------------
function renderCustomers(data) {
    console.log(data);
    const view = document.querySelector('.view[data-view="customers"]');
    renderRevenueByCountry(data, "customers_revenueByCountry", "customers_revenueByCountry");
    renderNewCustomersOverTime(data);
    renderTopCustomersTable(data);
    renderRevenueBySupportRepTable(data);
}

function renderNewCustomersOverTime(data) {

    if (graphLoadingState.newCustomersOverTime) return;
    
    const dates = [];
    const newCustomersList = [];

    for (const row of data.newCustomersOverTime) {
        dates.push(row.period);
        newCustomersList.push(row.new_customers);
    }

    const ctx = document.getElementById("newCustomersOverTime");
    if (!ctx) return;

    const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(59,130,246,0.35)");
    gradient.addColorStop(1, "rgba(59,130,246,0.05)");

    graphLoadingState.newCustomersOverTime = new Chart(ctx, {
        type: "line",
        data: {
            labels: dates,
            datasets: [{
                label: "Costumers",
                data: newCustomersList,
                borderWidth: 2.5,
                borderColor: "#2563eb",
                backgroundColor: gradient,
                fill: true,
                pointRadius: 0,
                lineTension: 0.25,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false },
            title: {
                display: false
            },
            tooltips: {
                mode: "index",
                intersect: false,
                backgroundColor: "#111827",
                callbacks: {
                    label: function(t) {
                        return formatNumber(t.yLabel);
                    }
                }
            },
            hover: {
                mode: "index",
                intersect: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 6,
                        fontColor: "#6b7280"
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: "rgba(0,0,0,0.05)"
                    },
                    ticks: {
                        beginAtZero: true,
                        fontColor: "#6b7280",
                        callback: function(v) {
                            return formatNumber(v);
                        }
                    }
                }]
            }
        }
    });
}

function renderTopCustomersTable(data) {
    const N_CUSTOMERS = 5;
    const rows = data.topCustomers.slice(0, N_CUSTOMERS);


    const el = document.getElementById("customers_topCustomersTable");
    if (!el) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        el.innerHTML = "<p style='color:#6b7280;margin:0'>No data</p>";
        return;
    }

    const max = Math.max(...rows.map(r => Number(r.revenue) || 0)) || 1;

    el.innerHTML = `
        <table class="tableStyle">
        <thead>
            <tr>
            <th class="rank-cell">#</th>
            <th>Customer</th>
            <th>Country</th>
            <th class="number-cell" style="text-align:right">Revenue</th>
            </tr>
        </thead>
        <tbody>
            ${rows.map((r, i) => {
            const revenue = Number(r.revenue) || 0;
            const pct = (revenue / max) * 100;

            return `
                <tr>
                <td class="rank-cell">${i + 1}</td>
                <td>
                    <span class="table-title">${escapeHtml(r.FirstName)}</span>
                    <span class="table-subtitle">${escapeHtml(r.LastName)}</span>
                </td>
                <td>
                    <span class="table-title">${escapeHtml(r.Country)}</span>
                </td>
                <td class="number-cell">
                    <div style="display:flex; align-items:center; gap:10px; justify-content:flex-end;">
                    <div class="progress" style="flex:1; max-width:160px;">
                        <div style="width:${pct.toFixed(1)}%"></div>
                    </div>
                    <div style="min-width:60px; text-align:right;">
                        ${formatCurrency(revenue)}
                    </div>
                    </div>
                </td>
                </tr>
            `;
            }).join("")}
        </tbody>
        </table>
    `;
}

function renderRevenueBySupportRepTable(data) {
    const rows = data.revenueBySupportRep;
    const el = document.getElementById("revenueBySupportRepTable");
    if (!el) return;

    if (!Array.isArray(rows) || rows.length === 0) {
        el.innerHTML = "<p style='color:#6b7280;margin:0'>No data</p>";
        return;
    }

    const max = Math.max(...rows.map(r => Number(r.revenue) || 0)) || 1;

    el.innerHTML = `
        <table class="tableStyle">
        <thead>
            <tr>
            <th class="rank-cell">#</th>
            <th>Representative</th>
            <th>Country</th>
            <th class="number-cell" style="text-align:right">Revenue</th>
            </tr>
        </thead>
        <tbody>
            ${rows.map((r, i) => {
            const revenue = Number(r.revenue) || 0;
            const pct = (revenue / max) * 100;

            return `
                <tr>
                <td class="rank-cell">${i + 1}</td>
                <td>
                    <span class="table-title">${escapeHtml(r.FirstName)}</span>
                    <span class="table-subtitle">${escapeHtml(r.LastName)}</span>
                </td>
                <td>
                    <span class="table-title">${escapeHtml(r.Country)}</span>
                </td>
                <td class="number-cell">
                    <div style="display:flex; align-items:center; gap:10px; justify-content:flex-end;">
                    <div class="progress" style="flex:1; max-width:160px;">
                        <div style="width:${pct.toFixed(1)}%"></div>
                    </div>
                    <div style="min-width:60px; text-align:right;">
                        ${formatCurrency(revenue)}
                    </div>
                    </div>
                </td>
                </tr>
            `;
            }).join("")}
        </tbody>
        </table>
    `;
}


// -------------------------------------RENDER GEOGRAPHY-------------------------------------
function renderGeography(data) {
    console.log(data);
    const view = document.querySelector('.view[data-view="geography"]');
    view.innerHTML = `
        HOLA, ESTO ES geography
    `;
}

// -------------------------------------RENDER EMPLOYEES-------------------------------------
function renderEmployees(data) {
    console.log(data);
    const view = document.querySelector('.view[data-view="employees"]');
    view.innerHTML = `
        HOLA, ESTO ES employees
    `;
}