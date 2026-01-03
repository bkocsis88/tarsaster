// Gemini AI modul - Képfelismerés társasjátékokhoz
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Multer konfiguráció - memóriában tároljuk a képet (átmenetileg)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Csak PNG és JPG formátumok engedélyezettek!'), false);
        }
    }
});

// Gemini KEY konfiguráció
const GEMINI_API_KEY = 'AIzaSyDJPLV_GPgC5oXx1OGGqS5XpMOSrxNdGls';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// POST /ai/search - Kép alapján társasjáték felismerése
router.post('/search', upload.single('image'), async (req, res) => {
    try {
        // Ellenőrizzük, hogy van-e kép
        if (!req.file) {
            return res.status(400).json({ error: 'Nincs kép feltöltve!' });
        }

        // Kép base64-be konvertálása
        const imageBase64 = req.file.buffer.toString('base64');

        // Gemini hívás
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "Nézd meg ezt a képet és azonosítsd a társasjátékot. Json formátumban válaszolj a következő szerkezetben: {\"Name\": \"A játék neve\", \"Description\": \"A játék leírása\", \"AgeLimit\": \"12\", \"PlayerCount\": \"4\", \"PlayingTimeInMinutes\": \"30\", \"Publisher\": \"A Kiadó\"}. A PlayingTimeInMinutes és PlayerCount csak egy egész szám legyen. A PlayingTimeInMinutes esetében a tartomány legkisebb értékét add meg. A PlayerCount esetében a tartomány legnagyobb értékét add meg."

                    },
                    {
                        inline_data: {
                            mime_type: req.file.mimetype,
                            data: imageBase64
                        }
                    }
                ]
            }]
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API hiba:', error);
            
            // Ellenőrizzük, hogy túlterhelés miatt van-e a hiba
            const errorMessage = error.error?.message || '';
            if (errorMessage.toLowerCase().includes('overloaded') || 
                errorMessage.toLowerCase().includes('resource exhausted') ||
                errorMessage.toLowerCase().includes('quota exceeded')) {
                return res.status(503).json({ 
                    error: 'A mesterséges intelligencia szolgáltatás jelenleg túlterhelt. Kérjük, próbálja meg újra néhány pillanat múlva.',
                    retry: true
                });
            }
            
            return res.status(500).json({ 
                error: 'Hiba történt a képfelismerés során. Kérjük, próbálja meg újra.',
                details: errorMessage || 'Ismeretlen hiba'
            });
        }

        const data = await response.json();
        const gameName = data.candidates[0]?.content?.parts[0]?.text?.trim();

        if (!gameName) {
            return res.status(404).json({ error: 'Nem sikerült felismerni a játékot a képről' });
        }

        // Sikeres válasz a játék nevével
        res.json({ 
            success: true,
            gameName: gameName
        });

    } catch (error) {
        console.error('AI keresés hiba:', error);
        res.status(500).json({ 
            error: 'Szerver hiba történt',
            details: error.message 
        });
    }
});

// POST /ai/search - Kép alapján társasjáték felismerése és játékadatlap kitöltése
router.post('/recognizeboardgameimages', async (req, res) => {
    try {
        // Bodyból kiolvassuk a base64-et
        const {imageBase64, mimeType} = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Nincs kép feltöltve!' });
        }

        // Kép feldolgozás
        const processedBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

        // Gemini hívás
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: "Nézd meg ezt a képet és azonosítsd a társasjátékot. Json formátumban válaszolj a következő szerkezetben: {\"Name\": \"A játék neve\", \"Description\": \"A játék leírása\", \"AgeLimit\": \"12\", \"PlayerCount\": \"4\", \"PlayingTimeInMinutes\": \"30\", \"Publisher\": \"A Kiadó\"}. A PlayingTimeInMinutes és a PlayerCount csak egy egész szám legyen, a tartomány legkisebb értékét add meg."
                    },
                    {
                        inline_data: {
                            mime_type: mimeType || 'image/jpeg',
                            data: processedBase64
                        }
                    }
                ]
            }]
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API hiba:', error);
            
            // Ellenőrizzük, hogy túlterhelés miatt van-e a hiba
            const errorMessage = error.error?.message || '';
            if (errorMessage.toLowerCase().includes('overloaded') || 
                errorMessage.toLowerCase().includes('resource exhausted') ||
                errorMessage.toLowerCase().includes('quota exceeded')) {
                return res.status(503).json({ 
                    error: 'A mesterséges intelligencia szolgáltatás jelenleg túlterhelt. Kérjük, próbálja meg újra néhány pillanat múlva.',
                    retry: true
                });
            }
            
            return res.status(500).json({ 
                error: 'Hiba történt a képfelismerés során. Kérjük, próbálja meg újra.',
                details: errorMessage || 'Ismeretlen hiba'
            });
        }

        const data = await response.json();
        let gameData = data.candidates[0]?.content?.parts[0]?.text?.trim();

        if (!gameData) {
            return res.status(404).json({ error: 'Nem sikerült felismerni a játékot a képről' });
        }

        // Markdown JSON jelölések eltávolítása
        gameData = gameData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // JSON string parszeálása objektummá
        try {
            gameData = JSON.parse(gameData);
        } catch (parseError) {
            console.error('JSON parse hiba:', parseError);
            // Ha parse sikertelen, visszaküldjük a nyers szöveget
        }

        // Sikeres válasz a játék nevével
        res.json({ 
            success: true,
            gameData: gameData
        });

    } catch (error) {
        console.error('AI keresés hiba:', error);
        res.status(500).json({ 
            error: 'Szerver hiba történt',
            details: error.message 
        });
    }
});

module.exports = router;
