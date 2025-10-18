//Települések betöltése
 async function loadSettlements(selectedLocation = "") {
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
        document.getElementById('locationInput').value=selectedLocation;
    }
    catch (error) {
        console.error('Hiba a települések betöltésekor:',error);
    }
}

let userId = null;

document.addEventListener('DOMContentLoaded', async function (e) {
    const response = await fetch('/api/profile',{
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
   
    if (response.ok) {
        const data = await response.json(); // backend oldali üzenet lekérése
        document.getElementById('emailInput').value=data.email;
        document.getElementById('userNameInput').value=data.username;
        document.getElementById('fullNameInput').value=data.full_name;
        document.getElementById('birthdateInput').value=data.birthdate;
        userId = data.user_id;
        //Települések betöltése az oldal betöltésekor
        loadSettlements(data.location);
        
    }
    else {
         alert('Szerverhiba történt!');
    }
});

document.getElementById('ProfileForm').addEventListener('submit', async function (e) {
    
    e.preventDefault(); 
    const email = document.getElementById('emailInput').value.trim();   
    const username = document.getElementById('userNameInput').value.trim(); 
    const full_name = document.getElementById('fullNameInput').value.trim();
    const birthdate = document.getElementById('birthdateInput').value.trim();
    const location = document.getElementById('locationInput').value.trim();

    if (email == "" || username == "" || full_name == "" || birthdate == "" || location == ""){
        alert('A mező kitöltése kötelező!');
        return;
    }

    if (email.indexOf("@") < 0 || email.lastIndexOf(".") < 0){
        alert('Nem megfelelő e-mail cím formátum!');
        return;
    }

    const response = await fetch('/api/users/'+userId,{
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, username, full_name, birthdate, location})
    });

    
    if (response.ok) {
        const data = await response.json();
        alert(data.message);
        window.location.href = '/';
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
document.getElementById('btn_cancel').addEventListener('click', async function (e) {
        window.location.href = '/';
});