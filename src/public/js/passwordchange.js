document.getElementById('btn_changePassword').addEventListener('click', async function (e) {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();

    const response = await fetch('/api/changepassword',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password, username, full_name, birthdate, location})
    });

    if (response.ok) {
        const data = await response.json();
        alert(data.message);
        window.location.href = '/'; 
    }
    else {
        if (response.status == 400){
            const data = await response.json(); 
            alert('Hiba történt: ' + data);
        }
        else if (response.status == 409){
            alert('');
        }
        else {
            alert('');
        }
    }
})