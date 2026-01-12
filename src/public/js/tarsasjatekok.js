//Társasjátékok oldal funkciók
document.addEventListener('DOMContentLoaded', function(){
    const boardgamesContainer = document.getElementById('boardgamesContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const noResults = document.getElementById('noResults');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');

    //Bejelentkezési állapot ellenőrzése
    let isLoggedIn = false;
    checkLoginStatus();

    // Szűrő mezők

    const filterName = document.getElementById('filterName');
    const filterCategory = document.getElementById('filterCategory');
    const filterPlayerCount = document.getElementById('filterPlayerCount');
    const filterAge = document.getElementById('filterAge');

    //Toggle gombok
    const filterWishlistToggle = document.getElementById('filterWishlistToggle');
    const filterOwnedToggle = document.getElementById('filterOwnedToggle');
    const shareAllWishlistBtn = document.getElementById('shareAllWishlistBtn');

    //Bejelentkezési állapot ellenőrzése
    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/profile');
            isLoggedIn = response.ok;
        }
        catch (error) {
            isLoggedIn = false;
        }
    }

    //Társasjátékok betöltése
    async function loadBoardgames(filters = {}) {
        showLoading();
        hideError();
        hideNoResults();
        boardgamesContainer.innerHTML = '';

        try {
            //Query paraméterek összeállítása
            const queryParams = new URLSearchParams();
            if (filters.name) queryParams.append('search', filters.name);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.player_count) queryParams.append('minPlayers', filters.player_count);
            if (filters.player_age) queryParams.append('ageLimit', filters.player_age);
            if (filters.wishlist !== undefined && filters.wishlist !== '') queryParams.append('isInWishlist', filters.wishlist);
            if (filters.owned !== undefined && filters.owned !== '') queryParams.append('isOwned', filters.owned);

            const url= `/api/boardgames${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Hiba a játékok betöltésekor');
            }

            const boardgames = await response.json();
            hideLoading();

            if (boardgames.length === 0) {
                showNoResults();
                return;
            }

            //Játékok megjelenítése
            for (const game of boardgames) {
                await createBoardgameCard(game);
            }
        }
        catch (error) {
            hideLoading();
            showError('Hiba történt a társasjátékok betöltésekor: ' + error.message);
            console.error('Error loading boardgames:', error);
        }
    }

    //Játékkártya létrehozása

    async function createBoardgameCard(game) {
        const col = document.createElement('div');
        col.className = 'col';

        //Első kép lekérése

        let imageUrl ='/images/tarsasapp-logo1.png';  //Alapértelmezett kép
        try {
            const imagesResponse = await fetch(`/api/boardgames/${game.boardgame_id}/images`);
            if (imagesResponse.ok) {
                const images = await imagesResponse.json();
                if (images.length > 0) {
                    imageUrl = images[0].url;
                }
            }
        }
        catch (error) {
            console.log('Nincs kép ehhez a játékhoz:', game.boardgame_id);
        }

        col.innerHTML = `
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
                                        <i class="bi bi-people-fill"></i>${game.player_count || 'N/A'} játékos
                                    </div>
                                    <div class="col-6">
                                        <i class="bi bi-clock-fill"></i>${game.playing_time_in_minutes || 'N/A'} perc
                                    </div>
                                    <div class="col-6">
                                        <i class="bi bi-tag-fill"></i>${game.category || 'Kategória nélkül'}
                                    </div>
                                    <div class="col-6">
                                        ${game.age_limit ? `<i class="bi bi-person-badge-fill"></i>${game.age_limit}+ év` : ''}
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
                                style="font-size: 1.5rem; color: ${game.is_in_wishlist ? '#dc3545' : '#6c757d'};"
                                title="${game.is_in_wishlist ? 'Eltávolítás a kívánságlistáról' : 'Hozzáadás a kívánságlistához'}">
                            <i class="bi ${game.is_in_wishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        </button>
                        <button class="btn btn-link owned-btn p-0" 
                                data-game-id="${game.boardgame_id}"
                                style="font-size: 1.5rem; color: ${game.is_owned ? '#198754' : '#6c757d'};"
                                title="${game.is_owned ? 'Eltávolítás a meglévő játékok közül' : 'Hozzáadás a meglévő játékokhoz'}">
                            <i class="bi ${game.is_owned ? 'bi-check-circle-fill' : 'bi-check-circle'}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        boardgamesContainer.appendChild(col);

        //Kattintás esemény

        col.querySelector('.boardgame-card').addEventListener('click', function(e) {
            // Ha gombra kattintottunk, ne navigáljunk
            if (e.target.closest('.wishlist-btn') || e.target.closest('.owned-btn')) {
                return;
            }
            window.location.href = `/tarsasjatek/${game.boardgame_id}`;
        });

        // Wishlist gomb eseménykezelő
        const wishlistBtn = col.querySelector('.wishlist-btn');
        wishlistBtn.addEventListener('click', async function(e) {
            e.stopPropagation(); // Megakadályozzuk a kártya kattintás eseményét
            await toggleWishlist(game.boardgame_id, game, wishlistBtn);
        });

        // Owned gomb eseménykezelő
        const ownedBtn = col.querySelector('.owned-btn');
        ownedBtn.addEventListener('click', async function(e) {
            e.stopPropagation(); // Megakadályozzuk a kártya kattintás eseményét
            await toggleOwned(game.boardgame_id, game, ownedBtn);
        });

    }

    //Szűrők alkalmazása

    applyFiltersBtn.addEventListener('click', function() {
        const filters = {
            name: filterName.value.trim(),
            category: filterCategory.value,
            player_count: filterPlayerCount.value,
            player_age: filterAge.value,
            wishlist: getToggleValue(filterWishlistToggle),
            owned: getToggleValue(filterOwnedToggle)
        };
        loadBoardgames(filters);
    });

    //Szűrők törlése
    clearFiltersBtn.addEventListener('click', function() {
        filterName.value = '';
        filterCategory.value = '';
        filterPlayerCount.value = '';
        filterAge.value = '';
        resetToggle(filterWishlistToggle);
        resetToggle(filterOwnedToggle);
        loadBoardgames();
    });

    // Toggle gombok kezelése
    filterWishlistToggle.addEventListener('click', async function(e) {
        e.preventDefault();
        if (!isLoggedIn) {
            await modalAlert( 'Ez a funkció csak bejelentkezett felhasználók számára érhető el. Kérjük, jelentkezz be!');
            return;
        }
        toggleFilterButton(this);
    });

    filterOwnedToggle.addEventListener('click', async function(e) {
        e.preventDefault();
        if (!isLoggedIn) {
            await modalAlert( 'Ez a funkció csak bejelentkezett felhasználók számára érhető el. Kérjük, jelentkezz be!');
            return;
        }
        toggleFilterButton(this);
    });

    // Share Wishlist gomb eseménykezelő
    shareAllWishlistBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        if (!isLoggedIn) {
            await modalAlert( 'Ez a funkció csak bejelentkezett felhasználók számára érhető el. Kérjük, jelentkezz be!');
            return;
        }
        openShareWishlistModal();
    });

    // Toggle gomb állapot váltása
    function toggleFilterButton(button) {
        const currentState = button.getAttribute('data-state');
        const icon = button.querySelector('i');
        const filterType = button.getAttribute('data-filter');

        if (currentState === 'off') {
            // Bekapcsol
            button.setAttribute('data-state', 'on');
            if (filterType === 'wishlist') {
                button.style.color = '#dc3545';
                icon.className = 'bi bi-heart-fill';
                resetToggle(filterOwnedToggle); //ha a wishlist bekapcsol, kikapcsolja az owned
            } else {
                button.style.color = '#198754';
                icon.className = 'bi bi-check-circle-fill';
                resetToggle(filterWishlistToggle);
            }
        } else {
            // Kikapcsol
            button.setAttribute('data-state', 'off');
            button.style.color = '#6c757d';
            if (filterType === 'wishlist') {
                icon.className = 'bi bi-heart';
            } else {
                icon.className = 'bi bi-check-circle';
            }
        }

        // Automatikus szűrés végrehajtása
        applyFiltersBtn.click();
    }

    // Toggle gomb értékének lekérése
    function getToggleValue(button) {
        const state = button.getAttribute('data-state');
        return state === 'on' ? 'true' : '';
    }

    // Toggle gomb alaphelyzetbe állítása
    function resetToggle(button) {
        const icon = button.querySelector('i');
        const filterType = button.getAttribute('data-filter');
        
        button.setAttribute('data-state', 'off');
        button.style.color = '#6c757d';
        
        if (filterType === 'wishlist') {
            icon.className = 'bi bi-heart';
        } else {
            icon.className = 'bi bi-check-circle';
        }
    }

    //Enter billentyű a név mezőben
    filterName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });

    //Enter billentyű a kategória mezőben
    filterCategory.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });

    //Enter billentyű a játékosok száma mezőben
    filterPlayerCount.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });

    //Enter billentyű a korhatár mezőben
    filterAge.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });

    //Segédfüggvények

    function showLoading() {
        loadingSpinner.style.display = 'block';
        boardgamesContainer.style.display = 'none';
    }

    function hideLoading() {
        loadingSpinner.style.display = 'none';
        boardgamesContainer.style.display = 'flex';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function showNoResults() {
        noResults.style.display = 'block';
    }

    function hideNoResults() {
        noResults.style.display = 'none';
    }

    // Wishlist toggle funkció
    async function toggleWishlist(boardgameId, game, button) {
        button.disabled = true;

        try {
            const method = game.is_in_wishlist ? 'DELETE' : 'POST';
            const response = await fetch(`/api/wishlist/${boardgameId}`, { method });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Hiba történt');
            }

            // Státusz frissítése
            game.is_in_wishlist = !game.is_in_wishlist;

            //Ha wishlistre kerül, az owned-ről le kell szedni
            if (game.is_in_wishlist && game.is_owned) {
                const ownedBtn = button.closest('.card-footer').querySelector('.owned-btn');
                await toggleOwned(boardgameId, game, ownedBtn);
            }

            // Gomb frissítése
            if (game.is_in_wishlist) {
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

    // Owned toggle funkció
    async function toggleOwned(boardgameId, game, button) {
        button.disabled = true;

        try {
            const method = game.is_owned ? 'DELETE' : 'POST';
            const response = await fetch(`/api/owned/${boardgameId}`, { method });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Hiba történt');
            }

            // Státusz frissítése
            game.is_owned = !game.is_owned;

            //Ha ownedre kerül, az wishlist-ről le kell szedni
            if (game.is_owned && game.is_in_wishlist) {
                const wishlistBtn = button.closest('.card-footer').querySelector('.wishlist-btn');
                await toggleWishlist(boardgameId, game, wishlistBtn);
            }

            // Gomb frissítése
            if (game.is_owned) {
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
    
    // Kezdeti betöltés
    loadBoardgames();

    // Share Wishlist Modal megnyitása
    function openShareWishlistModal() {
        const modal = new bootstrap.Modal(document.getElementById('shareWishlistModal'));
        document.getElementById('recipientEmail').value = '';
        loadWishlistLinks();
        modal.show();
    }

    // Kívánságlista linkek betöltése
    async function loadWishlistLinks() {
        const container = document.getElementById('wishlistLinksContainer');
        
        try {
            const response = await fetch('/api/boardgames');
            if (!response.ok) {
                throw new Error('Hiba a kívánságlista betöltésekor');
            }

            const boardgames = await response.json();
            const wishlistGames = boardgames.filter(game => game.is_in_wishlist === true);

            if (wishlistGames.length === 0) {
                container.innerHTML = '<p class="text-muted"><small>Nincsenek játékok a kívánságlistádban.</small></p>';
                return;
            }

            let linksHTML = '<ul class="list-unstyled">';
            wishlistGames.forEach(game => {
                linksHTML += `<li><a href="/tarsasjatek/${game.boardgame_id}" target="_blank">${game.name}</a></li>`;
            });
            linksHTML += '</ul>';

            container.innerHTML = linksHTML;
        } catch (error) {
            console.error('Hiba a kívánságlista linkek betöltésekor:', error);
            container.innerHTML = '<p class="text-danger"><small>Hiba a kívánságlista betöltésekor.</small></p>';
        }
    }

    // Email küldés gomb eseménykezelő
    document.getElementById('sendEmailBtn').addEventListener('click', async function() {
        const email = document.getElementById('recipientEmail').value.trim();
        const subject = document.getElementById('emailSubject').value.trim();
        const baseMessage = 'Szia! Szeretném megosztani veled a kívánságlistámat';

        if (!email) {
            await modalAlert( 'Kérjük, add meg az email címet!');
            return;
        }

        if (!validateEmail(email)) {
            await modalAlert( 'Kérjük, add meg egy érvényes email címet!');
            return;
        }

        try {
            // Kívánságlista játékainak betöltése
            const response = await fetch('/api/boardgames');
            if (!response.ok) {
                throw new Error('Hiba a kívánságlista betöltésekor');
            }

            const boardgames = await response.json();
            const wishlistGames = boardgames.filter(game => game.is_in_wishlist === true);

            // Üzenet összeállítása
            let message = baseMessage + '\n\n';
            
            if (wishlistGames.length > 0) {
                message += 'Kívánságlista játékai:\n';
                wishlistGames.forEach(game => {
                    const gameUrl = `${window.location.origin}/tarsasjatek/${game.boardgame_id}`;
                    message += `- ${game.name}: ${gameUrl}\n`;
                });
            } else {
                message += 'Jelenleg nincsenek játékok a kívánságlistámban.';
            }

            // Email küldése API-n kersztül
            const emailResponse = await fetch('/api/send-email', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: email,
                    subject: subject || 'Kívánságlistám a TársasApp-on',
                    html: message
                })
            });

            // Modal bezárása
            bootstrap.Modal.getInstance(document.getElementById('shareWishlistModal')).hide();
            await modalAlert('E-mail sikeresen elküldve!');
        } catch (error) {
            console.error('E-mail küldési hiba:', error);
            await modalAlert( error.message || 'Hiba történt az e-mail előkészítésekor');
        }
    });

    // Email validáció
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

});