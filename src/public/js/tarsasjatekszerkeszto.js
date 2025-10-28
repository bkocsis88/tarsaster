//oldal betöltésekor lekérdezzük a társasjáték adatait
window.addEventListener('load', function() {
    //társasjáték azonosító lekérése a rejtett mezőből
    const boardgameId = document.getElementById('boardgameId').value;
    //társasjáték adatainak betöltése
    loadBoardgameData(boardgameId);
});

//betölti a társasjáték adatait
function loadBoardgameData(boardgameID) {
    fetch(`/api/boardgames/${boardgameID}`)
        //visszajön a válasz
        .then(response => response.json())
        //jsonből olvassa ki az adatokat
        .then(data => {
            document.getElementById('nameInput').value = data.name;  
            document.getElementById('ageLimitInput').value = data.age_limit; 
            document.getElementById('playerCountInput').value = data.player_count;
            document.getElementById('playingTimeInMinutesInput').value = data.playing_time_in_minutes;
            document.getElementById('publisherInput').value = data.publisher;
            document.getElementById('videoInput').value = data.video_url;
            document.getElementById('categoryInput').value = data.category;
            document.getElementById('tagsInput').value = data.tags;
            console.log(data); 
        })
        //hiba esetén
        .catch(error => {
            console.error('Hiba történt a társasjáték adatok betöltésekor:', error);
        });
}

document.getElementById('ModifyGameForm').addEventListener('submit', async function (e) {
    //hozzá kell adni egy esemény figyelőt és az async functiont, ami lehetővé teszi, hogy egyszerre több művelet fusson a böngészőben
    e.preventDefault(); //megakadályozza, hogy elküldje a form adatokat a form, ezután a js kezeli az adatok küldését

    const boardgameId = document.getElementById('boardgameId').value;
    const name = document.getElementById('nameInput').value.trim();   //az elejéről és a végéről kiszedi a szóközöket, biztonsági szempontból fontos
    const age_limit = document.getElementById('ageLimitInput').value.trim(); 
    const player_count = document.getElementById('playerCountInput').value.trim();
    const playing_time_in_minutes = document.getElementById('playingTimeInMinutesInput').value.trim();
    const publisher = document.getElementById('publisherInput').value.trim();
    const video_url = document.getElementById('videoInput').value.trim();
    const image = document.getElementById('imageInput').value.trim();
    const category = document.getElementById('categoryInput').value.trim();
    const tags = document.getElementById('tagsInput').value.trim();
  

    const response = await fetch(`/api/boardgames/${boardgameId}`,{
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},//ebből tudja, hogy json-t küldünk
        body: JSON.stringify({name, age_limit, player_count, playing_time_in_minutes, publisher, video_url, category, tags}) //json stringet csinál
    });



    //válaszkezelés
    if (response.ok) {
        const data = await response.json(); // backend oldali üzenet lekérése       
        alert('Sikeres játék mentés!');
        window.location.href = '/admin/tarsasjatekkezelo'; //url átirányítás kezdőlapra
    }
    else {
        alert('Szerverhiba történt!');
    }
});

document.getElementById('btn_cancel').addEventListener('click', async function (e) {
     window.location.href = '/admin/tarsasjatekkezelo';
});

document.getElementById('btn_addImage').addEventListener('click', async function (e) {
     document.getElementById('imageInput').click();
});
document.getElementById('imageInput').addEventListener('change', async function (e) {
     const file = e.target.files[0];    //ez a fájl, base64 típusban
     if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('A kép mérete nem lehet nagyobb, mint 10MB!');
            e.target.value = ''; //fájl törlése
            return;
        }
        var base64String = "";
        var reader = new FileReader();
        reader.onload = function () {
            base64String = reader.result.replace("data:", "").replace(/^.+,/, ""); //base64 szöveg kiolvasás, fityfaszok leszedése
            // Kép előnézet frissítése
            var html = `<div class="image-preview"><img src="${reader.result}"
            data-filename="${file.name}"
            data-mimetype="${file.type}"
            data-base64="${base64String}" alt="Kép előnézet" /></div>`;
            document.getElementById('imagePreviews').innerHTML += html; 
            
        };
        reader.readAsDataURL(file);
        e.target.value = ''; //fájl input törlése
        
     }
});
