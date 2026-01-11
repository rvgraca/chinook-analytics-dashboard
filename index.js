const express = require("express");
const path = require("path");
const app = express();
const PORT = 4000;


const sqlite3 = require("sqlite3").verbose();

// const db = new sqlite3.Database("./students.db", (err) => {
//   if (err) {
//     console.error("Error al conectar DB", err.message);
//   } else {
//     console.log("Base de datos conectada");
//   }
// });


//Allow parsing json files
app.use(express.json());

//Render an static file
app.use(express.static(path.join(__dirname, "public")));

//Set the view engine to ejs
app.set("view engine", "ejs");


//Creating a router to "students"
// const studentRouter = require("./routes/students");
// app.use("/students", studentRouter); 


//Listen to the port 4000
app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});

app.get("/", (req, res) => { 
    res.send("Servidor funcionando"); 
});


