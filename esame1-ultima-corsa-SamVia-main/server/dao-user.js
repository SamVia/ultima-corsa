import db from './db.js';

// ritorna una promise che si risolve con l'utente trovato o null se non esiste
export const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM utenti WHERE username = ?', [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// ritorna una promise che si risolve con l'utente trovato o null se non esiste
export const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT id, username, punteggio, partite_giocate FROM utenti WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// aggiorna  il numero di partite giocate e il punteggio dell'utente, se il nuovo punteggio è più alto di quello attuale
export const updateUserScore = (id, punteggioNuovo) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE utenti 
            SET partite_giocate = partite_giocate + 1, 
                punteggio = MAX(punteggio, ?) 
            WHERE id = ?
        `;
        db.run(query, [punteggioNuovo, id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// ritorna una promise che si risolve con l'array degli utenti ordinati per punteggio decrescente, limitato ai primi 10
export const getLeaderboard = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT username, punteggio, partite_giocate 
            FROM utenti 
            WHERE partite_giocate > 0 
            ORDER BY punteggio DESC
            LIMIT 10
        `;
        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};