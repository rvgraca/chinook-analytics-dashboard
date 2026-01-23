const express = require("express");
const path = require("path");
const app = express();
const PORT = 4000;

//Allow parsing json files
app.use(express.json());

//Render an static file
app.use(express.static(path.join(__dirname, "public")));

//Set the view engine to ejs
// app.set("view engine", "ejs");


//Creating a router to "analytics"
const analyticsRouter = require("./routes/analytics");
app.use("/api/analytics", analyticsRouter); 


//Listen to the port 4000
app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});



