import {formatCurrency, formatNumber, generateColors, downsample, getLastYearData} from './modules/utils.js'

/*

{
  "totalRevenue": 24738.93,
  "totalInvoices": 1430,
  "uniqueCustomers": 305,
  "tracksSold": 12208,

  "revenueOverTime": [
    { "date": "2014-01", "value": 520.30 },
    { "date": "2014-02", "value": 610.20 }
  ],

  "revenueByGenre": [
    { "genre": "Rock", "value": 8350.40 },
    { "genre": "Jazz", "value": 4200.10 }
  ],

  "topArtistsByRevenue": [
    { "artist": "Iron Maiden", "value": 13850.22 }
  ]
}


*/


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
    revenueOverTime: null,
    revenueByGenre: null,
    lastYearRevenue: null,
    topArtists: null,
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
    const view = document.querySelector('.view[data-view="overview"]');
    renderOverviewMetrics(data);
    renderRevenueOverTime(data);
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

function renderRevenueOverTime(data) {
    if (graphLoadingState.revenueOverTime) return;

    const sampled = downsample(data.revenueOverTime, 7); // 1 punto por semana

    const dates = [];
    const totalRevenueList = [];

    for (const row of sampled) {
        dates.push(row.date);
        totalRevenueList.push(row.totalRevenue);
    }

    graphLoadingState.revenueOverTime = new Chart(
        document.getElementById("revenueOverTime"),
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

    const N_GENRES = 10;

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
                plugins: {
                    title: {
                        display: true,
                        text: "Revenue by Genre"
                    },
                    legend: {
                        display: false,
                    }
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
                            callback: v => formatCurrency(v)
                        }
                    }
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
    console.log(data);
    const view = document.querySelector('.view[data-view="sales"]');

    view.innerHTML = `
        <div class="metric">
        <h2>Total Sales</h2>
        <p>$${data.totalSales.toFixed(2)}</p>
        </div>
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