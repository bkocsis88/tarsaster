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
            sorok_html += `<tr><td>${record.user_id}</td>
                            <td>${record.username}</td>
                            <td>${record.full_name}</td>
                            <td>${record.email}</td>
                            <td>${record.role}</td>
                            <td class="text-end"><button type="button" class="btn btn-primary">Szerkesztés</button>
                                <button type="button" class="btn btn-danger">Törlés</button></td></tr>`
        }
        table_body.innerHTML = sorok_html;
    }
    else {
         alert('Szerverhiba történt!');
    }
});