// import { createElement } from "./modules/dom.js";
// import { log } from "./modules/utils.js";

const loadBtn = document.getElementById("load");
const tbody = document.getElementById("table");
const primaryTable = document.getElementById("primaryTable");

const buttons = document.querySelectorAll('.sidebar-nav button');
const views = document.querySelectorAll('.view');


const topBar = document.querySelector('.topbar');



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



const loaded = {};

function loadSales() {
    if (loaded.sales) return;
    loaded.sales = true;
    topBar.innerHTML = "<h1>Sales</h1>";
//   const res = await fetch("/api/analytics/sales");
//   const data = await res.json();

//   renderSalesCharts(data);
}

function loadOverview() {
    if (loaded.overview) return;
    loaded.overview = true;    
    topBar.innerHTML = "<h1>Overview</h1>";

}

function loadMusic() {
    if (loaded.music) return;
    loaded.music = true;    
    topBar.innerHTML = "<h1>Music</h1>";
}

function loadCustomers() {
    if (loaded.customers) return;
    loaded.customers = true;    
    topBar.innerHTML = "<h1>Customers</h1>";
}

function loadGeography() {
    if (loaded.geography) return;
    loaded.geography = true;    
    topBar.innerHTML = "<h1>Geography</h1>";
}

function loadEmployees() {
    if (loaded.employees) return;
    loaded.employees = true;    
    topBar.innerHTML = "<h1>Employees</h1>";
}





// const xValues = ["Italy", "France", "Spain", "USA", "Argentina"];
// const yValues = [55, 49, 44, 24, 15];
// const barColors = ["red", "green", "blue", "orange", "brown"];
// new Chart("myChart", {
//    type: "bar", //THIS CAN BE "pie" as well
//    data: {
//        labels: xValues,
//        datasets: [{
//            backgroundColor: barColors,
//            data: yValues
//        }]
//    },
//    options: {
//        title: {
//            display: true,
//            text: "World Wide Wine Production"
//        }
//    }
// });





function createTable(JSONdata) {
    if (!JSONdata.length) return "<p>No data</p>";

    let innerHTMLTable = "";
    innerHTMLTable += "<thead>";
    
    Object.keys(JSONdata[0]).forEach(key => {
        innerHTMLTable += `\n   <th>${key}</th>`;});
    innerHTMLTable += "\n</thead";
    innerHTMLTable += "<tbody>";

    for (const row of JSONdata) {
        innerHTMLTable += `\n    <tr>`;
        Object.values(row).forEach(column => {
            innerHTMLTable += `\n       <td>${column}</td>`;
        });
        innerHTMLTable += `\n    </tr>`;
    }
    innerHTMLTable += "</tbody>";
    
    return innerHTMLTable;
}


// loadBtn.addEventListener("click", () => {
//   fetch("/api/analytics/top-tracks")
//     .then(res => res.json())
//     .then(data => {      
//     createTable(data);
//       tbody.innerHTML = "";
//       data.forEach(row => {
//         tbody.innerHTML += `
//           <tr>
//             <td>${row.Name}</td>
//             <td>${row.sales}</td>
//           </tr>
//         `;
//       });
//     });
// });
loadBtn.addEventListener("click", () => {
  fetch("/api/analytics/top-tracks")        
    .then(res => res.json())
    .then(data => {      
        primaryTable.innerHTML = createTable(data);
    });
});









