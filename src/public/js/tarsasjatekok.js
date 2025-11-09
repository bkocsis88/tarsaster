//Társasjátékok oldal funkciók
document.addEventListener('DOMContentLoaded', function(){
    const boardgamesContainer = document.getElementById('boardgamesContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const noResults = document.getElementById('noResults');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');



    // Szűrő mezők

    const filterName = document.getElementById('filterName');
    const filterCategory = document.getElementById('filterCategory');
    const filterPlayerCount = document.getElementById('filterPlayerCount');

    //Társasjátékok betöltése
    async function loadBoardgames(filters = {}) {
        showLoading();
        hideError();
        hideNoResults();
        boardgamesContainer.innerHTML = '';

        try {
            //Query paraméterek összeállítása
            const queryParams = new URLSearchParams();
            if (filters.name) queryParams.append('name', filters.name);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.player_count) queryParams.append('maxPlayers', filters.player_count);

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
                <img src=${imageUrl}" class="card-img-top" alt="${game.name}"
                    style="height: 200px; object-fit: contain;"
                    onerror="this.src='/images/tarsasapp-logo1.png'">
                <div class="card-body">
                    <h5 class="card-title">${game.name}</h5>
                    <p class="card-text">
                        <small class="text-muted">
                            <i class="bi bi-people-fill"></i>${game.player_count || 'N/A'} játékos<br>
                            <i class="bi bi-clock-fill"></i>${game.playing_time_in_minutes || 'N/A'} perc<br>
                            <i class="bi bi-tag-fill"></i>${game.category || 'Kategória nélkül'}<br>
                            ${game.age_limit ? `<i class="bi bi-person-badge-fill"></i>${game.age_limit}+ év` : ''}
                        </small>
                    </p>
                </div>
                <div class="card-footer bg-transparent">
                    <small class="text-muted">${game.publisher || 'Kiadó ismeretlen'}</small>
                </div>
            </div>
        `;

        boardgamesContainer.appendChild(col);

        //Kattintás esemény

        col.querySelector('.boardgame-card').addEventListener('click', function() {
            window.location.href = `/tarsasjatek/${game.boardgame_id}`;
        });

    }

    //Szűrők alkalmazása

    applyFiltersBtn.addEventListener('click', function() {
        const filters = {
            name: filterName.value.trim(),
            category: filterCategory.value,
            player_count: filterPlayerCount.value
        };
        loadBoardgames(filters);
    });

    //Szűrők törlése
    clearFiltersBtn.addEventListener('click', function() {
        filterName.value = '';
        filterCategory.value = '';
        filterPlayerCount.value = '';
        loadBoardgames();
    });

    //Enter billentyű a név mezőben
    filterName.addEventListener('keypress', function(e) {
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

    // Kezdeti betöltés
    loadBoardgames();

});