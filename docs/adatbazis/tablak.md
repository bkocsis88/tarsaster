Az alábbi dokumentáció tartalmazza az adatbázis szerkezetét:

Táblák:

Társasjáték tábla:

- tarsasjatek_id, int, autoincrement, not null
- név, varchar 250, not null
- kor, int, not null
- játékos szám, int, not null
- típus, varchar 250, not null
- kiadó, varchar 250,
- video-url, varchar 250
- címkék, text, kettősponttal

Társasjáték-képek tábla:

- kep_id int, autincrement, not null
- tarsasjatek_id, int, not null
- adat, text, not null

Felhasználó tábla:

- felhasznalo_id, int, autoincrement, not null
- felhasználó név, text, not null
- email cím, emailcím, not null 
- teljes név, not null
- jelszó, text, not null
- kor, int,
- lakhely, varchar

Társasaim tábla:

- felhasznalo_id
- tarsasjatek-id

Kívánság-lista tábla:
- felhasznalo_id
- tarsasjatek-id

Csoport tábla:

- csoport_id, int, autoincrement, not null
- csoport név, varchar, not null
- leírás, text, not null

Csoport-felhasználó tábla:

- csoport_felhasznalo_id, int, autoincrement, not null
- felhasznalo_id
- csoport_id


