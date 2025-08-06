CREATE DATABASE board_game;

USE board_game;

CREATE TABLE BoardGame (
    boardgame_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    age_limit INT NOT NULL,
    player_count INT NOT NULL,
    category VARCHAR(250) NOT NULL,
    playing_time_in_minutes INT NOT NULL,
    publisher VARCHAR(250),
    video_url VARCHAR(250),
    tags TEXT
);


CREATE TABLE BoardGameImage (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    boardgame_id INT NOT NULL,
    data TEXT NOT NULL,
    FOREIGN KEY (boardgame_id) REFERENCES BoardGame(boardgame_id)
        ON DELETE CASCADE
);


CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
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
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (boardgame_id) REFERENCES BoardGame(boardgame_id)
        ON DELETE CASCADE
);


CREATE TABLE Wishlist (
    user_id INT NOT NULL,
    boardgame_id INT NOT NULL,
    PRIMARY KEY (user_id, boardgame_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (boardgame_id) REFERENCES BoardGame(boardgame_id)
        ON DELETE CASCADE
);


CREATE TABLE UserGroup (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);


CREATE TABLE GroupMember (
    group_member_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES UserGroup(group_id)
        ON DELETE CASCADE

);


CREATE TABLE UserRole (
    user_id INT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    CHECK (role_name IN ('admin', 'user')),
    FOREIGN KEY(user_id) REFERENCES User(user_id)
);

);

