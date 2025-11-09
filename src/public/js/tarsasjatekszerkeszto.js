//oldal betöltésekor lekérdezzük a társasjáték adatait
window.addEventListener('load', function() {
    //társasjáték azonosító lekérése a rejtett mezőből
    const boardgameId = document.getElementById('boardgameId').value;
    //társasjáték adatainak betöltése
    loadBoardgameData(boardgameId);
});

//kép törlése
function deleteImage(e){
    //lekérjük a gombot, amit megnyomtunk
    let button = e;
    //class-t változtatunk
    button.parentElement.parentElement.classList.toggle("trashit");
}

//betölti a társasjáték adatait
function loadBoardgameData(boardgameId) {
    fetch(`/api/boardgames/${boardgameId}`)
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
            //meglévő képek betöltése külön lekéréssel
            fetch(`/api/boardgames/${boardgameId}/images`)
                .then(response => response.json())
                .then(images => {
                    //képek megjelenítése
                    const imagePreviews = document.getElementById('imagePreviews');
                    images.forEach(image => {
                        //ha nincs fájlnév, akkor kihagyja a képet
                        if (image.file_name !== null && image.file_name !== '') {
                            const imgHtml = `<div class="image-preview">
                            <div class="image-actions"><button type="button" class="btn btn-primary"  title="Törlés" onclick="deleteImage(this)"><i class="bi bi-trash3"></i></button></div>
                            <img src="${image.url}"
                                 data-status="old"
                                 data-imageid="${image.image_id}"
                                 data-filename="${image.filename}"
                                 data-mimetype="${image.mimetype}"
                                 data-base64=""
                                 alt="Kép előnézet" />
                            </div>`;
                            imagePreviews.innerHTML += imgHtml;
                        }
                    });
                });
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
        //új képek feltöltése
        const imageElements = document.querySelectorAll('#imagePreviews .image-preview:not(.trashit) img[data-status="new"]');
        
        if (imageElements.length > 0) {
            const formData = new FormData();
            
            // Minden képet hozzáadunk a FormData-hoz 'images' néven (tömb)
            for (const img of imageElements) {
                // Base64-ből vissza kell alakítani Blob-bá
                const base64Data = img.getAttribute('data-base64');
                const mimeType = img.getAttribute('data-mimetype');
                const fileName = img.getAttribute('data-filename');
                
                console.log('Kép feldolgozása:', fileName, mimeType);
                
                // Base64 -> binary -> Blob konverzió
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });
                
                // FormData feltöltése - 'images' mezőnévvel (többszöri append = tömb)
                formData.append('images', blob, fileName);
            }
            
            console.log('FormData tartalmaz', imageElements.length, 'képet');
            
            // Egy kérésben küldjük az összes képet
            const boardgameId = document.getElementById('boardgameId').value;
            const imageUploadResponse = await fetch(`/api/boardgames/${boardgameId}/images`, {
                method: 'POST',
                // NEM kell Content-Type header! A böngésző automatikusan beállítja multipart/form-data-nak
                body: formData
            });
            
            if (!imageUploadResponse.ok) {
                alert('Hiba történt a képek feltöltése során!');
                return;
            }
        }
        //törlendő képek törlése
        //leszedjük azokat a képeket, amiket törlésre jelöltünk
        const imagesToDelete = document.querySelectorAll('#imagePreviews .image-preview.trashit img[data-status="old"]');
        for(const img of imagesToDelete) {
            const imageId = img.getAttribute('data-imageid');
            console.log('Törlendő kép ID:', imageId);
            const deleteResponse = await fetch(`/api/boardgames/${boardgameId}/images/${imageId}`, {
                method: 'DELETE'
            });
            if (!deleteResponse.ok) {
                alert('Hiba történt a képek törlése során!');
                return;
            }
        }
        
        alert('Sikeres játék módosítás!');
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
            var html = `<div class="image-preview">
            <div class="image-actions"><button type="button" class="btn btn-primary"  title="Törlés" onclick="deleteImage(this)"><i class="bi bi-trash3"></i></button></div>
            <img src="${reader.result}" data-status="new"
            data-filename="${file.name}"
            data-mimetype="${file.type}"
            data-base64="${base64String}" alt="Kép előnézet" /></div>`;
            document.getElementById('imagePreviews').innerHTML += html; 
            
        };
        reader.readAsDataURL(file);
        e.target.value = ''; //fájl input törlése
        
     }
});
