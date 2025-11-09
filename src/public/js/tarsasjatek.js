// Társasjáték részletes nézet funkciók
document.addEventListener('DOMContentLoaded', async function() {
    const gameId = window.gameId;
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const gameContent = document.getElementById('gameContent');

    try {
        // Játék adatainak lekérése
        const gameResponse = await fetch(`/api/boardgames/${gameId}`);
        if (!gameResponse.ok) {
            throw new Error('A játék nem található');
        }
        const game = await gameResponse.json();

        // Játék adatainak megjelenítése
        document.getElementById('gameName').textContent = game.name;
        document.getElementById('gameDescription').textContent = game.description || 'Nincs leírás';
        document.getElementById('playerCount').textContent = game.player_count || 'N/A';
        document.getElementById('playingTime').textContent = game.playing_time_in_minutes ? `${game.playing_time_in_minutes} perc` : 'N/A';
        document.getElementById('ageLimit').textContent = game.age_limit ? `${game.age_limit}+ év` : 'N/A';
        document.getElementById('category').textContent = game.category || 'Kategória nélkül';
        document.getElementById('publisher').textContent = game.publisher || 'Ismeretlen';

        // Címkék megjelenítése
        if (game.tags) {
            const tagsArray = game.tags.split(',');
            const tagsHtml = tagsArray.map(tag => `<span class="badge bg-secondary me-1">${tag.trim()}</span>`).join('');
            document.getElementById('tags').innerHTML = tagsHtml;
        } else {
            document.getElementById('tagsContainer').style.display = 'none';
        }

        // YouTube videó beágyazás
        if (game.video_url) {
            const videoId = extractYouTubeId(game.video_url);
            if (videoId) {
                document.getElementById('videoIframe').src = `https://www.youtube.com/embed/${videoId}`;
                document.getElementById('videoContainer').style.display = 'block';
            }
        }

        // Képek betöltése
        try {
            const imagesResponse = await fetch(`/api/boardgames/${gameId}/images`);
            if (imagesResponse.ok) {
                const images = await imagesResponse.json();
                if (images.length > 0) {
                    loadImages(images);
                } else {
                    loadDefaultImage();
                }
            } else {
                loadDefaultImage();
            }
        } catch (error) {
            console.log('Nincs kép ehhez a játékhoz');
            loadDefaultImage();
        }

        // Tartalom megjelenítése
        loadingSpinner.style.display = 'none';
        gameContent.style.display = 'block';

    } catch (error) {
        loadingSpinner.style.display = 'none';
        errorMessage.textContent = 'Hiba történt a társasjáték betöltésekor: ' + error.message;
        errorMessage.style.display = 'block';
        console.error('Error loading game:', error);
    }
});

function loadImages(images) {
    const carouselImages = document.getElementById('carouselImages');
    carouselImages.innerHTML = '';

    images.forEach((image, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        carouselItem.innerHTML = `
            <img src="${image.url}" class="d-block w-100" alt="${image.file_name}"
                 style="height: 300px; object-fit: contain; background-color: #f8f9fa;"
                 onerror="this.src='/images/tarsasapp-logo1.png'">
        `;
        carouselImages.appendChild(carouselItem);
    });

    // Ha csak egy kép van, rejtjük a navigációs gombokat
    if (images.length === 1) {
        document.querySelector('.carousel-control-prev').style.display = 'none';
        document.querySelector('.carousel-control-next').style.display = 'none';
    }
}

function loadDefaultImage() {
    const carouselImages = document.getElementById('carouselImages');
    carouselImages.innerHTML = `
        <div class="carousel-item active">
            <img src="/images/tarsasapp-logo1.png" class="d-block w-100" alt="Nincs kép"
                 style="height: 400px; object-fit: contain; background-color: #f8f9fa;">
        </div>
    `;
    document.querySelector('.carousel-control-prev').style.display = 'none';
    document.querySelector('.carousel-control-next').style.display = 'none';
}

// YouTube videó ID kinyerése különböző URL formátumokból
function extractYouTubeId(url) {
    if (!url) return null;

    //Különböző YouTube URL formátumok támogatása
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Tiszta videó ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

