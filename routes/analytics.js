const express = require("express");
const router = express.Router();
const db = require("../database/db");

//------------------------------------------------------- /SQL QUERIES/ ------------------------------------------------------- 


// ---------------------------- /OVERVIEW QUERIES/ ---------------------------- 


const overviewSQL = `
SELECT
    SUM(ii.Quantity * ii.UnitPrice) AS totalRevenue,
    COUNT(DISTINCT ii.InvoiceId) AS totalInvoices,
    COUNT(DISTINCT i.CustomerId) AS uniqueCustomers,
    SUM(ii.Quantity) AS tracksSold
FROM invoice_items ii
JOIN invoices i
    ON ii.InvoiceId = i.InvoiceId;
`;

const revenueByGenreSQL = `
SELECT
    gen.Name AS genre,
    SUM(ii.Quantity * ii.UnitPrice) AS revenue
FROM genres gen
JOIN tracks tr
    ON tr.GenreId = gen.GenreId
JOIN invoice_items ii
    ON ii.TrackId = tr.TrackId
GROUP BY gen.GenreId, gen.Name
ORDER BY revenue DESC
LIMIT 5;
`;

const revenueOverTimeSQL = `
SELECT
    DATE(inv.InvoiceDate) AS date,
    SUM(ii.Quantity * ii.UnitPrice) AS totalRevenue
FROM invoice_items ii
JOIN invoices inv
    ON ii.InvoiceId = inv.InvoiceId
GROUP BY DATE(inv.InvoiceDate)
ORDER BY DATE(inv.InvoiceDate);
`;

const topArtistsByRevenueSQL  = `
SELECT
    ar.Name AS artist,
    ROUND(SUM(ii.Quantity * ii.UnitPrice), 2) AS revenue
FROM invoice_items ii
JOIN tracks tr   ON ii.TrackId = tr.TrackId
JOIN albums al   ON tr.AlbumId = al.AlbumId
JOIN artists ar  ON al.ArtistId = ar.ArtistId
GROUP BY ar.ArtistId, ar.Name
ORDER BY revenue DESC;


`;
// ---------------------------- /OVERVIEW QUERIES/ ---------------------------- 

// ---------------------------- /SALES QUERIES/ ---------------------------- 
const salesMetricsSQL = `
WITH
metrics_items AS (
  SELECT
    SUM(ii.Quantity * ii.UnitPrice) AS totalRevenue,
    COUNT(DISTINCT ii.InvoiceId)     AS totalInvoices,
    SUM(ii.Quantity)                 AS tracksSold
  FROM invoice_items ii
),
metrics_invoices AS (
  SELECT AVG(Total) AS averageOrderPrice
  FROM invoices
)
SELECT
  mi.totalRevenue,
  mi.totalInvoices,
  mi.tracksSold,
  mv.averageOrderPrice
FROM metrics_items mi
CROSS JOIN metrics_invoices mv;

`;

const revenueByCountrySQL = `
SELECT
  inv.BillingCountry,
  SUM(inv.Total) AS revenueByCountry
FROM invoices inv
GROUP BY inv.BillingCountry
ORDER BY revenueByCountry DESC;
`;

const topTracksByRevenueSQL = `
SELECT
  tr.Name AS track,
  ar.Name AS artist,
  SUM(ii.Quantity * ii.UnitPrice) AS revenue,
  SUM(ii.Quantity) AS units
FROM invoice_items ii
JOIN tracks tr  ON tr.TrackId = ii.TrackId
JOIN albums al  ON al.AlbumId = tr.AlbumId
JOIN artists ar ON ar.ArtistId = al.ArtistId
GROUP BY tr.TrackId
ORDER BY revenue DESC
LIMIT 10;
`;

const topCustomersSQL = `
SELECT
  cus.CustomerId,
  cus.FirstName AS FirstName,
  cus.LastName AS LastName,
  cus.Country AS Country,
  cus.Email AS email,
  SUM(inv.Total) AS revenue,
  COUNT(inv.InvoiceId) AS invoices
FROM invoices inv
JOIN customers cus ON cus.CustomerId = inv.CustomerId
GROUP BY
  cus.CustomerId, cus.FirstName, cus.LastName, cus.Country, cus.Email
ORDER BY revenue DESC
LIMIT 10;

`;


// ---------------------------- /SALES QUERIES/ ---------------------------- 

