CREATE DATABASE tarsasapp; -- mert ez az alkalmazás neve

USE tarsasapp;

CREATE TABLE BoardGame (
    id INT AUTO_INCREMENT PRIMARY KEY, --nem kell az id-k elé a tábla neve, mert csak sokat kell gépelni később mindennél is
    name VARCHAR(250) NOT NULL,
    age_limit INT NOT NULL,
    player_count INT NOT NULL,
    category VARCHAR(250) NOT NULL,
    playing_time INT NOT NULL,  -- percben értendő, hogy később tudjunk rá keresni (pl. playing_time <60)
    publisher VARCHAR(250),
    video_url VARCHAR(250),
    tags TEXT
);


CREATE TABLE BoardGameImage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    boardgame_id INT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (boardgame_id) REFERENCES BoardGame(id)
        ON DELETE CASCADE
);


CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name TEXT NOT NULL UNIQUE, --mert mindent aláhúzással választottál el (csak az egység miatt)
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password TEXT NOT NULL,
    birthdate DATE,
    location VARCHAR(255)
);


CREATE TABLE UserBoardGame (
    user_id INT NOT NULL,
    boardgame_id INT NOT NULL,
    PRIMARY KEY (user_id, boardgame_id),
    FOREIGN KEY (user_id) REFERENCES User(id)
        ON DELETE CASCADE,
    FOREIGN KEY (boardgame_id) REFERENCES BoardGame(id)
        ON DELETE CASCADE
);


CREATE TABLE Wishlist (
    user_id INT NOT NULL,
    boardgame_id INT NOT NULL,
    PRIMARY KEY (user_id, boardgame_id),
    FOREIGN KEY (user_id) REFERENCES User(id)
        ON DELETE CASCADE,
    FOREIGN KEY (boardgame_id) REFERENCES BoardGame(id)
        ON DELETE CASCADE
);


CREATE TABLE UserGroup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);


CREATE TABLE GroupMember (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(id)
        ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES UserGroup(id)
        ON DELETE CASCADE
);
