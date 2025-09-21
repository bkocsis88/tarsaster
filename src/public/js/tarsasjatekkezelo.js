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
                            <td>${record.player_count_max}</td>
                            <td><button type="button" class="btn btn-info">Szerkesztés</button>
                                <button type="button" class="btn btn-danger">Törlés</button></td></tr>`
        }
        table_body.innerHTML = sorok_html;
    }
    else {
         alert('Szerverhiba történt!');
    }
});