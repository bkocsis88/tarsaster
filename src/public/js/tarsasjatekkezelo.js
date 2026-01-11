async function deleteBoardgame(boardgameId){
    //törlés megerősítése popup-ban
    await modalConfirmation('Biztosan törölni szeretnéd ezt a társasjátékot?', async () =>{
        //törlés kérés küldése a szervernek
        const response = await fetch(`/api/boardgames/${boardgameId}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        });
        //válasz kezelése
        if (response.ok) {
            //törlés sikeres
            await modalAlert( 'A társasjáték sikeresen törölve lett.');
            //újratöltjük az oldalt a frissített lista megjelenítéséhez
            window.location.reload();
        }
        else {
            //törlés sikertelen
            await modalAlert( 'Hiba történt a társasjáték törlése során.');
        }
    });
}
async function navigateToEditPage(boardgameId) {
    //társasjáték szerkesztés oldalra navigálás
    window.location.href = `/admin/tarsasjatekkezelo/${boardgameId}`;
}
document.addEventListener('DOMContentLoaded', async function (e) {
    const response = await fetch('/api/boardgames',{
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
   
    if (response.ok) {
        const data = await response.json();
        let table_body = document.getElementById('table_tarsasjatekok');
        //betöltjük az összes játékot a képekkel együtt
        const rows = [];
        for (let i = 0; i < data.length; i++){
            let record = data[i];

            //első kép lekérése
            let imageUrl = '/images/tarsasapp-logo1.png'; //alapértelmezett kép
            try {
                const imagesResponse = await fetch(`/api/boardgames/${record.boardgame_id}/images`);
                if (imagesResponse.ok) {
                    const images = await imagesResponse.json();
                    if (images.length > 0) {
                        imageUrl = images[0].url;
                    }
                }
            }
            catch (error) {
                console.log('Nincs kép ehhez a játékhoz:', record.boardgame_id);
            }
            const categoryMap = {
                "stratégiai": "Stratégiai",
                "logikai": "Logikai",
                "kooperativ": "Kooperatív",
                "szabadulo": "Szabadulós",
                "tortenetvezerelt": "Történetvezérelt",
                "gyerek": "Gyerek",
                "party": "Party",
                "felnott": "18+"
            };

            //beszúr egy sor elemet a tömbbe
            rows. push(`
                <tr class="boardgame-row">
                    <td data-label="Kép">
                        <img src="${imageUrl}"
                             alt="${record.name}"
                             class="img-thumbnail"
                             style="width: 80px; height: 80px; object-fit: cover;"
                             onerror="this.src='/images/tarsasapp-logo1.png'">
                    </td>
                    <td data-label="Név">${record.name}</td>
                    <td data-label="Kategória">${categoryMap[record.category] || 'N/A'}</td>
                    <td data-label="Játékosok száma">${record.player_count || 'N/A'}</td>
                    <td data-label="Műveletek" class="text-end">
                        <button type="button" class="btn btn-primary btn-sm mt-2 btn-89" onclick="navigateToEditPage(${record.boardgame_id})">Szerkesztés</button>
                        <button type="button" class="btn btn-danger btn-sm mt-2 btn-89" onclick="deleteBoardgame(${record.boardgame_id})">Törlés</button>
                    </td>
                </tr>    
            `);
        }

        table_body.innerHTML = rows.join(' ');
    }
    else {
         await modalAlert( 'Szerverhiba történt!');
    }
});