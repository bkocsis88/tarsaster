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

//JSON body-k feldolgozása az appban
app.use(express.json({limit: '50mb'}));

// EJS beállítása, azért felel, hogy a html-ben javascriptet lehessen használni, úgy használjuk, mint a php-ban
app.set("view engine", "ejs");
app.set("views", path.join(__dirname)); // fontos: így layout/pages is látszik

//Session kezeléséhez
const session = require('express-session');
app.use(session({
    secret: 'valami_nagyon_titkos_szó', // environment variable-ben tárold élesben!
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // állítsd true-ra HTTPS esetén
        maxAge: 1000 * 60 * 60 // 1 óra
    }
}));

//Middleware: minden kérésnél elérhető lesz a session az EJS-ben
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Segédfüggvény layout használathoz, megjeleníti az ejs fájlokból a html oldalt
function renderWithLayout(res, pagePath, options = {}) {
  const fullPath = path.join(__dirname, pagePath + ".ejs");
  const template = fs.readFileSync(fullPath, "utf-8");
  const renderOptions = { ...res.locals, ...options}; //összes változót átadjuk a renderOptionsban az ejs-nek
  const body = ejs.render(template, renderOptions);
  res.render("layout/layout", { ...renderOptions, body });
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
app.get("/aikereso", (req, res) => {
  renderWithLayout(res, "pages/aikereso", { title: "AI kereső" });
});
app.get("/tarsasjatekok", (req, res) => {
  renderWithLayout(res, "pages/tarsasjatekok", { title: "Társasjátékok" });
});
app.get("/tarsasjatek/:id", (req, res) => {
  renderWithLayout(res, "pages/tarsasjatek", { title: "Társasjáték", gameId: req.params.id });
});
app.get("/belepes", (req, res) => {
  renderWithLayout(res, "pages/belepes", { title: "Belépés" });
});
app.get("/regisztracio", (req, res) => {
  renderWithLayout(res, "pages/regisztracio", { title: "Regisztráció" });
});

app.get("/admin/tarsasjatekkezelo", (req, res) => {
  renderWithLayout(res, "pages/admin/tarsasjatekkezelo", { title: "Társasjáték kezelő" });
});
app.get("/admin/tarsasjatekkezelo/:id", (req, res) => {
  renderWithLayout(res, "pages/admin/tarsasjatekszerkeszto", { title: "Társasjáték szerkesztés",boardgameId: req.params.id });
});
app.get("/admin/userkezeles", (req, res) => {
  renderWithLayout(res, "pages/admin/userkezeles", { title: "Felhasználó kezelő" });
});
app.get("/admin/userkezeles/:id", (req, res) => {
  renderWithLayout(res, "pages/admin/userszerkeszto", { title: "Felhasználó szerkesztő", userId: req.params.id});
});
app.get("/admin/ujtarsasjatek", (req, res) => {
  renderWithLayout(res, "pages/admin/ujtarsasjatek", { title: "Új társasjáték felvétele" });
});
app.get("/admin/ujfelhasznalo", (req, res) => {
  renderWithLayout(res, "pages/admin/ujfelhasznalo", { title: "Új felhasználó felvétele" });
});
app.get("/profil", (req, res) => {
  renderWithLayout(res, "pages/profil", { title: "Profil" });
});
app.get("/jelszomodositas", (req, res) => {
  renderWithLayout(res, "pages/jelszomodositas", { title: "Jelszómódosítás" });
});
app.get("/elfelejtettjelszo", (req, res) => {
  renderWithLayout(res, "pages/elfelejtettjelszo", { title: "Elfelejtett jelszó" });
});
app.get("/ujjelszo", (req, res) => {
  renderWithLayout(res, "pages/ujjelszo", { title: "Új jelszó" });
});
app.get("/kilepes", (req, res) => {
  renderWithLayout(res, "pages/kilepes", { title: "Kilépés" });
});

//API végpontra példa
//const dbApi = require("./api/db");
const dbApi = require("./api/api");
//API végpont URL-hez kötése, ide kell betenni az összes API-t, ami kell a lekérdezésekhez
app.use("/api",dbApi);

// AI végpont (Gemini képfelismerés)
const aiGemini = require("./ai/gemini");
app.use("/ai", aiGemini);

// Szerver indítása (localhost): terminalba beírni: node app.js /elindul a localhoston a webkiszolgáló (linkre kattintani)
app.listen(PORT, () => {
  console.log(`Szerver elindult: http://localhost:${PORT}`);
});

