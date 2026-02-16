import {formatCurrency, formatNumber, generateColors, downsample, getLastYearData, escapeHtml, buildRevenueSeriesByGenre, buildRevenueSeriesBySupportRep} from './modules/utils.js'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");

      // Si hay un SW nuevo esperando, lo activamos
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // nueva versión lista
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });

      // cuando cambie el controller, recargar una vez
      let refreshed = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshed) return;
        refreshed = true;
        window.location.reload();
      });
    } catch (err) {
      console.error("SW register error:", err);
    }
  });
}



const menuBtn = document.querySelector(".menu-btn");
const sideBar = document.querySelector(".sidebar");
const iconOpen = document.querySelector(".icon-open");
const backdrop = document.querySelector(".backdrop");

const DESKTOP_BP = 901; // mismo valor que tu CSS (ej: @media (max-width: 900px))
const mqlDesktop = window.matchMedia(`(min-width: ${DESKTOP_BP}px)`);

menuBtn.addEventListener("click", toggleMenu);
backdrop.addEventListener("click", closeMenu);

// ---------- estado explícito ----------
function openMenu() {
  sideBar.classList.add("show-menu");
  iconOpen.style.display = "none";
  backdrop.hidden = false;
  menuBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("no-scroll"); // opcional (bloquear scroll en mobile)
}

function closeMenu() {
  sideBar.classList.remove("show-menu");
  iconOpen.style.display = "inline-block";
  backdrop.hidden = true;
  menuBtn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
}

function toggleMenu() {
  if (sideBar.classList.contains("show-menu")) closeMenu();
  else openMenu();
}

// ---------- sincronización con resize ----------
function syncMenuWithViewport() {
  // si estamos en desktop, el drawer móvil debe quedar cerrado sí o sí
  if (mqlDesktop.matches) {
    closeMenu();
  }
}

// al cargar
syncMenuWithViewport();

// cuando cambia el media query
if (mqlDesktop.addEventListener) {
  mqlDesktop.addEventListener("change", syncMenuWithViewport);
} else {
  // fallback navegadores viejos
  mqlDesktop.addListener(syncMenuWithViewport);
}







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
    //employees
    customersBySupportRep: null,
    revenueBySupportRepOverTime: null,
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
        const res = await fetch("/api/analytics/overview");
        const data = await res.json();
        viewLoadingState.overview = data;
    }
    return viewLoadingState.overview;
}
async function fetchSales() {
    if (!viewLoadingState.sales) {
        const res = await fetch("/api/analytics/sales");
        const data = await res.json();
        viewLoadingState.sales = data;
    }
    return viewLoadingState.sales;
}
async function fetchMusic() {
    if (!viewLoadingState.music) {
        const res = await fetch("/api/analytics/music");
        const data = await res.json();
        viewLoadingState.music = data;
    }
    return viewLoadingState.music;
}
async function fetchCustomers() {
    if (!viewLoadingState.customers) {
        const res = await fetch("/api/analytics/customers");
        const data = await res.json();
        viewLoadingState.customers = data;
    }
    return viewLoadingState.customers;
}
async function fetchGeography() {
    if (!viewLoadingState.geography) {
        const res = await fetch("/api/analytics/geography");
        const data = await res.json();
        viewLoadingState.geography = data;
    }
    return viewLoadingState.geography;
}
async function fetchEmployees() {
    if (!viewLoadingState.employees) {
        const res = await fetch("/api/analytics/employees");
        const data = await res.json();
        viewLoadingState.employees = data;
    }
    return viewLoadingState.employees;
}

// -------------------------------------RENDERING-------------------------------------

