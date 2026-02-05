const Database = require("better-sqlite3");
const path = require("node:path");
const readline = require("node:readline/promises");
const process = require("node:process");

const DB_PATH = path.resolve(__dirname, "..", "test.db");
const db = new Database(DB_PATH);

let initialized = false;

const sampleFilms = [
  ["Parasite", 2019, "Drama", 12.99],
  ["The Matrix", 1999, "Sci-Fi", 9.99],
  ["Superbad", 2007, "Comedy", 7.99],
  ["The Godfather", 1972, "Crime", 14.99],
  ["Interstellar", 2014, "Sci-Fi", 11.99],
  ["The Shining", 1980, "Horror", 8.99],
  ["Gladiator", 2000, "Action", 9.49],
  ["Groundhog Day", 1993, "Comedy", 6.99],
  ["Pulp Fiction", 1994, "Crime", 10.99],
  ["Arrival", 2016, "Sci-Fi", 10.49],
  ["Whiplash", 2014, "Drama", 9.49],
  ["Die Hard", 1988, "Action", 8.49],
  ["Get Out", 2017, "Horror", 10.99],
  ["Forrest Gump", 1994, "Drama", 9.99],
  ["Mad Max: Fury Road", 2015, "Action", 11.49],
  ["The Big Lebowski", 1998, "Comedy", 8.99],
  ["Se7en", 1995, "Crime", 9.49],
  ["Alien", 1979, "Sci-Fi", 8.99],
  ["John Wick", 2014, "Action", 10.49],
  ["The Shawshank Redemption", 1994, "Drama", 12.49],
  ["Hereditary", 2018, "Horror", 10.49],
  ["Inception", 2010, "Sci-Fi", 11.99],
  ["Step Brothers", 2008, "Comedy", 7.99],
  ["The Departed", 2006, "Crime", 10.99],
  ["Fight Club", 1999, "Drama", 9.99],
];

function ensureFilmsPriceColumn() {
  const columns = db.prepare("PRAGMA table_info('films')").all();
  const hasPrice = columns.some((c) => c.name === "price");
  if (hasPrice) return;

  db.exec("ALTER TABLE films ADD COLUMN price REAL NOT NULL DEFAULT 0");
}

