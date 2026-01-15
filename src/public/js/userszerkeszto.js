//ellenőrzi, hogy admin-e a felhasználó, ha nem, akkor visszairányít a főoldalra
async function goHomeIfNotadmin() {
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if(data.role!="admin"){
                location.href="/";
            }
        } 
    } catch (error) {
    }
}
goHomeIfNotadmin();

document.addEventListener('DOMContentLoaded', async function (e) {
    const userId = document.getElementById('userId').value;
    const response = await fetch('/api/users',{
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });
   
    if (response.ok) {
        const data = await response.json(); // backend oldali üzenet lekérése
        for (let i = 0; i < data.length; i++){
            let user = data[i];
            if (user.user_id == userId){
                document.getElementById('emailInput').value=user.email;
                document.getElementById('nameInput').value=user.full_name;
                document.getElementById('roleInput').value=user.role;
                break;
            }
        }
    }
    else {
        await modalAlert('Szerver hiba történt!');
    }
});
document.getElementById('ModifyUserForm').addEventListener('submit', async function (e) {
    
    e.preventDefault(); 
    const userId = document.getElementById('userId').value;   
    const role = document.getElementById('roleInput').value; 
    
    const response = await fetch('/api/users/'+userId+'/role',{
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({role})
    });

    
    if (response.ok) {
        const data = await response.json();
        await modalAlert( data.message);
        window.location.href = '/admin/userkezeles';
    }
    else {
        if (response.status == 400){
            const data = await response.json(); 
            await modalAlert( 'Érvénytelen szerep. Megengedett: user, admin.');
        }
        else if (response.status == 403){
            await modalAlert('Az admin nem módosíthatja a saját szerepét!');
        }
        else {
            await modalAlert( 'Szerverhiba történt!');
        }
    }
});
document.getElementById('btn_cancel').addEventListener('click', async function (e) {
        window.location.href = '/admin/userkezeles';
});