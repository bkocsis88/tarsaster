//ellenőrzi, hogy be van e jelentkezve a felhasználó
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
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    //hozzá kell adni egy esemény figyelőt és az async functiont, ami lehetővé teszi, hogy egyszerre több művelet fusson a böngészőben
    e.preventDefault(); //megakadályozza, hogy elküldje a form adatokat a form, ezután a js kezeli az adatok küldését

    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    //adatküldés, egy kérés a szerver felé
    const response = await fetch('/api/login',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},//ebből tudja, hogy json-t küldünk
        body: JSON.stringify({email, password}) //json stringet csinál
    });

    //válaszkezelés
    if (response.ok) {
        window.location.href = '/'; //url átirányítás
    }
    else {
        await modalAlert( 'Hibás belépési adatok!');
    }
    
});

document.getElementById('btn_registration').addEventListener('click', async function (e) {
     window.location.href = '/regisztracio';
});
document.getElementById('btn_forgotPassword').addEventListener('click', async function (e) {
     window.location.href = '/elfelejtettjelszo';
});