function initDb() {
  if (initialized) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS films (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER,
      genre TEXT,
      price REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  ensureFilmsPriceColumn();

  const filmCount = db.prepare("SELECT COUNT(*) AS count FROM films").get().count;
  if (filmCount === 0) {
    const insert = db.prepare(
      "INSERT INTO films (title, year, genre, price) VALUES (?, ?, ?, ?)",
    );
    const insertMany = db.transaction((films) => {
      for (const film of films) insert.run(film[0], film[1], film[2], film[3]);
    });
    insertMany(sampleFilms);
  }

  initialized = true;
}

function viewAllFilms() {
  initDb();
  return db.prepare("SELECT * FROM films ORDER BY id").all();
}

function insertFilm(title, year, genre, price) {
  initDb();
  const info = db
    .prepare(
      "INSERT INTO films (title, year, genre, price) VALUES (?, ?, ?, COALESCE(?, 0))",
    )
    .run(title, year ?? null, genre ?? null, price ?? null);
  return info.lastInsertRowid;
}

function updateFilm(id, updates) {
  initDb();
  const info = db
    .prepare(`
      UPDATE films
      SET
        title = COALESCE(@title, title),
        year = COALESCE(@year, year),
        genre = COALESCE(@genre, genre),
        price = COALESCE(@price, price)
      WHERE id = @id
    `)
    .run({
      id,
      title: updates.title ?? null,
      year: updates.year ?? null,
      genre: updates.genre ?? null,
      price: updates.price ?? null,
    });
  return info.changes;
}

function deleteFilm(id) {
  initDb();
  const info = db.prepare("DELETE FROM films WHERE id = ?").run(id);
  return info.changes;
}

function addUser(name) {
  initDb();
  const info = db.prepare("INSERT INTO users (name) VALUES (?)").run(name);
  return info.lastInsertRowid;
}

function retrieveUsers() {
  initDb();
  return db.prepare("SELECT id, name FROM users ORDER BY id DESC").all();
}

async function promptRequired(rl, label) {
  while (true) {
    const answer = (await rl.question(`${label}: `)).trim();
    if (answer.length > 0) return answer;
    process.stdout.write("Please enter a value.\n");
  }
}

function parseOptionalInt(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseOptionalFloat(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : NaN;
}

async function runCli() {
  initDb();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const choice = (
        await rl.question(
          "\nChoose: (v)iew all, (i)nsert, (u)pdate, (d)elete, (q)uit: ",
        )
      )
        .trim()
        .toLowerCase();

      if (choice === "q" || choice === "quit" || choice === "exit") return;

      if (choice === "v" || choice === "view") {
        const films = viewAllFilms();
        console.table(films);
        continue;
      }

      if (choice === "i" || choice === "insert") {
        const title = await promptRequired(rl, "Title");
        const yearRaw = await rl.question("Year (optional): ");
        const year = parseOptionalInt(yearRaw);
        if (Number.isNaN(year)) {
          process.stdout.write("Year must be a number.\n");
          continue;
        }
        const genre = (await rl.question("Genre (optional): ")).trim();
        const priceRaw = await rl.question("Price (optional): ");
        const price = parseOptionalFloat(priceRaw);
        if (Number.isNaN(price)) {
          process.stdout.write("Price must be a number.\n");
          continue;
        }

        const normalizedYear = year ?? null;
        const normalizedGenre = genre.length ? genre : null;
        const normalizedPrice = price ?? 0;

        process.stdout.write(
          `About to insert:\n- title: ${title}\n- year: ${normalizedYear ?? ""}\n- genre: ${normalizedGenre ?? ""}\n- price: ${normalizedPrice}\n`,
        );
        const confirm = (await rl.question("Confirm insert? (y/N): "))
          .trim()
          .toLowerCase();
        if (confirm !== "y" && confirm !== "yes") {
          process.stdout.write("Cancelled.\n");
          continue;
        }

        const newId = insertFilm(
          title,
          year,
          genre.length ? genre : undefined,
          normalizedPrice,
        );
        process.stdout.write(`Inserted film with id ${newId.toString()}.\n`);
        continue;
      }

      if (choice === "u" || choice === "update") {
        const idRaw = await rl.question("Film id to update: ");
        const id = Number.parseInt(idRaw.trim(), 10);
        if (!Number.isFinite(id)) {
          process.stdout.write("Id must be a number.\n");
          continue;
        }

        const existing = db
          .prepare("SELECT * FROM films WHERE id = ?")
          .get(id);
        if (!existing) {
          process.stdout.write(`No film found with id ${id}.\n`);
          continue;
        }

        process.stdout.write(
          `Leave blank to keep current value.\n(Current title: ${existing.title}, year: ${existing.year ?? ""}, genre: ${existing.genre ?? ""}, price: ${existing.price})\n`,
        );

        const newTitleRaw = await rl.question("New title: ");
        const newYearRaw = await rl.question("New year: ");
        const newGenreRaw = await rl.question("New genre: ");
        const newPriceRaw = await rl.question("New price: ");

        const newTitle = newTitleRaw.trim();
        const newYear = parseOptionalInt(newYearRaw);
        if (Number.isNaN(newYear)) {
          process.stdout.write("Year must be a number.\n");
          continue;
        }
        const newGenre = newGenreRaw.trim();
        const newPrice = parseOptionalFloat(newPriceRaw);
        if (Number.isNaN(newPrice)) {
          process.stdout.write("Price must be a number.\n");
          continue;
        }

        const nextTitle = newTitle.length ? newTitle : existing.title;
        const nextYear = newYear !== undefined ? newYear : existing.year;
        const nextGenre = newGenre.length ? newGenre : existing.genre;
        const nextPrice = newPrice !== undefined ? newPrice : existing.price;

        process.stdout.write(
          `About to update id ${id}:\n- title: ${existing.title} -> ${nextTitle}\n- year: ${existing.year ?? ""} -> ${nextYear ?? ""}\n- genre: ${existing.genre ?? ""} -> ${nextGenre ?? ""}\n- price: ${existing.price} -> ${nextPrice}\n`,
        );
        const confirm = (await rl.question("Confirm update? (y/N): "))
          .trim()
          .toLowerCase();
        if (confirm !== "y" && confirm !== "yes") {
          process.stdout.write("Cancelled.\n");
          continue;
        }

        const changes = updateFilm(id, {
          title: newTitle.length ? newTitle : undefined,
          year: newYear,
          genre: newGenre.length ? newGenre : undefined,
          price: newPrice,
        });
        process.stdout.write(changes ? "Updated.\n" : "No changes.\n");
        continue;
      }

      if (choice === "d" || choice === "delete") {
        const idRaw = await rl.question("Film id to delete: ");
        const id = Number.parseInt(idRaw.trim(), 10);
        if (!Number.isFinite(id)) {
          process.stdout.write("Id must be a number.\n");
          continue;
        }

        const existing = db
          .prepare("SELECT * FROM films WHERE id = ?")
          .get(id);
        if (!existing) {
          process.stdout.write(`No film found with id ${id}.\n`);
          continue;
        }

        const confirm = (await rl.question(`Delete "${existing.title}"? (y/N): `))
          .trim()
          .toLowerCase();
        if (confirm !== "y" && confirm !== "yes") {
          process.stdout.write("Cancelled.\n");
          continue;
        }

        const changes = deleteFilm(id);
        process.stdout.write(changes ? "Deleted.\n" : "Not deleted.\n");
        continue;
      }

      process.stdout.write("Unknown choice. Try v, i, u, d, or q.\n");
    }
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  runCli().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = {
  db,
  viewAllFilms,
  insertFilm,
  updateFilm,
  deleteFilm,
  addUser,
  retrieveUsers,
};
