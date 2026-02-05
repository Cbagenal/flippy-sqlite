import Database from "better-sqlite3";

const db = new Database("test.db");

// 1. Create the table
db.exec(`
    CREATE TABLE IF NOT EXISTS films (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        year INTEGER,
        genre TEXT
    )
`);

const sample_films = [
    ['Parasite', 2019, 'Drama'],
    ['The Matrix', 1999, 'Sci-Fi'],
    ['Superbad', 2007, 'Comedy'],
    ['The Godfather', 1972, 'Crime'],
    ['Interstellar', 2014, 'Sci-Fi'],
    ['The Shining', 1980, 'Horror'],
    ['Gladiator', 2000, 'Action'],
    ['Groundhog Day', 1993, 'Comedy'],
    ['Pulp Fiction', 1994, 'Crime'],
    ['Arrival', 2016, 'Sci-Fi'],
    ['Whiplash', 2014, 'Drama'],
    ['Die Hard', 1988, 'Action'],
    ['Get Out', 2017, 'Horror'],
    ['Forrest Gump', 1994, 'Drama'],
    ['Mad Max: Fury Road', 2015, 'Action'],
    ['The Big Lebowski', 1998, 'Comedy'],
    ['Se7en', 1995, 'Crime'],
    ['Alien', 1979, 'Sci-Fi'],
    ['John Wick', 2014, 'Action'],
    ['The Shawshank Redemption', 1994, 'Drama'],
    ['Hereditary', 2018, 'Horror'],
    ['Inception', 2010, 'Sci-Fi'],
    ['Step Brothers', 2008, 'Comedy'],
    ['The Departed', 2006, 'Crime'],
    ['Fight Club', 1999, 'Drama']
];


const insert = db.prepare('INSERT INTO films (title, year, genre) VALUES (?, ?, ?)')

const insertMany = db.transaction((films) => {
    for(const film of films){
        insert.run(film[0], film[1], film[2])
    }
})

insertMany(sample_films);

const listFilms = () => {
    const retrieve = db.prepare('SELECT * FROM films')
    const films = stmt.all(); 

console.log(films);
}

// 3. Retrieve the data


export default db;