// ---------------------------- /MUSIC QUERIES/ ---------------------------- 
const topGenresByRevenueSQL = `
SELECT
  gen.GenreId AS id,
  gen.Name    AS name,
  SUM(ii.Quantity * ii.UnitPrice) AS revenue,
  SUM(ii.Quantity) AS unitsSold
FROM genres gen
JOIN tracks tr       ON tr.GenreId = gen.GenreId
JOIN invoice_items ii ON ii.TrackId = tr.TrackId
GROUP BY gen.GenreId
ORDER BY revenue DESC
LIMIT 10;
`;
const topGenresByUnitsSoldSQL = `
SELECT
  gen.GenreId AS id,
  gen.Name    AS name,
  SUM(ii.Quantity * ii.UnitPrice) AS revenue,
  SUM(ii.Quantity) AS unitsSold
FROM genres gen
JOIN tracks tr       ON tr.GenreId = gen.GenreId
JOIN invoice_items ii ON ii.TrackId = tr.TrackId
GROUP BY gen.GenreId
ORDER BY unitsSold DESC
LIMIT 10;
`;

const playlistsByRevenueCoverageSQL = `
SELECT
  p.Name AS playlist,
  SUM(ii.Quantity * ii.UnitPrice) AS coverage_revenue,
  SUM(ii.Quantity) AS coverage_units
FROM invoice_items ii
JOIN tracks tr
  ON tr.TrackId = ii.TrackId
JOIN playlist_track pt
  ON pt.TrackId = tr.TrackId
JOIN playlists p
  ON p.PlaylistId = pt.PlaylistId
GROUP BY p.PlaylistId, p.Name
ORDER BY coverage_revenue DESC
LIMIT 10;
`;
 
// ---------------------------- /MUSIC QUERIES/ ---------------------------- 


// ---------------------------- /CUSTOMERS QUERIES/ ---------------------------- 
const newCustomersOverTimeSQL = `
WITH first_purchase AS (
  SELECT
    CustomerId,
    MIN(InvoiceDate) AS first_date
  FROM invoices
  GROUP BY CustomerId
)
SELECT
  strftime('%Y-%m', first_date) AS period,
  COUNT(*) AS new_customers
FROM first_purchase
GROUP BY period
ORDER BY period;
`;

// ---------------------------- /CUSTOMERS QUERIES/ ---------------------------- 
const revenueBySupportRepSQL = `
SELECT
  emp.EmployeeId,
  emp.LastName AS LastName,
  emp.FirstName AS FirstName,
  emp.Country AS Country,
  SUM(inv.Total) AS revenue
FROM employees emp
JOIN customers cust ON cust.SupportRepId = emp.EmployeeId
JOIN invoices inv ON inv.CustomerId = cust.CustomerId
GROUP BY emp.EmployeeId
ORDER BY revenue DESC;
`;

// ---------------------------- /GEOGRAPHY QUERIES/ ---------------------------- 
const customersByCountrySQL = `
SELECT
    cust.Country AS Country,
    SUM(inv.Total) AS revenue,
    COUNT(DISTINCT cust.CustomerId) AS TotalClients
FROM customers cust
JOIN invoices inv ON inv.CustomerId = cust.CustomerId
GROUP BY cust.Country
ORDER BY revenue DESC;
`;

// ---------------------------- /EMPLOYEES QUERIES/ ---------------------------- 



//metrics


const employeesMetricsSQL = `
SELECT
  -- Total empleados en la tabla employees
  (SELECT COUNT(*) FROM employees) AS totalEmployees,

  -- Empleados que efectivamente tienen clientes asignados como soporte
  (SELECT COUNT(DISTINCT SupportRepId)
   FROM customers
   WHERE SupportRepId IS NOT NULL) AS totalSupportReps,

  -- Clientes que tienen SupportRep asignado
  (SELECT COUNT(*)
   FROM customers
   WHERE SupportRepId IS NOT NULL) AS totalClientsAssisted,

  -- Revenue total gestionado por esos support reps
  (SELECT COALESCE(SUM(inv.Total), 0)
   FROM invoices inv
   JOIN customers cust ON cust.CustomerId = inv.CustomerId
   WHERE cust.SupportRepId IS NOT NULL) AS totalRevenueGenerated;
`;

//graphs
const revenueBySupportRepOverTimeSQL = `
SELECT
  strftime('%Y-%m', inv.InvoiceDate) AS period,
  emp.EmployeeId AS employeeId,
  emp.FirstName    AS FirstName,
  emp.LastName    AS LastName,
  SUM(inv.Total)  AS revenue
FROM employees emp
JOIN customers cust ON cust.SupportRepId = emp.EmployeeId
JOIN invoices inv ON inv.CustomerId = cust.CustomerId
GROUP BY period, employeeId
ORDER BY period ASC, employeeId ASC;
`;

