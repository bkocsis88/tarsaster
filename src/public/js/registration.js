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
        alert('A jelszó nem egyezik meg!');
        return;
    }

    // frontend oldali ellenőrzés
    if (email == "" || username == "" || full_name == "" || birthdate == "" || location == ""){
        alert('A mező kitöltése kötelező!');
        return;
    }

    if (email.indexOf("@") < 0 || email.lastIndexOf(".") < 0){
        alert('Nem megfelelő e-mail cím formátum!');
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
        alert(data.message);
        window.location.href = '/'; //url átirányítás kezdőlapra
    }
    else {
        if (response.status == 400){
            const data = await response.json(); 
            alert('Hiba történt: ' + data);
        }
        else if (response.status == 409){
            alert('Ezzel az e-mail címmel már létezik regisztráció!');
        }
        else {
            alert('Szerverhiba történt!');
        }
    }
});

document.getElementById('btn_login').addEventListener('click', async function (e) {
     window.location.href = '/belepes';
});