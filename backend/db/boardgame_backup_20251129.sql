-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 29, 2025 at 07:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `board_game`
--

-- --------------------------------------------------------

--
-- Table structure for table `boardgame`
--

CREATE TABLE `boardgame` (
  `boardgame_id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `age_limit` int(11) NOT NULL,
  `player_count` int(11) NOT NULL,
  `category` varchar(250) NOT NULL,
  `playing_time` text NOT NULL,
  `publisher` varchar(250) DEFAULT NULL,
  `video_url` varchar(250) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `playing_time_in_minutes` int(11) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `boardgame`
--

INSERT INTO `boardgame` (`boardgame_id`, `name`, `age_limit`, `player_count`, `category`, `playing_time`, `publisher`, `video_url`, `tags`, `playing_time_in_minutes`, `description`) VALUES
(1, 'Azul', 8, 4, 'logikai', '30–45 perc', 'Next Move Games', 'https://www.youtube.com/watch?v=1IvbZkX9UOg', 'csempe, logikai', 45, ''),
(2, 'Catan', 10, 4, 'stratégiai', '60–120 perc', 'Kosmos', 'https://www.youtube.com/watch?v=Kw4tIC_xnU8', 'kereskedelem, kolónia, kockadobás', 0, ''),
(3, 'Dixit', 8, 6, 'party', '30 perc', 'Libellud', 'https://www.youtube.com/watch?v=YvG8e2Fbspo', 'képzelet, asszociáció', 0, ''),
(4, 'Ticket to Ride: Europe', 8, 5, 'logikai', '30–60 perc', 'Days of Wonder', 'https://www.youtube.com/watch?v=qHmf1bau9xQ', 'vasút, térkép', 0, ''),
(5, 'Pandemic', 10, 4, 'szabadulo', '45 perc', 'Z-Man Games', 'https://www.youtube.com/watch?v=ytK1zDVTgUY', 'járvány, együttműködés', 0, ''),
(6, 'Carcassonne', 7, 5, 'stratégiai', '30–45 perc', 'Hans im Glück', 'https://www.youtube.com/watch?v=3kGm0vK3FfM', 'lapkalerakás, stratégia', 0, ''),
(7, '7 Csoda', 10, 3, 'stratégiai', '30 perc', 'Repos Production', 'https://www.youtube.com/watch?v=FFvGkI2yB6U', 'kártya, civilizáció', 30, ''),
(8, 'Mars Terraformálása', 12, 5, 'stratégiai', '120 perc', 'FryxGames', 'https://www.youtube.com/watch?v=YyknBTm_YyM', 'mars, gazdaság', 120, ''),
(10, 'Root', 14, 2, 'stratégiai', '60–90 perc', 'Leder Games', 'https://www.youtube.com/watch?v=Iyq_3TazfdQ', 'frakció, háború', 60, ''),
(14, 'A Dél-Tigris vándorai', 13, 4, 'stratégiai', '', 'kispista', 'https://youtu.be/h5eDzA_vTds', 'családi', 90, ''),
(15, 'A kockahegyen is túl', 8, 2, 'stratégiai', '', 'Korona Games', 'https://youtu.be/glhsah8tQ7E', 'Grim meseszereplők, kockajáték, szereplő', 60, 'Piroska, Csizmás kandúr, Hófehérke, A brémai muzsikusok, Hüvelyk Matyi, Aranyhaj és még sokan mások bőrébe bújva játszhatod ezt a játékot. Kiválasztott mesehősöd segítségével rengeteg különleges kalandban vehetsz részt. Különböző küldetéseket kell teljesítened és kalandpontokat szerezned. Utad során találkozhatsz ismerősökkel, és a játék során felfedett történetkártyák akár segíthetnek, akár akadályozhatnak téged. Ez a különleges kockákra épülő játék, jó szórakozás lehet családok, barátok részére. A doboz tartalma: 1 db játéktábla, 9 mesefigura, 138 játékkártya, 9 karakter kártya, 26 egyedi kocka, 60 korong, játékszabály. Igazi családi társasjáték, minden korosztály számára egy igazi utazás a MeseVilágba!');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `boardgame`
--
ALTER TABLE `boardgame`
  ADD PRIMARY KEY (`boardgame_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `boardgame`
--
ALTER TABLE `boardgame`
  MODIFY `boardgame_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