// -------------------------------------RENDER OVERVIEW-------------------------------------
function renderOverview(data) {
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
    totalRevenueList.push(Number(row.totalRevenue) || 0);
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(59,130,246,0.35)");
  gradient.addColorStop(1, "rgba(59,130,246,0.05)");

  graphLoadingState[stateKey] = new Chart(canvas, {
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
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          backgroundColor: "#111827",
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 6,
            color: "#6b7280"
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            color: "#6b7280",
            callback: (v) => formatCurrency(v)
          }
        }
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
    revenueByGenreList.push(Number(row.revenue) || 0);
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
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 14,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = Number(context.raw) || 0;
                const total = context.dataset.data.reduce((a, b) => a + Number(b || 0), 0);
                const percent = total ? ((value / total) * 100).toFixed(1) : "0.0";
                return `${context.label}: ${percent}%`;
              }
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
    totalRevenueList.push(Number(row.totalRevenue) || 0);
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
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111827",
            callbacks: {
              label: (context) => formatCurrency(context.parsed.y)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 6,
              color: "#6b7280"
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: {
              color: "#6b7280",
              callback: (v) => formatCurrency(v)
            }
          }
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
    revenues.push(Number(row.revenue) || 0);
  });

  graphLoadingState.topArtists = new Chart(
    document.getElementById("topArtistsByRevenue"),
    {
      type: "bar",
      data: {
        labels: artists,
        datasets: [{
          data: revenues,
          backgroundColor: "rgba(59,130,246,0.8)",
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111827",
            callbacks: {
              label: (context) => formatCurrency(context.parsed.x)
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: {
              color: "#6b7280",
              callback: (v) => formatCurrency(v)
            }
          },
          y: {
            grid: { display: false },
            ticks: {
              color: "#374151"
            }
          }
        }
      }
    }
  );
}



// -------------------------------------RENDER SALES-------------------------------------
function renderSales(data) {
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

  const N_COUNTRIES = 5;
  const countries = [];
  const revenueByCountryList = [];

  data.revenueByCountry.slice(0, N_COUNTRIES).forEach(row => {
    countries.push(row.BillingCountry);
    revenueByCountryList.push(Number(row.revenueByCountry) || 0);
  });

  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  graphLoadingState[stateKey] = new Chart(canvas, {
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
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 14,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = Number(context.raw) || 0;
              const total = context.dataset.data.reduce((a, b) => a + Number(b || 0), 0);
              const percent = total ? ((value / total) * 100).toFixed(1) : "0.0";
              return `${context.label}: ${percent}%`;
            }
          }
        }
      }
    }
  });
}

function renderTopTracksTable(data) {
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
    renderTopGenresByRevenue(data);
    renderSalesOverTimeByGenre(data);
    renderTopGenresByUnitsSold(data);
    renderPlaylistsByRevenueCoverage(data);
}

function renderTopGenresByRevenue(data) {
  if (graphLoadingState.genreDistributionByGenre) return;

  const N_GENRES = 5;
  const genres = [];
  const revenueByGenreList = [];

  data.topGenresByRevenue.slice(0, N_GENRES).forEach(row => {
    genres.push(row.name);
    revenueByGenreList.push(Number(row.revenue) || 0);
  });

  const canvas = document.getElementById("genreDistributionByGenre");
  if (!canvas) return;

  graphLoadingState.genreDistributionByGenre = new Chart(canvas, {
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
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 14,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = Number(context.raw) || 0;
              const total = context.dataset.data.reduce((a, b) => a + Number(b || 0), 0);
              const percent = total ? ((value / total) * 100).toFixed(1) : "0.0";
              return `${context.label}: ${percent}%`;
            }
          }
        }
      }
    }
  });
}

