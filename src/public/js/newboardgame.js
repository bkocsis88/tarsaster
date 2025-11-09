document.getElementById('NewGameForm').addEventListener('submit', async function (e) {
    //hozzá kell adni egy esemény figyelőt és az async functiont, ami lehetővé teszi, hogy egyszerre több művelet fusson a böngészőben
    e.preventDefault(); //megakadályozza, hogy elküldje a form adatokat a form, ezután a js kezeli az adatok küldését

    const name = document.getElementById('nameInput').value.trim();   //az elejéről és a végéről kiszedi a szóközöket, biztonsági szempontból fontos
    const description = document.getElementById('descriptionInput').value.trim();
    const age_limit = document.getElementById('ageLimitInput').value.trim(); 
    const player_count = document.getElementById('playerCountInput').value.trim();
    const playing_time_in_minutes = document.getElementById('playingTimeInMinutesInput').value.trim();
    const publisher = document.getElementById('publisherInput').value.trim();
    const video_url = document.getElementById('videoInput').value.trim();
    const image = document.getElementById('imageInput').value.trim();
    const category = document.getElementById('categoryInput').value.trim();
    const tags = document.getElementById('tagsInput').value.trim();
  

    const response = await fetch('/api/boardgames',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},//ebből tudja, hogy json-t küldünk
        body: JSON.stringify({name, description, age_limit, player_count, playing_time_in_minutes, publisher, video_url, category, tags}) //json stringet csinál
    });



    //válaszkezelés
    if (response.ok) {
        const data = await response.json(); // backend oldali üzenet lekérése
        const id = data.id; //új játék ID lekérése
        
        // Képek feltöltése - összes kép egy FormData-ban
        const imageElements = document.querySelectorAll('#imagePreviews img');
        
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
            const imageUploadResponse = await fetch(`/api/boardgames/${id}/images`, {
                method: 'POST',
                // NEM kell Content-Type header! A böngésző automatikusan beállítja multipart/form-data-nak
                body: formData
            });
            
            if (!imageUploadResponse.ok) {
                alert('Hiba történt a képek feltöltése során!');
                return;
            }
        }
        
        alert('Sikeres játék hozzáadás!');
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
