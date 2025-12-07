document.addEventListener('DOMContentLoaded', async function (e) {
    //SELECT user_id, username, full_name, email, location, birthdate FROM User
    const response = await fetch('/api/users',{
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
   
    if (response.ok) {
        const data = await response.json();
        let table_body = document.getElementById('table_felhasznalok');
        let sorok_html = "";
        for (let i = 0; i < data.length; i++){
            let record = data[i];
            sorok_html += `<tr class="user-row">
                            <td data-label="ID" class="d-none d-md-table-cell">${record.user_id}</td>
                            <td data-label="Felhasználó név">${record.username}</td>
                            <td data-label="Név">${record.full_name}</td>
                            <td data-label="E-mail">${record.email}</td>
                            <td data-label="Jogosultság">${record.role}</td>
                            <td data-label="Műveletek" class="text-end">
                                <button type="button" class="btn btn-primary btn-sm mt-2 btn-89">Szerkesztés</button>
                                <button type="button" class="btn btn-danger btn-sm mt-2 btn-89">Törlés</button>
                            </td>
                        </tr>`
        }
        table_body.innerHTML = sorok_html;
    }
    else {
         await modalAlert( 'Szerverhiba történt!');
    }
});