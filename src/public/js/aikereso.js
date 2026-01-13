// AI Kereső funkciók
document.addEventListener('DOMContentLoaded', function() {
    // Gombok és elemek
    const uploadBtn = document.getElementById('uploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const imageUpload = document.getElementById('imageUpload');
    const cameraCapture = document.getElementById('cameraCapture');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const searchBtn = document.getElementById('searchBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const searchResults = document.getElementById('searchResults');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultContent = document.getElementById('resultContent');

    // Kép tallózása gomb
    uploadBtn.addEventListener('click', function() {
        imageUpload.click();
    });

    // Fotó készítése gomb
    cameraBtn.addEventListener('click', function() {
        cameraCapture.click();
    });

    // Képfeltöltés kezelése
    imageUpload.addEventListener('change', function(e) {
        handleImageSelection(e.target.files[0]);
    });

    // Kamera kép kezelése
    cameraCapture.addEventListener('change', function(e) {
        handleImageSelection(e.target.files[0]);
    });

    // Kép előnézet és base64 konvertálás
    function handleImageSelection(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                imagePreview.style.display = 'block';
                searchResults.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    // Mégse gomb
    cancelBtn.addEventListener('click', function() {
        imagePreview.style.display = 'none';
        searchResults.style.display = 'none';
        imageUpload.value = '';
        cameraCapture.value = '';
    });

    // Keresés indítása gomb
    searchBtn.addEventListener('click', async function() {
        const fileInput = imageUpload.files.length > 0 ? imageUpload : cameraCapture;
        
        if (fileInput.files.length === 0) {
            await modalAlert( 'Kérlek, válassz ki egy képet!');
            return;
        }

        // Eredmények terület megjelenítése betöltő animációval
        searchResults.style.display = 'block';
        loadingSpinner.style.display = 'inline-block';
        resultContent.innerHTML = '';

        try {
            // Kép feltöltése a backend-re
            const fileInput = imageUpload.files.length > 0 ? imageUpload : cameraCapture;
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);

            // Backend AI endpoint hívás
            const response = await fetch('/ai/gamesearch', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                
                // Különleges kezelés túlterhelés esetén
                if (error.retry) {
                    throw new Error(error.error);
                }
                
                throw new Error(error.error || 'Hiba történt a képfelismerés során');
            }

            const data = await response.json();
            const gameName = data.gameName;
            
            if (!gameName) {
                throw new Error('Nem sikerült felismerni a játékot a képről');
            }

            // Játék keresése az adatbázisban
            await searchBoardgameByName(gameName);

        } catch (error) {
            loadingSpinner.style.display = 'none';
            
            // Különböző stílusú hiba megjelenítés a típustól függően
            const isRetryError = error.message.includes('túlterhelt') || 
                                 error.message.includes('overloaded');
            
            resultContent.innerHTML = `
                <div class="alert ${isRetryError ? 'alert-warning' : 'alert-danger'}">
                    <h4>
                        <i class="bi ${isRetryError ? 'bi-hourglass-split' : 'bi-exclamation-triangle'}"></i> 
                        ${isRetryError ? 'Kérjük, várjon' : 'Hiba történt'}
                    </h4>
                    <p>${error.message}</p>
                    ${isRetryError ? '<p class="mb-0"><small>A szolgáltatás hamarosan újra elérhető lesz.</small></p>' : ''}
                </div>
            `;
        }
    });

    // Játék keresése név alapján az adatbázisban
    async function searchBoardgameByName(gameName) {
        const queryParams = new URLSearchParams();
        queryParams.append('search', gameName);

        const url = `/api/boardgames?${queryParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Hiba a játékok betöltésekor');
        }

        const boardgames = await response.json();
        loadingSpinner.style.display = 'none';

        if (boardgames.length === 0) {
            resultContent.innerHTML = `
                <div class="alert alert-warning">
                    <h4><i class="bi bi-search"></i> Nincs találat</h4>
                    <p>A felismert játék: <strong>${gameName}</strong></p>
                    <p>Sajnos ez a társasjáték nem található az adatbázisunkban.</p>
                </div>
            `;
            return;
        }

        // Találatok megjelenítése
        displayResults(gameName, boardgames);
    }

    // Eredmények megjelenítése
    async function displayResults(searchedName, boardgames) {
        let html = `
            <div class="ai-search-results">
                <div class="alert alert-success mb-4">
                    <h4><i class="bi bi-check-circle"></i> Találat!</h4>
                    <p>Felismert játék: <strong>${searchedName}</strong></p>
                    <p>Találatok száma: <strong>${boardgames.length}</strong></p>
                </div>
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        `;

        for (const game of boardgames) {
            const imageUrl = await getBoardgameImage(game.boardgame_id);
            html += createBoardgameCardHTML(game, imageUrl);
        }

        html += `
                </div>
            </div>
        `;

        resultContent.innerHTML = html;

        // Wishlist és owned gombok eseménykezelői
        attachCardEventListeners();
    }

    // Játék kép lekérése
    async function getBoardgameImage(boardgameId) {
        try {
            const response = await fetch(`/api/boardgames/${boardgameId}/images`);
            if (response.ok) {
                const images = await response.json();
                if (images.length > 0) {
                    return images[0].url;
                }
            }
        } catch (error) {
            console.log('Nincs kép ehhez a játékhoz:', boardgameId);
        }
        return '/images/tarsasapp-logo1.png';
    }

    // Játékkártya HTML generálása
    function createBoardgameCardHTML(game, imageUrl) {
        return `
            <div class="col">
                <div class="card h-100 boardgame-card" data-game-id="${game.boardgame_id}" style="cursor: pointer;">
                    <img src="${imageUrl}" class="card-img-top" alt="${game.name}"
                        style="height: 200px; object-fit: contain;"
                        onerror="this.src='/images/tarsasapp-logo1.png'">
                    <div class="card-body">
                        <h5 class="card-title">${game.name}</h5>
                        <div class="card-text">
                            <small class="text-muted">
                                <div class="row g-2">
                                    <div class="col-6">
                                        <i class="bi bi-people-fill"></i> ${game.player_count || 'N/A'} játékos
                                    </div>
                                    <div class="col-6">
                                        <i class="bi bi-clock-fill"></i> ${game.playing_time_in_minutes || 'N/A'} perc
                                    </div>
                                    <div class="col-6">
                                        <i class="bi bi-tag-fill"></i> ${game.category || 'Kategória nélkül'}
                                    </div>
                                    <div class="col-6">
                                        ${game.age_limit ? `<i class="bi bi-person-badge-fill"></i> ${game.age_limit}+ év` : ''}
                                    </div>
                                </div>
                            </small>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
                        <small class="text-muted">${game.publisher || 'Kiadó ismeretlen'}</small>
                        <div class="d-flex gap-2">
                            <button class="btn btn-link wishlist-btn p-0" 
                                    data-game-id="${game.boardgame_id}"
                                    data-is-wishlist="${game.is_in_wishlist || false}"
                                    style="font-size: 1.5rem; color: ${game.is_in_wishlist ? '#dc3545' : '#6c757d'};"
                                    title="${game.is_in_wishlist ? 'Eltávolítás a kívánságlistáról' : 'Hozzáadás a kívánságlistához'}">
                                <i class="bi ${game.is_in_wishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
                            </button>
                            <button class="btn btn-link owned-btn p-0" 
                                    data-game-id="${game.boardgame_id}"
                                    data-is-owned="${game.is_owned || false}"
                                    style="font-size: 1.5rem; color: ${game.is_owned ? '#198754' : '#6c757d'};"
                                    title="${game.is_owned ? 'Eltávolítás a meglévő játékok közül' : 'Hozzáadás a meglévő játékokhoz'}">
                                <i class="bi ${game.is_owned ? 'bi-check-circle-fill' : 'bi-check-circle'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Kártya eseménykezelők hozzáadása
    function attachCardEventListeners() {
        // Kártya kattintás - navigálás
        document.querySelectorAll('.boardgame-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.closest('.wishlist-btn') || e.target.closest('.owned-btn')) {
                    return;
                }
                const gameId = this.getAttribute('data-game-id');
                window.location.href = `/tarsasjatek/${gameId}`;
            });
        });

        // Wishlist gombok
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                await toggleWishlist(this);
            });
        });

        // Owned gombok
        document.querySelectorAll('.owned-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                await toggleOwned(this);
            });
        });
    }

    // Wishlist toggle
    async function toggleWishlist(button) {
        button.disabled = true;
        const gameId = button.getAttribute('data-game-id');
        const isInWishlist = button.getAttribute('data-is-wishlist') === 'true';

        try {
            const method = isInWishlist ? 'DELETE' : 'POST';
            const response = await fetch(`/api/wishlist/${gameId}`, { method });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Hiba történt');
            }

            // Státusz frissítése
            const newStatus = !isInWishlist;
            button.setAttribute('data-is-wishlist', newStatus);

            // Ha wishlist-re kerül és owned volt, owned-et kivesszük
            if (newStatus) {
                const ownedBtn = button.closest('.card-footer').querySelector('.owned-btn');
                const isOwned = ownedBtn.getAttribute('data-is-owned') === 'true';
                if (isOwned) {
                    await toggleOwned(ownedBtn);
                }
            }

            // Gomb frissítése
            if (newStatus) {
                button.style.color = '#dc3545';
                button.innerHTML = '<i class="bi bi-heart-fill"></i>';
                button.title = 'Eltávolítás a kívánságlistáról';
            } else {
                button.style.color = '#6c757d';
                button.innerHTML = '<i class="bi bi-heart"></i>';
                button.title = 'Hozzáadás a kívánságlistához';
            }

        } catch (error) {
            console.error('Wishlist hiba:', error);
            await modalAlert( error.message || 'Hiba történt. Lehet, hogy be kell jelentkezned.');
        } finally {
            button.disabled = false;
        }
    }

    // Owned toggle
    async function toggleOwned(button) {
        button.disabled = true;
        const gameId = button.getAttribute('data-game-id');
        const isOwned = button.getAttribute('data-is-owned') === 'true';

        try {
            const method = isOwned ? 'DELETE' : 'POST';
            const response = await fetch(`/api/owned/${gameId}`, { method });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Hiba történt');
            }

            // Státusz frissítése
            const newStatus = !isOwned;
            button.setAttribute('data-is-owned', newStatus);

            // Ha owned-re kerül és wishlist volt, wishlist-et kivesszük
            if (newStatus) {
                const wishlistBtn = button.closest('.card-footer').querySelector('.wishlist-btn');
                const isInWishlist = wishlistBtn.getAttribute('data-is-wishlist') === 'true';
                if (isInWishlist) {
                    await toggleWishlist(wishlistBtn);
                }
            }

            // Gomb frissítése
            if (newStatus) {
                button.style.color = '#198754';
                button.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
                button.title = 'Eltávolítás a meglévő játékok közül';
            } else {
                button.style.color = '#6c757d';
                button.innerHTML = '<i class="bi bi-check-circle"></i>';
                button.title = 'Hozzáadás a meglévő játékokhoz';
            }

        } catch (error) {
            console.error('Owned hiba:', error);
            await modalAlert( error.message || 'Hiba történt. Lehet, hogy be kell jelentkezned.');
        } finally {
            button.disabled = false;
        }
    }
});
