document.getElementById('btn_changePassword').addEventListener('click', async function (e) {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();

    const response = await fetch('/api/users/change-password',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({oldPassword, newPassword})
    });

    if (response.ok) {
        const data = await response.json();
        alert(data.message);
        window.location.href = '/'; 
    }
    else {
        const data = await response.json(); 
            alert('Hiba történt: ' + data.error);
    }
})