document.getElementById('btn_forgetPassword').addEventListener('click', async function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    

    const response = await fetch('/api/forgot-password',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email})
    });

    if (response.ok) {
        const data = await response.json();
        await modalAlert( data.message);
        window.location.href = '/'; 
    }
    else {
        if (response.status == 400){
            const data = await response.json(); 
            await modalAlert( 'Hiba történt: ' + data.error);
        }
        else if (response.status == 500){
            const data = await response.json(); 
            await modalAlert( 'Hiba történt: ' + data.error);
        }
        else {
            await modalAlert( 'Ismeretlen hiba történt!');
        }
    }
})