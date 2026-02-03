import {formatCurrency, formatNumber, generateColors, downsample, getLastYearData, escapeHtml} from './modules/utils.js'

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
    revenueByCountry: null,
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
    console.log(data);
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

function renderRevenueOverTime(data, canvasId = "revenueOverTime", stateKey = "revenueOverTime") {

    if (graphLoadingState[stateKey]) return;

    const sampled = downsample(data.revenueOverTime, 7);

    const dates = [];
    const totalRevenueList = [];
    for (const row of sampled) {
        dates.push(row.date);
        totalRevenueList.push(row.totalRevenue);
    }

    const ctx = document.getElementById(canvasId);
    if (!ctx) return; // evita crash silencioso
    
    graphLoadingState[stateKey] = new Chart(
        ctx,
        {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    label: "Revenue Over Time",
                    data: totalRevenueList,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3,
                    backgroundColor: "#3b82f6",
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Revenue Over Time"
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: v => formatCurrency(v)
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 3,
                        }
                    }
                }
            }
        }
    );
}

function renderRevenueByGenre(data) {
    if (graphLoadingState.revenueByGenre) return;

    let genres = [];
    let revenueByGenreList = [];

    const N_GENRES = 5;

    Object.values(data.revenueByGenre.slice(0, N_GENRES)).forEach(row => {
        genres.push(row.genre);
        revenueByGenreList.push(row.revenue);
    });

    graphLoadingState.revenueByGenre = new Chart(
        document.getElementById("revenueByGenre"),
        {
            type: "pie",
            data: {
                labels: genres,
                datasets: [{
                    label: "Revenue By Genre",
                    data: revenueByGenreList,
                    backgroundColor: generateColors(genres.length),
                }]
            },
            options: {
                indexAxis: "y",
                title: {
                    display: true,
                    text: "Revenue by Genre"
                },
                legend: {
                    display: true,
                    position:"right",
                }
            }
        }
    );
}

function renderLastYearRevenue(data) {
    if (graphLoadingState.lastYearRevenue) return;

    const lastYearData = getLastYearData(data.revenueOverTime);
    const sampled = downsample(lastYearData, 7); //weekly

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
                labels: dates.slice(0,12),
                datasets: [{
                    label: "Last Year Revenue",
                    data: totalRevenueList.slice(0,12),
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.3,
                    backgroundColor: "#3b82f6",
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: "Last Year Revenue"
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: v => formatCurrency(v),
                            maxTicksLimit: 2,
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 6,
                        }
                    },
                }
            }
        }
    );
}

function renderTopArtists(data) {
    if (graphLoadingState.topArtists) return;

    let artists = [];
    let topArtistsByRevenue = [];

    const N_ARTISTS = 10;
    Object.values(data.topArtistsByRevenue.slice(0, N_ARTISTS)).forEach(row => {
        artists.push(row.artist);
        topArtistsByRevenue.push(row.revenue);
    });

    graphLoadingState.topArtists = new Chart(
        document.getElementById("topArtistsByRevenue"),
        {
            type: "bar",
            data: {
                labels: artists,
                datasets: [{
                    label: "Top Artists",
                    data: topArtistsByRevenue,
                    backgroundColor: generateColors(artists.length),
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: "Revenue by Artist"
                    },
                    legend: {
                        display: false,
                    }
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
    renderRevenueByCountry(data);
    renderTopTracksTable(data);
    renderTopCustomers(data);
}

function renderSalesMetric(data) {
    document.getElementById("totalSales").innerHTML = `${formatCurrency(data.totalRevenue)}`;
    document.getElementById("totalSalesInvoices").innerHTML = `${formatNumber(data.totalInvoices)}`;
    document.getElementById("tracksSalesSold").innerHTML = `${formatNumber(data.tracksSold)}`;
    document.getElementById("averageOrderPrice").innerHTML = `${formatCurrency(data.averageOrderPrice)}`;
}

function renderRevenueByCountry(data) {
    if (graphLoadingState.revenueByCountry) return;

    let countries = [];
    let revenueByCountryList = [];

    const N_COUNTRIES = 5;

    Object.values(data.revenueByCountry.slice(0, N_COUNTRIES)).forEach(row => {
        countries.push(row.BillingCountry);
        revenueByCountryList.push(row.revenueByCountry);
    });

    const ctx = document.getElementById("revenueByCountry");
    if (!ctx) return; // evita crash silencioso
    
    graphLoadingState.revenueByCountry = new Chart(
        ctx,
        {
            type: "pie",
            data: {
                labels: countries,
                datasets: [{
                    label: "Revenue By Country",
                    data: revenueByCountryList,
                    backgroundColor: generateColors(countries.length),
                }]
            },
            options: {
                // indexAxis: "y",
                title: {
                    display: true,
                    text: "Revenue by Country"
                },
                legend: {   
                    display: true,
                    position:"right",
                    align: "center",

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
        <table class="top-tracks-table">
        <thead>
            <tr>
            <th class="rank-cell">#</th>
            <th>Track</th>
            <th class="sales-cell" style="text-align:right">Sales</th>
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
                    <span class="track-title">${escapeHtml(r.track)}</span>
                    <span class="track-artist">${escapeHtml(r.artist)}</span>
                </td>
                <td class="sales-cell">
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
        <table class="top-tracks-table">
            <thead>
                <tr>
                <th class="rank-cell">#</th>
                <th>Name</th>
                <th class="sales-cell" style="text-align:right">Revenue</th>
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
                        <span class="track-title">${escapeHtml(r.FirstName + ' ' + r.LastName)}</span>
                        <span class="track-artist">${escapeHtml(r.Country)}</span>
                    </td>
                    <td class="sales-cell">
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
    view.innerHTML = `
        HOLA, ESTO ES music
    `;
}

// -------------------------------------RENDER CUSTOMERS-------------------------------------
function renderCustomers(data) {
    console.log(data);
    const view = document.querySelector('.view[data-view="customers"]');
    view.innerHTML = `
        HOLA, ESTO ES customers
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