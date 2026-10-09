CREATE TABLE "user" (
    id integer PRIMARY KEY,
    name varchar(255) NOT NULL,
    score integer DEFAULT 0
);

INSERT INTO "user" (id, name, score) VALUES
    (1, 'zhang', 50),
    (2, 'wang', 90),
    (3, 'hu', 68);
