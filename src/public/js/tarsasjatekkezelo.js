async function deleteBoardgame(boardgameId){
    //törlés megerősítése popup-ban
    if (!confirm('Biztosan törölni szeretnéd ezt a társasjátékot?')){
        return;
    }
    //törlés kérés küldése a szervernek
    const response = await fetch(`/api/boardgames/${boardgameId}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    });
    //válasz kezelése
    if (response.ok) {
        //törlés sikeres
        alert('A társasjáték sikeresen törölve lett.');
        //újratöltjük az oldalt a frissített lista megjelenítéséhez
        window.location.reload();
    }
    else {
        //törlés sikertelen
        alert('Hiba történt a társasjáték törlése során.');
    }


}
document.addEventListener('DOMContentLoaded', async function (e) {
    const response = await fetch('/api/boardgames',{
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
   
    if (response.ok) {
        const data = await response.json();
        let table_body = document.getElementById('table_tarsasjatekok');
        let sorok_html = "";
        for (let i = 0; i < data.length; i++){
            let record = data[i];
            sorok_html += `<tr><td>${record.name}</td>
                            <td>${record.category}</td>
                            <td>${record.player_count}</td>
                            <td class="text-end"><button type="button" class="btn btn-primary">Szerkesztés</button>
                                <button type="button" class="btn btn-danger" onclick="deleteBoardgame(${record.boardgame_id})">Törlés</button></td></tr>`
        }
        table_body.innerHTML = sorok_html;
    }
    else {
         alert('Szerverhiba történt!');
    }
});