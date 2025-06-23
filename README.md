# Társasjáték Kategorizáló Webalkalmazás – Részletes Műszaki és Funkcionális Specifikáció

## 1. Bevezetés

Ez a dokumentum a társasjáték kategorizáló és megosztó webalkalmazás részletes specifikációját tartalmazza. A rendszer célja, hogy lehetővé tegye a felhasználók számára társasjátékok strukturált gyűjtését, rendszerezését és megosztását másokkal, valamint hogy egy közösségi élményt biztosítson a játékrajongók számára.

Az alkalmazás modern technológiákat ötvöz, beleértve egy reszponzív Bootstrap alapú frontend felületet, PHP nyelven készült backend modult, valamint MariaDB adatbázist. Az alkalmazás egyik legkülönlegesebb funkciója a mobil eszközökön elérhető mesterséges intelligencián alapuló társasjáték-felismerés.

---

## 2. Architektúra és technológiai háttér

- **Frontend**: HTML, CSS, JavaScript – Bootstrap frameworkre építve, reszponzív megjelenéssel.
- **Backend**: Node.JS / EJS alapú REST-szerű szerveroldali logika.
- **Adatbázis**: MariaDB – relációs adatmodell, optimalizálva társasjátékok és felhasználók közötti kapcsolatok tárolására.
- **AI modul**: Kép alapján történő adatkinyerés mobilon, AI-alapú képfeldolgozással.
- **Mobil támogatás**: Az alkalmazás reszponzív, később mobilalkalmazásként (PWA vagy natív wrapper) is kiadásra kerül.

---

## 3. Felhasználói szerepkörök és jogosultságok

Az alkalmazás két fő felhasználói szerepkört támogat:

### Egyszerű felhasználó
- Teljes hozzáférés a társasjáték adatbázishoz.
- „Meg van” jelölés használata.
- Kívánságlista létrehozása, szerkesztése, megosztása.
- Más felhasználók barátként való jelölése.
- Saját profil adatainak szerkesztése, jelszócsere.

### Adminisztrátor
- Új regisztrációk jóváhagyása.
- Új társasjáték felvitele az adatbázisba.
- Társasjáték adatlapok szerkesztése, törlése.
- Admin jogosultságok kiosztása más felhasználók számára.

> Fontos: adminisztrátori jogosultság csak admin által adható.

---

## 4. Regisztrációs és hitelesítési folyamat

- Publikus regisztráció lehetséges minden látogató számára.
- A regisztrált fiókot az adminnak kell jóváhagynia a használatba vétel előtt.
- Bejelentkezés után a felhasználó minden nem-admin funkciót elér.

---

## 5. Társasjáték entitás – adattartalom

A társasjátékok strukturált formában kerülnek tárolásra, a következő leggyakoribb nemzetközi mezőstruktúrát alkalmazva:

- **Név**
- **Kategória** (pl. kártyajáték, stratégiai, kooperatív stb.)
- **Ajánlott korosztály** (pl. 6+, 10+)
- **Játékosok száma** (minimum–maximum)
- **Átlagos játékidő** (percben)
- **Kiadó neve**
- **Megjelenés éve**
- **Leírás**
- **YouTube hivatkozás** (játékmenet vagy ismertető videó)
- **Borítókép**
- **Nyelv**
- **Felhasználói értékelés** (1–5 csillagos átlag)

---

## 6. Keresés és szűrés

Az alkalmazás hatékony keresési lehetőségeket kínál:

- **Szabadszöveges kereső**: játék neve, leírása alapján.
- **Kategóriaszűrők**:
  - Játék típusa
  - Korosztály
  - Játékidő
  - Játékosok száma

A kereső működik mind asztali, mind mobil eszközökön.

---

## 7. Felhasználói interakciók

Bejelentkezett felhasználók az alábbi lehetőségeket vehetik igénybe:

### Társasjátékhoz kapcsolódó funkciók
- **„Meg van”**: megjelölés, hogy a felhasználónak megvan a játék.
- **Kívánságlista**:
  - Hozzáadás és eltávolítás
  - Lista elküldése emailben (pl. ajándékötletként)
  - Lista megosztása más regisztrált felhasználóval (pl. barát)

### Közösségi funkciók
- **Barát jelölés**: bármely felhasználót lehet jelölni barátnak.
- **Barátság visszaigazolása**: csak kölcsönös elfogadás után lesz aktív.
- **Barátlista** megtekintése, szerkesztése.

### Profilkezelés
- Név, email, jelszó módosítása.
- Kívánságlisták és barátlista áttekintése.

---

## 8. Adminisztrációs felület

Admin felhasználók számára külön menüpontok érhetők el:

- **Regisztrációk jóváhagyása**
- **Társasjátékok kezelése**:
  - Új játék felvitele
  - Meglévő játék szerkesztése
  - Játék törlése
- **Felhasználói jogosultságok kezelése**:
  - Admin jog kiosztása

---

## 9. AI-alapú társasjáték-felvitel

Ez a funkció a rendszer „high-tech” kiemelt eleme, amely a marketing kommunikáció fő eleme is lesz.

### Működés
- Felhasználó aktiválja a kamera funkciót.
- A játék dobozáról készített képet az AI feldolgozza.
- A rendszer automatikusan kitölti az alábbi mezőket:
  - Név
  - Kategória
  - Játékosok száma
  - Játékidő
  - Korosztály
  - Borítókép
  - YouTube hivatkozás (ha beazonosítható)
  
Cél, hogy a társasjáték-felvitel gyors és felhasználóbarát legyen, különösen gyűjtők számára.

---

## 10. Főbb képernyők

### Főoldal
- Kiemelt játékok listája
- Keresőmező
- Regisztrációs és bejelentkezési lehetőség

### Társasjáték lista
- Játékok lapozható listája
- Szűrési és keresési lehetőségek

### Társasjáték adatlap
- Részletes információk
- „Meg van” jelölő
- Kívánságlistára helyezés
- Beágyazott YouTube videó

### Kívánságlista oldal
- Játékok listája
- Email küldési opció
- Lista megosztása barátokkal

### Profil oldal
- Adatok módosítása
- Jelszóváltás
- Barátlista megtekintése és kezelése

### Admin felület
- Jóváhagyásra váró regisztrációk
- Társasjáték adatlapok kezelése
- Jogosultságkezelés

---

## 11. Biztonság és adatvédelem

- HTTPS-alapú titkosított kommunikáció.
- Jelszavak biztonságos titkosítása.
- Jogosultság-alapú hozzáférés-ellenőrzés minden funkcióhoz.
- Személyes adatok kizárólag az adatvédelmi szabályok szerint használhatók.

---

## 12. Jövőbeli bővítési lehetőségek

A rendszer fejlesztése során a következő bővítési irányok tervezhetők:

- **Felhasználói értékelések és kommentek** a játékokhoz.
- **Játékajánló rendszer** az AI által, a felhasználó gyűjteménye vagy barátai alapján.
- **Társasjáték események**, találkozók, versenyek szervezése.
- **Társasjáték kölcsönzési modul** (barátok között vagy közösségi alapon).
- **Gamifikációs elemek**: kitüntetések, gyűjtői jelvények, szintek.
- **API integráció** más társasjáték adatbázisokkal (pl. BoardGameGeek).
- **Többnyelvű felület** nemzetközi piacra lépéshez.
- **Offline mód** mobilon: böngészés és kívánságlista elérés internet nélkül.

---

*Verzió: 1.1 – 2025.06.16*

