CREATE TABLE review (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    restaurant_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    commented_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id)
);