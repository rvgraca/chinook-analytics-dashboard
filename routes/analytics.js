const express = require("express");
const router = express.Router();
const db = require("../database/db");

/*
ROUTES

GET /api/analytics/top-tracks
GET /api/analytics/sales-by-country
GET /api/analytics/top-artists

*/


router 
    .route("/top-tracks")
    .get((req, res) => {
        // const sql = `SELECT t.name, SUM(ii.Quantity) AS sales
        // FROM tracks t
        // JOIN invoice_items ii ON t.TrackId = ii.TrackId
        // GROUP BY t.TrackId
        // ORDER BY sales DESC
        // LIMIT 10
        // `;

        const sql = `
        SELECT al.title AS 'Album Title', tr.Name AS 'Track Name', gen.Name AS 'Genre Name', ii.Quantity, ii.UnitPrice  
        FROM albums al
        JOIN tracks tr       ON tr.AlbumId = al.AlbumId
        JOIN genres gen      ON gen.GenreId = tr.GenreId
        JOIN invoice_items ii ON ii.TrackId = tr.TrackId
        GROUP BY tr.Name
        LIMIT 50;
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message});
            }
            res.json(rows);
        });
    })



// router
//     .route("/")
//     .get((req, res) => {
//         res.json(students);
//     })
//     .post((req, res) => {
//         const {name, age, email} = req.body;    
//         const newStudent = {
//             id:students.length+1,
//             name,
//             age,
//             email
//         };
//         students.push(newStudent);
//         res.json({
//             ok: true, 
//             student:newStudent,
//             students
//         });
//     })
//     .delete((req,res) => {
//         const {id} = req.body;
//         console.log(id);
//         const index = students.findIndex(student => student.id === id);
//         if (index === -1) {
//             return res.status(404).json({error: "User not found"});
//         }
//         students.splice(index, 1);
//         res.json({ok: true, students: students});
//     })

// router
//     .route("/:id")
//     .get((req, res) => {

//     })
//     .post((req, res) => {

//     })
//     .delete((req,res) => {
//         const id = Number(req.params.id);
//         const index = students.findIndex(student => student.id === id);
//         if (index === -1) {
//             return res.status(404).json({error: "User not found"});
//         }
//         students.splice(index, 1);
//         res.json({ok: true});
//     })


module.exports = router;