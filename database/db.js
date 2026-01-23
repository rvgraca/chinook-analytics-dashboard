const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db/chinook.db", (err) => {
  if (err) {
    console.error("DB error:", err.message);
  } else {
    console.log("DB conectada");
  }
});

module.exports = db;
