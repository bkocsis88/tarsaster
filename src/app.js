//elindít egy programot (express), ami egy adott porton kiszolgálja a weboldalt
// express module
const express = require("express");
// path module
const path = require("path");
// fs module, fájljok betöltéséhez
const fs = require("fs");
// betöltjük az ejs keretrendszer
const ejs = require("ejs");

//alkalmazás objektum létrehozása
const app = express();
// PORT megadása
const PORT = 3090;

//Statikus (public mappa) fájlok kiszolgálása
//static függvény előállít valami köztes "teret", path.jon előállítja az elérési utat
app.use(express.static(path.join(__dirname, "public")))

// EJS beállítása, azért felel, hogy a html-ben javascriptet lehessen használni, úgy használjuk, mint a php-ban
app.set("view engine", "ejs");
app.set("views", path.join(__dirname)); // fontos: így layout/pages is látszik

// Segédfüggvény layout használathoz, megjeleníti az ejs fájlokból a html oldalt
function renderWithLayout(res, pagePath, options = {}) {
  const fullPath = path.join(__dirname, pagePath + ".ejs");
  const template = fs.readFileSync(fullPath, "utf-8");
  const body = ejs.render(template, options);
  res.render("layout/layout", { ...options, body });
}

// Oldalak, minden oldalt fel kell venni
app.get("/", (req, res) => {
  renderWithLayout(res, "pages/home", { title: "Kezdőoldal" });
});

app.get("/rolunk", (req, res) => {
  renderWithLayout(res, "pages/rolunk", { title: "Rólunk" });
});
app.get("/impresszum", (req, res) => {
  renderWithLayout(res, "pages/impresszum", { title: "Impresszum" });
});
app.get("/sutikrol", (req, res) => {
  renderWithLayout(res, "pages/sutikrol", { title: "Sütikről" });
});
app.get("/tarsasjatekok", (req, res) => {
  renderWithLayout(res, "pages/tarsasjatekok", { title: "Társasjátékok" });
});

//API végpontra példa
//const dbApi = require("./api/db");
const dbApi = require("./api/api");
//API végpont URL-hez kötése, ide kell betenni az összes API-t, ami kell a lekérdezésekhez
app.use("/api",dbApi);

// Szerver indítása (localhost): terminalba beírni: node app.js /elindul a localhoston a webkiszolgáló (linkre kattintani)
app.listen(PORT, () => {
  console.log(`Szerver elindult: http://localhost:${PORT}`);
});