const supportRepPerformanceSQL = `
SELECT
  emp.EmployeeId,
  emp.LastName AS LastName,
  emp.FirstName AS FirstName,
  emp.Country AS Country,
  SUM(inv.Total) AS revenue,
  COUNT(DISTINCT cust.CustomerId) AS totalCustomers,
  COUNT(inv.InvoiceId) AS totalInvoices
FROM employees emp
JOIN customers cust ON cust.SupportRepId = emp.EmployeeId
JOIN invoices inv ON inv.CustomerId = cust.CustomerId
GROUP BY emp.EmployeeId
ORDER BY revenue DESC;
`;

//




// -------------------------------------------------------/SQL QUERIES/ -------------------------------------------------------




/*
ROUTES
GET api/analytics/overview
GET api/analytics/sales
GET api/analytics/music
GET api/analytics/customers
GET api/analytics/geography
GET api/analytics/employees

*/


const dbGet = (sql, params = []) =>
    new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) =>
        err ? reject(err) : resolve(row)
    );
});


const dbAll = (sql, params = []) =>
    new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) =>
        err ? reject(err) : resolve(rows)
    );
});


router.get("/overview", async (req, res) => {
  try {
    const overview = await dbGet(overviewSQL);
    const revenueByGenre = await dbAll(revenueByGenreSQL);
    const revenueOverTime = await dbAll(revenueOverTimeSQL);
    const topArtistsByRevenue = await dbAll(topArtistsByRevenueSQL);

    res.json({
      ...overview,
      revenueByGenre,
      revenueOverTime,
      topArtistsByRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/sales", async (req, res) => {
  try {
    const salesMetrics = await dbGet(salesMetricsSQL);
    const revenueOverTime = await dbAll(revenueOverTimeSQL);
    const revenueByCountry = await dbAll(revenueByCountrySQL);
    const topTracksByRevenue = await dbAll(topTracksByRevenueSQL);
    const topCustomers = await dbAll(topCustomersSQL);


    res.json({
      ...salesMetrics,
        revenueOverTime,
        revenueByCountry,
        topTracksByRevenue,
        topCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/music", async (req, res) => {
  try {
    const topGenresByRevenue = await dbAll(topGenresByRevenueSQL);
    const topGenresByUnitsSold = await dbAll(topGenresByUnitsSoldSQL);
    const playlistsByRevenueCoverage = await dbAll(playlistsByRevenueCoverageSQL);
    const top5GenresByRevenue = topGenresByRevenue.slice(0, 5);

    const ids = top5GenresByRevenue.map(g => g.id);
    const placeholders = ids.map(() => "?").join(",");


    const revenueByTopGenresOverTimeSQL = `
        SELECT
        strftime('%Y-%m', inv.InvoiceDate) AS period,
        gen.GenreId AS genreId,
        gen.Name    AS genre,
        SUM(ii.Quantity * ii.UnitPrice)    AS revenue
        FROM invoices inv
        JOIN invoice_items ii ON ii.InvoiceId = inv.InvoiceId
        JOIN tracks tr        ON tr.TrackId = ii.TrackId
        JOIN genres gen       ON gen.GenreId = tr.GenreId
        WHERE gen.GenreId IN (${placeholders})
        GROUP BY period, gen.GenreId
        ORDER BY period ASC, gen.GenreId ASC;
    `;
    const revenueByTopGenresOverTime = await dbAll(revenueByTopGenresOverTimeSQL, ids);

    res.json({
        topGenresByRevenue,
        topGenresByUnitsSold,
        playlistsByRevenueCoverage,
        top5GenresByRevenue,
        revenueByTopGenresOverTime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/customers", async (req, res) => {
  try {
    const revenueByCountry = await dbAll(revenueByCountrySQL);
    const newCustomersOverTime = await dbAll(newCustomersOverTimeSQL);
    const topCustomers = await dbAll(topCustomersSQL);
    const revenueBySupportRep = await dbAll(revenueBySupportRepSQL);

    res.json({
        revenueByCountry,
        newCustomersOverTime,
        topCustomers,
        revenueBySupportRep,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/geography", async (req, res) => {
  try {
    const customersByCountry = await dbAll(customersByCountrySQL);
    

    res.json({
        customersByCountry,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/employees", async (req, res) => {
  try {
    const employeesMetrics = await dbGet(employeesMetricsSQL);
    const revenueBySupportRepOverTime = await dbAll(revenueBySupportRepOverTimeSQL);
    const supportRepPerformance = await dbAll(supportRepPerformanceSQL);

    

    res.json({
        employeesMetrics,
        revenueBySupportRepOverTime,
        supportRepPerformance,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;