document.addEventListener("DOMContentLoaded", function() {
    const cookieConsent = document.getElementById("cookieConsent");
    const acceptCookiesBtn = document.getElementById("acceptCookiesBtn");

    //Ellenőrizzük, hogy a felhasználó már elfogadta-e a sütiket
    if (!getCookie("cookiesAccepted")){
        cookieConsent.style.display = "block";
    }

    //Ha a felhasználó elfogadta a sütiket
    acceptCookiesBtn.addEventListener("click",function() {
        setCookie("cookiesAccepted", "true", 365);
        cookieConsent.style.display = "none";
        console.log("Sütik elfogadva.");
    });
});

//Sütik beállítása
function setCookie(name, value, days) {
    const date = new Date();
    //idő beállítása
    date.setTime(date.getTime() + (days * 24 * 60 * 1000));
    //érvényesség beállítása
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

//Süti lekérése
function getCookie(name) {
    return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}