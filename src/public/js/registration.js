//Ellenőrzi, hogy be van e jelentkezve a felhasználó, ha igen átirányítja a főoldalra
async function goHomeIfLoggedIn() {
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            location.href="/";
        } 
    } catch (error) {
    }
}
goHomeIfLoggedIn();
//Települések betöltése
async function loadSettlements() {
    try {
        const response = await fetch('/kozsegek.txt'); //letölti a txt-t
        const text = await response.text(); //kiolvassa a szöveget
        const settlements = text.split('\n').filter(line => line.trim() !== ''); //soronként darabolja, szűri az üres sorokat

        const locationSelect = document.getElementById('locationInput');
        // Töröljük az alapértelmezett funkciókat, kivéve az elsőt
        locationSelect.innerHTML = '<option value="">Válassz egy települést</option>';

        //Hozzáadjuk az összes települést
        settlements.forEach(settlement => {
            const option = document.createElement('option');    //element objektum létrehozása
            option.value = settlement.toLowerCase().replace(/\s+/g, '-'); // minden karaktert, ami nem értelmezhető value, kötőjelé alakítja
            option.textContent = settlement;
            locationSelect.appendChild(option); //hozzáadja az elemeket
        });
    }
    catch (error) {
        console.error('Hiba a települések betöltésekor:',error);
    }
}
//Települések betöltése az oldal betöltésekor
loadSettlements();

document.getElementById('RegistrationForm').addEventListener('submit', async function (e) {
    //hozzá kell adni egy esemény figyelőt és az async functiont, ami lehetővé teszi, hogy egyszerre több művelet fusson a böngészőben
    e.preventDefault(); //megakadályozza, hogy elküldje a form adatokat a form, ezután a js kezeli az adatok küldését

    const email = document.getElementById('emailInput').value.trim();   //az elejéről és a végéről kiszedi a szóközöket, biztonsági szempontból fontos
    const username = document.getElementById('userNameInput').value.trim(); 
    const password = document.getElementById('passwordInput1').value.trim();
    const password2 = document.getElementById('passwordInput2').value.trim();
    const full_name = document.getElementById('fullNameInput').value.trim();
    const birthdate = document.getElementById('birthdateInput').value.trim();
    const location = document.getElementById('locationInput').value.trim();
    //adatküldés, egy kérés a szerver felé
    if (password!=password2 && password!= ""){
        await modalAlert( 'A jelszó nem egyezik meg!');
        return;
    }

    // frontend oldali ellenőrzés
    if (email == "" || username == "" || full_name == "" || birthdate == "" || location == ""){
        await modalAlert( 'Minden mező kitöltése kötelező!');
        return;
    }

    if (email.indexOf("@") < 0 || email.lastIndexOf(".") < 0){
        await modalAlert( 'Nem megfelelő e-mail cím formátum!');
        return;
    }

    const response = await fetch('/api/register',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},//ebből tudja, hogy json-t küldünk
        body: JSON.stringify({email, password, username, full_name, birthdate, location}) //json stringet csinál
    });

    //válaszkezelés
    if (response.ok) {
        const data = await response.json(); // backend oldali üzenet lekérése
        await modalAlert( data.message);
        window.location.href = '/'; //url átirányítás kezdőlapra
    }
    else {
        if (response.status == 400){
            const data = await response.json(); 
            await modalAlert( 'Hiba történt: ' + data);
        }
        else if (response.status == 409){
            await modalAlert( 'Ezzel az e-mail címmel már létezik regisztráció!');
        }
        else {
            await modalAlert( 'Szerverhiba történt!');
        }
    }
});

document.getElementById('btn_login').addEventListener('click', async function (e) {
     window.location.href = '/belepes';
});