# Társasjáték Kategorizáló Webalkalmazás – Részletes Műszaki és Funkcionális Specifikáció

## 1. Bevezetés

Ez a dokumentum a társasjáték kategorizáló és megosztó webalkalmazás részletes specifikációját tartalmazza. A rendszer célja, hogy lehetővé tegye a felhasználók számára társasjátékok strukturált gyűjtését, rendszerezését és megosztását másokkal, valamint hogy egy közösségi élményt biztosítson a játékrajongók számára.

Az alkalmazás modern technológiákat ötvöz, beleértve egy reszponzív Bootstrap alapú frontend felületet, Node.JS-ben készült backend modult, valamint MariaDB adatbázist. Az alkalmazás egyik legkülönlegesebb funkciója a mobil eszközökön elérhető mesterséges intelligencián alapuló társasjáték-felismerés.

---

## 2. Architektúra és technológiai háttér

- **Frontend**: HTML, CSS, JavaScript – Bootstrap frameworkre építve, reszponzív megjelenéssel.
- **Backend**: Node.JS / EJS alapú REST szerveroldali logika.
- **Adatbázis**: MariaDB – relációs adatmodell, optimalizálva társasjátékok és felhasználók közötti kapcsolatok tárolására.
- **AI modul**: Kép alapján történő adatkinyerés mobilon, AI-alapú képfeldolgozással.
- **Mobil támogatás**: Az alkalmazás reszponzív, PWA webalkalmazás is lefejlesztésre került.

---

## 3. Felhasználói szerepkörök és jogosultságok

Az alkalmazás két fő felhasználói szerepkört támogat:

### Egyszerű felhasználó
- Teljes hozzáférés a társasjáték adatbázishoz.
- „Megvan” jelölés használata.
- Kívánságlista létrehozása, szerkesztése, megosztása.
- Saját profil adatainak szerkesztése, jelszómódosítás.

### Adminisztrátor
- Új társasjáték felvitele az adatbázisba.
- Társasjáték adatlapok szerkesztése, törlése.
- Admin jogosultságok kiosztása más felhasználók számára.
- Új felhasználók regisztrálása.

> Fontos: adminisztrátori jogosultság csak admin által adható.

---

## 4. Regisztrációs és hitelesítési folyamat

- Publikus regisztráció lehetséges minden látogató számára.
- Bejelentkezés után a felhasználó minden user funkciót elér.

---

## 5. Társasjáték entitás – adattartalom

A társasjátékok strukturált formában kerülnek tárolásra, a következő mezőstruktúrát alkalmazva:

- **Név**
- **Kategória** (pl. gyerek, stratégiai, kooperatív stb.)
- **Ajánlott korosztály** (pl. 6+, 10+)
- **Játékosok száma** (maximum)
- **Átlagos játékidő** (percben)
- **Kiadó neve**
- **Leírás**
- **YouTube hivatkozás** (játékmenet vagy ismertető videó)
- **Borítókép**
- **Címkézés**

---

## 6. Keresés és szűrés

Az alkalmazás hatékony keresési lehetőségeket kínál:

- **Szabadszöveges kereső**: játék neve, leírása alapján.
- **Kategóriaszűrők**:
  - Játék típusa
  - Korosztály
  - Játékosok száma
  - Sajátlista
  - Kívánságlista

A kereső működik mind asztali, mind mobil eszközökön.

---

## 7. Felhasználói interakciók

Bejelentkezett felhasználók az alábbi lehetőségeket vehetik igénybe:

### Társasjátékhoz kapcsolódó funkciók
- **„Megvan”**: megjelölés, hogy a felhasználónak tulajdonában van a játék.
- **Kívánságlista**:
  - Hozzáadás és eltávolítás
  - Lista megtekintése
  - Lista megosztása e-mailben más regisztrált felhasználóval (pl. barát)

### Közösségi funkciók (tervezett jövőbeni fejlesztés)
- **Barát jelölés**: bármely felhasználót lehet jelölni barátnak.
- **Barátság visszaigazolása**: csak kölcsönös elfogadás után lesz aktív.
- **Barátlista** megtekintése, szerkesztése.

### Profilkezelés
- Név, születési idő, lakhely módosítása.
- Jelszómódosítás.


---

## 8. Adminisztrációs felület

Admin felhasználók számára külön menüpontok érhetőek el:

- **Társasjátékok kezelése**:
  - Új játék rögzítése.
  - Meglévő játék adatainak szerkesztése.
  - Játék törlése.
- **Felhasználói jogosultságok kezelése**:
  - Jogosultságkezelés.
  - Új felhasználó rögzítése.

---

## 9. AI-alapú társasjáték-felvitel és társasjáték keresés

Ez a funkció a rendszer „high-tech” kiemelt eleme, amely a marketing kommunikáció fő eleme is lesz.

### Működés rögzítés esetén
- Felhasználó (admin) aktiválja a kamera funkciót.
- A játék dobozáról készített képet az AI feldolgozza.
- A rendszer automatikusan kitölti az alábbi mezőket:
  - Név
  - Játékosok száma
  - Játékidő
  - Korosztály
  - Játék leírása
  - Kiadó
  
### Működés keresés esetén
- Felhasználó aktiválja a kamera funkciót.
- A játék dobozáról készített képet az AI feldolgozza.
- A rendszer automatikusan azonosítja a játékot:
  - Feltünteti a társasjáték nevét.
  - Amennyiben az adatbázisban szerepel a játék, a játék megjelenik a felhasználó számára.

Cél, hogy a társasjáték-felvitel gyors és felhasználóbarát legyen.

---

## 10. Főbb képernyők

### Főoldal
- Főmenü
- Alkalmazás ismertető
- Regisztrációs és bejelentkezési lehetőség

### Társasjáték lista
- Játékok listája (alap adatok feltüntetve)
- Szűrési és keresési lehetőségek
- Jelölési lehetőség

### Társasjáték adatlap
- Részletes információk
- „Megvan” jelölő
- Kívánságlistára helyezés
- Beágyazott YouTube videó

### Profil oldal
- Adatok módosítása
- Jelszóváltás

### Admin felület
- Társasjáték adatlapok kezelése
- Jogosultságkezelés

---

## 11. Biztonság és adatvédelem

- HTTPS-alapú titkosított kommunikáció (éles környezetben).
- Jelszavak biztonságos titkosítása.
- Jogosultság-alapú hozzáférés-ellenőrzés minden funkcióhoz.
- Személyes adatok kizárólag az adatvédelmi szabályok szerint használhatóak.

---

## 12. Jövőbeli bővítési lehetőségek

A rendszer fejlesztése során a következő bővítési irányok tervezhetők:

- **Barát jelölés és visszaigazolás** a közösség építéshez.
- **Barátok listája**, a felhasználó számára megjelenítve.
- **Felhasználói értékelések és kommentek** a játékokhoz.
- **Játékajánló rendszer** az AI által, a felhasználó gyűjteménye vagy barátai alapján.
- **Társasjáték események**, találkozók, versenyek szervezése.
- **Társasjáték kölcsönzési modul** (barátok között vagy közösségi alapon).
- **Gamifikációs elemek**: kitüntetések, gyűjtői jelvények, szintek.
- **API integráció** más társasjáték adatbázisokkal (pl. BoardGameGeek).
- **Többnyelvű felület** nemzetközi piacra lépéshez.


---

*Verzió: 1.1 – 2026.01.11*

