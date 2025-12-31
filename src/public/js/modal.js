async function modalAlert( message, title = 'Figyelmeztetés') {
    return new Promise((resolve) => {
        //Modal elem div létrehozása js segítségével
        const modalDiv = document.createElement('div');
        //Beállítjuk a modal osztályokat (modal: ablak, fade: animáció) és id-t
        modalDiv.className = 'modal fade';
        modalDiv.id = 'alertModal';
        //Modális ablak html tartalma
        modalDiv.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="alertModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">${message}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Oké</button>
                    </div>
                </div>
            </div>
        `;

        //Meghívjuk a bootstrap modal funkciót a létrehozott div-re
        const bootstrapModal = new bootstrap.Modal(modalDiv);

        //Amikor bezárjuk a modalt, resolve-oljuk a Promise-t
        modalDiv.addEventListener('hidden.bs.modal', () => {
            resolve();
        },
        {once: true});
        
        //Megjelenítjük a modális ablakot
        bootstrapModal.show();
    });
}