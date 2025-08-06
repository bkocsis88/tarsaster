-- BoardGame data
INSERT INTO BoardGame (name, age_limit, player_count, category, playing_time_in_minutes, publisher, video_url, tags) VALUES
('Azul', 8, 4, 'Taktikai', 40, 'Next Move Games', 'https://www.youtube.com/watch?v=1IvbZkX9UOg', 'csempe, logikai'),
('Catan', 10, 4, 'Stratégiai', 90, 'Kosmos', 'https://www.youtube.com/watch?v=Kw4tIC_xnU8', 'kereskedelem, kolónia, kockadobás'),
('Dixit', 8, 6, 'Parti', 30, 'Libellud', 'https://www.youtube.com/watch?v=YvG8e2Fbspo', 'képzelet, asszociáció'),
('Ticket to Ride: Europe', 8, 5, 'Családi', 45, 'Days of Wonder', 'https://www.youtube.com/watch?v=qHmf1bau9xQ', 'vasút, térkép'),
('Pandemic', 10, 4, 'Kooperatív', 45, 'Z-Man Games', 'https://www.youtube.com/watch?v=ytK1zDVTgUY', 'járvány, együttműködés'),
('Carcassonne', 7, 5, 'Családi', 40, 'Hans im Glück', 'https://www.youtube.com/watch?v=3kGm0vK3FfM', 'lapkalerakás, stratégia'),
('7 Wonders', 10, 7, 'Stratégiai', 30, 'Repos Production', 'https://www.youtube.com/watch?v=FFvGkI2yB6U', 'kártya, civilizáció'),
('Terraforming Mars', 12, 5, 'Stratégiai', 120, 'FryxGames', 'https://www.youtube.com/watch?v=YyknBTm_YyM', 'mars, gazdaság'),
('Codenames', 10, 8, 'Parti', 15, 'Czech Games Edition', 'https://www.youtube.com/watch?v=ZVTTgR33txo', 'szó, csapatjáték'),
('Root', 12, 4, 'Stratégiai', 75, 'Leder Games', 'https://www.youtube.com/watch?v=Iyq_3TazfdQ', 'frakció, háború');

-- BoardGameImage data
INSERT INTO BoardGameImage (boardgame_id, data) VALUES
(1, 'azul.jpg'),
(2, 'catan.jpg'),
(3, 'dixit.jpg'),
(4, 'ticket_to_ride.jpg'),
(5, 'pandemic.jpg'),
(6, 'carcassonne.jpg'),
(7, '7_wonders.jpg'),
(8, 'terraforming_mars.jpg'),
(9, 'codenames.jpg'),
(10, 'root.jpg');

-- User data
INSERT INTO User (username, email, full_name, password, birthdate, location) VALUES
('anna_k', 'anna@example.com', 'Kiss Anna', 'hashed_pw1', '1990-05-15', 'Budapest'),
('peter_n', 'peter@example.com', 'Nagy Péter', 'hashed_pw2', '1985-12-01', 'Szeged'),
('gabor_t', 'gabor@example.com', 'Tóth Gábor', 'hashed_pw3', '2000-08-25', 'Debrecen'),
('zsuzsa_v', 'zsuzsa@example.com', 'Varga Zsuzsa', 'hashed_pw4', '1995-03-10', 'Győr'),
('dani_b', 'dani@example.com', 'Balla Dániel', 'hashed_pw5', '2002-07-21', 'Miskolc');

-- UserBoardGame data
INSERT INTO UserBoardGame (user_id, boardgame_id) VALUES
(1, 1), (1, 2), (1, 6),
(2, 3), (2, 4), (2, 7),
(3, 2), (3, 5), (3, 8),
(4, 1), (4, 9),
(5, 10), (5, 6);

-- Wishlist data
INSERT INTO Wishlist (user_id, boardgame_id) VALUES
(1, 5), (1, 7),
(2, 1), (2, 10),
(3, 4), (3, 9),
(4, 8), (4, 3),
(5, 2), (5, 7);

-- UserGroup data
INSERT INTO UserGroup (group_name, description) VALUES
('Péntek esti játékklub', 'Heti rendszerességű közös játékest péntekenként.'),
('Stratégák köre', 'Komoly stratégiai játékok kedvelőinek csoportja.'),
('Családi délután', 'Családbarát társasozások hétvégente.'),
('Kooperatív fanok', 'Csak kooperatív játékok rajongóinak.'),
('Gyors körök', 'Rövid, pörgős játékok kedvelőinek.');

-- GroupMember data
INSERT INTO GroupMember (user_id, group_id) VALUES
(1, 1), (1, 3),
(2, 1), (2, 2),
(3, 2), (3, 4),
(4, 5), (4, 1),
(5, 5), (5, 3);
