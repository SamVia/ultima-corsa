import sqlite3Pkg from 'sqlite3';
const sqlite3 = sqlite3Pkg.verbose();

const db = new sqlite3.Database('database.db', (err) => {
    if (err) throw err;

    db.run("PRAGMA foreign_keys = ON;"); //dato che uso chiavi esterne in 'tratte'
});

export default db;