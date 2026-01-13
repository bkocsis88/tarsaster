document.getElementById('btn_newPassword').addEventListener('click', async function (e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value.trim();
    const newPassword2 = document.getElementById('newPassword2').value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    const response = await fetch('/api/reset-password',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({newPassword, token})
    });

    if (newPassword != newPassword2 ){
        await modalAlert( 'A két jelszó nem egyezik meg!');
        return;
    }

    if (response.ok) {
        const data = await response.json();
        await modalAlert( data.message);
        window.location.href = '/'; 
    }
    else {
        const data = await response.json(); 
            await modalAlert( 'Hiba történt: ' + data.error);
    }
})