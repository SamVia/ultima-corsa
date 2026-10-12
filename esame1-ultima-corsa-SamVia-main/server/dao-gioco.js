import db from './db.js';

// ritorna una promise che si risolve con l'array di tutte le stazioni
export const getAllStazioni = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM stazioni', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
// ritorna una promise che si risolve con l'array di tutte le tratte
export const getAllTratte = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM tratte', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
// ritorna una promise che si risolve con l'array di tutti gli eventi
export const getAllEventi = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM eventi', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};