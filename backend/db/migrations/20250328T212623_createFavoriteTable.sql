CREATE TABLE favorite (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    restaurant_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user (id)
);