function renderSalesOverTimeByGenre(data) {
  if (graphLoadingState.revenueByTopGenresOverTime) return;

  const rows = data?.revenueByTopGenresOverTime;
  const { periods, genres, seriesByGenre } = buildRevenueSeriesByGenre(rows, { maxGenres: 5 });

  if (!periods.length || !genres.length) {
    console.warn("There is no data for revenueByTopGenresOverTime");
    return;
  }

  const canvas = document.getElementById("revenueByTopGenresOverTime");
  if (!canvas) return;

  const colors = generateColors(genres.length);

  const datasetsCharts = genres.map((g, i) => ({
    label: g,
    data: seriesByGenre[g] || [],
    borderColor: colors[i],
    backgroundColor: colors[i],
    fill: false,
    pointRadius: 0,
    pointHoverRadius: 3,
    pointHitRadius: 8,
    borderWidth: 2,
    tension: 0.25
  }));

  graphLoadingState.revenueByTopGenresOverTime = new Chart(canvas, {
    type: "line",
    data: {
      labels: periods,
      datasets: datasetsCharts
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        title: {
          display: false,
          text: "Revenue Over Time By Genre"
        },
        legend: {
          display: true,
          position: "top",
          labels: {
            boxWidth: 18
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset?.label || "";
              return `${label}: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 6,
            autoSkip: true
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => formatCurrency(v)
          },
          grid: {
            color: "rgba(0,0,0,0.06)"
          }
        }
      },
      elements: {
        point: { radius: 0 }
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
    renderRevenueByCountry(data, "customers_revenueByCountry", "customers_revenueByCountry");
    renderNewCustomersOverTime(data);
    renderTopCustomersTable(data);
    renderRevenueBySupportRepTable("customers_revenueBySupportRepTable", data);
}

function renderNewCustomersOverTime(data) {
  if (graphLoadingState.newCustomersOverTime) return;

  const dates = [];
  const newCustomersList = [];

  for (const row of data.newCustomersOverTime || []) {
    dates.push(row.period);
    newCustomersList.push(Number(row.new_customers) || 0);
  }

  const canvas = document.getElementById("newCustomersOverTime");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(59,130,246,0.35)");
  gradient.addColorStop(1, "rgba(59,130,246,0.05)");

  graphLoadingState.newCustomersOverTime = new Chart(canvas, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: "Customers",
        data: newCustomersList,
        borderWidth: 2.5,
        borderColor: "#2563eb",
        backgroundColor: gradient,
        fill: true,
        pointRadius: 0,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          backgroundColor: "#111827",
          callbacks: {
            label: (context) => formatNumber(context.parsed.y)
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 6,
            color: "#6b7280"
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            color: "#6b7280",
            callback: (v) => formatNumber(v)
          }
        }
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

function renderRevenueBySupportRepTable(canvasId, data) {
    let rows;
    if (canvasId === "customers_revenueBySupportRepTable") rows = data.revenueBySupportRep;
    else if (canvasId === "employees_revenueBySupportRepTable") rows = data.supportRepPerformance;

    const el = document.getElementById(canvasId);
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
  renderCustomersByCountryGraph(data);
  renderCustomersByCountryTable(data);

  makeOverlayDraggable({
    overlaySelector: ".geo-overlay-table",
    containerSelector: ".geo-map-card",
  });
}


async function renderCustomersByCountryGraph(data) {
  const rows = data.customersByCountry || [];
  if (!rows.length) return;

  const canvas = document.getElementById("geoMap");
  if (!canvas) return;

  const norm = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const countryAlias = {
    "usa": "united states of america",
    "united states": "united states of america",
    "uk": "united kingdom",
    "czech republic": "czechia",
    "south korea": "korea, republic of",
    "russia": "russian federation"
  };

  // topojson con más detalle
  const world = await fetch("assets/maps/countries-50m.json")
    .then((r) => r.json());

  const countries = ChartGeo.topojson.feature(world, world.objects.countries).features;

  // 1) arma map revenue por nombre normalizado de país
  const valueByName = new Map(
    rows.map((r) => {
      const raw = norm(r.Country);
      const key = countryAlias[raw] || raw;
      return [key, Number(r.revenue) || 0];
    })
  );

  // 2) dataset para geo chart
  const dataset = countries.map((f) => {
    const mapName = norm(f.properties?.name);
    return {
      feature: f,
      value: valueByName.get(mapName) ?? 0
    };
  });

  if (graphLoadingState.customersByCountryMap) {
    graphLoadingState.customersByCountryMap.destroy();
  }

  graphLoadingState.customersByCountryMap = new Chart(canvas, {
    type: "choropleth",
    data: {
      labels: countries.map((d) => d.properties.name),
      datasets: [{
        label: "Revenue by Country",
        data: dataset
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio || 1,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items?.[0]?.raw?.feature?.properties?.name || "",
            label: (ctx) => `Revenue: ${formatCurrency(ctx.raw?.value || 0)}`
          }
        }
      },
      scales: {
        projection: {
          axis: "x",
          projection: "equalEarth"
        },
        color: {
          axis: "x",
          quantize: 5,
          legend: { position: "bottom-right" }
        }
      }
    }
  });
}



function renderCustomersByCountryTable(data) {
    const N_COUNTRIES = 5;
    const rows = data.customersByCountry.slice(0, N_COUNTRIES);


    const el = document.getElementById("customersByCountryTable");
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
            <th>Country</th>
            <th>Customers</th>
            <th class="number-cell" style="text-align:right">Total Sales</th>
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
                    <span class="table-title">${escapeHtml(r.Country)}</span>
                </td>
                <td>
                    <span style="display:flex; justify-content: center;" class="table-title">${escapeHtml(r.TotalClients)}</span>
                </td>
                <td class="number-cell">
                    <div style="display:flex; align-items:center; gap:10px; justify-content:flex-end;">
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

// -------------------------------------RENDER EMPLOYEES-------------------------------------
function renderEmployees(data) {
    renderEmployeesMetrics(data);

    renderRevenueBySupportRepOverTime(data);
    renderCustomersBySupportRep(data);
    renderRevenueBySupportRepTable("employees_revenueBySupportRepTable", data)
    renderSupportRepPerformanceTable(data);
}

function renderEmployeesMetrics(data) {
    document.getElementById("totalEmployees").innerHTML = `${formatNumber(data.employeesMetrics.totalEmployees)}`;
    document.getElementById("supportReps").innerHTML = `${formatNumber(data.employeesMetrics.totalSupportReps)}`;
    document.getElementById("customersAssisted").innerHTML = `${formatNumber(data.employeesMetrics.totalClientsAssisted)}`;
    document.getElementById("revenueManaged").innerHTML = `${formatCurrency(data.employeesMetrics.totalRevenueGenerated)}`;
}

function renderSupportRepPerformanceTable(data) {
    const rows = data.supportRepPerformance;

    const el = document.getElementById("supportRepPerformanceTable");
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
            <th class="rank-cell">Rank</th>
            <th>Support Rep</th>
            <th>Customers</th>
            <th>Invoices</th>
            <th class="number-cell" style="text-align:right">Total Revenue</th>
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
                    <span class="table-title">${escapeHtml(r.totalCustomers)}</span>
                </td>
                <td>
                    <span class="table-title">${escapeHtml(r.totalInvoices)}</span>
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

function renderCustomersBySupportRep(data) {
    if (graphLoadingState.customersBySupportRep) return;   

    const N_SUPPORT_REPS = 3;
    const supportReps = [];
    const customersQuantityList = [];

    data.supportRepPerformance.slice(0, N_SUPPORT_REPS).forEach(row => {
        supportReps.push(row.FirstName + " " + row.LastName);
        customersQuantityList.push(Number(row.totalCustomers) || 0);
    });

    graphLoadingState.customersBySupportRep = new Chart(
        document.getElementById("customersBySupportRep"),
        {
        type: "doughnut",
        data: {
            labels: supportReps,
            datasets: [{
            data: customersQuantityList,
            backgroundColor: generateColors(supportReps.length),
            borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
            legend: {
                position: "right",
                labels: {
                boxWidth: 14,
                padding: 20
                }
            },
            tooltip: {
                callbacks: {
                label: (context) => {
                    const value = Number(context.raw) || 0;
                    const total = context.dataset.data.reduce((a, b) => a + Number(b || 0), 0);
                    const percent = total ? ((value / total) * 100).toFixed(1) : "0.0";
                    return `${context.label}: ${percent}%`;
                }
                }
            }
            }
        }
        }
    );
}

function renderRevenueBySupportRepOverTime(data) {
    if (graphLoadingState.revenueBySupportRepOverTime) return;

    const rows = data?.revenueBySupportRepOverTime;
    const { periods, supportReps, seriesBySupportRep } = buildRevenueSeriesBySupportRep(rows, { maxSupportReps: 3 });

    if (!periods.length || !supportReps.length) {
    console.warn("There is no data for revenueBySupportRepOverTime");
    return;
    }

    const canvas = document.getElementById("revenueBySupportRepOverTime");
    if (!canvas) return;

    const colors = generateColors(supportReps.length);

    const datasetsCharts = supportReps.map((g, i) => ({
        label: g,
        data: seriesBySupportRep[g] || [],
        borderColor: colors[i],
        backgroundColor: colors[i],
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointHitRadius: 8,
        borderWidth: 2,
        tension: 0.25
    }));

    graphLoadingState.revenueBySupportRepOverTime = new Chart(canvas, {
    type: "line",
    data: {
        labels: periods,
        datasets: datasetsCharts
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
        mode: "index",
        intersect: false
        },
        plugins: {
        title: {
            display: false,
            text: "Revenue Over Time By Support Rep"
        },
        legend: {
            display: true,
            position: "top",
            labels: {
            boxWidth: 18
            }
        },
        tooltip: {
            callbacks: {
            label: (context) => {
                const label = context.dataset?.label || "";
                return `${label}: ${formatCurrency(context.parsed.y)}`;
            }
            }
        }
        },
        scales: {
        x: {
            ticks: {
            maxTicksLimit: 6,
            autoSkip: true
            },
            grid: {
            display: false
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
            callback: (v) => formatCurrency(v)
            },
            grid: {
            color: "rgba(0,0,0,0.06)"
            }
        }
        },
        elements: {
        point: { radius: 0 }
        }
    }
    });
}