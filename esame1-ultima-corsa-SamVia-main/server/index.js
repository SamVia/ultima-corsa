import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; 
import passport from 'passport';
import passportLocal from 'passport-local';
import session from 'express-session';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';

const LocalStrategy = passportLocal.Strategy;

import * as userDao from './dao-user.js';
import * as gameDao from './dao-gioco.js';

const app = express();
const PORT = 3001;

app.use(morgan('dev')); 
app.use(express.json()); 

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true, 
};
app.use(cors(corsOptions));

app.use(session({
    secret: 'applicazioni_web',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: 'lax' }
}));

app.use(passport.initialize());
app.use(passport.session());

//variabili di cache per ridurre le query al database, così da migliorare le performance del server
let stazioniCache = [];
let tratteCache = [];
let eventiCache = [];
let grafoMappa = {};
let stazioniIdsSet = new Set();

async function inizializzaDatiMappa() {
    try {
        stazioniCache = await gameDao.getAllStazioni();
        tratteCache = await gameDao.getAllTratte();
        eventiCache = await gameDao.getAllEventi();
        stazioniIdsSet = new Set(stazioniCache.map(s => s.id));

        // Costruisco il grafo (lista di adiacenza) una volta all'avvio del server
        stazioniCache.forEach(s => grafoMappa[s.id] = []);
        tratteCache.forEach(t => {
            grafoMappa[t.stazione_partenza].push(t.stazione_arrivo);
            grafoMappa[t.stazione_arrivo].push(t.stazione_partenza);
        });
    } catch (err) {
        console.error("Errore critico durante il caricamento dei dati di gioco:", err);
        process.exit(1); // Se la mappa non si carica, il gioco non può funzionare: fermo il server.
    }
}


// login con Passport e strategia locale, con validazione degli input e gestione degli errori
passport.use(new LocalStrategy(
    { usernameField: 'user', passwordField: 'password' },
    async (username, password, done) => {
        try {
            const user = await userDao.getUserByUsername(username);
            if (!user) return done(null, false, { message: 'Username non trovato.' });

            // leggo l'hash dal database
            const passwordHex = Buffer.from(user.password, 'hex');

            // Uso scrypt per generare un hash della password inserita, usando il sale salvato
            crypto.scrypt(password, user.sale, passwordHex.length, (err, hashedPassword) => {
                if (err) return done(err);
                
                // se non sono uguali la password è errata, tramite timingSafeEqual si evita di esporre informazioni sui tempi di risposta che potrebbero aiutare un hacker
                if (!crypto.timingSafeEqual(passwordHex, hashedPassword)) {
                    return done(null, false, { message: 'Password errata.' });
                }
                
                return done(null, user); 
            });
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userDao.getUserById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Middleware per validazione input e controllo autenticazione
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 422: Il server capisce la richiesta, ma i dati non rispettano le regole
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    // 401: Non autorizzato, l'utente deve autenticarsi
    return res.status(401).json({ error: 'Devi fare login per accedere a questa risorsa' });
};

app.post('/api/auth/login', 
    [
        body('user').isString().notEmpty().withMessage('Username obbligatorio'),
        body('password').isString().notEmpty().withMessage('Password obbligatoria'),
        handleValidationErrors
    ], 
    (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) return next(err);
            // 401: Non autorizzato, se l'autenticazione fallisce per username o password errati
            if (!user) return res.status(401).json({ error: info.message });
            req.login(user, (err) => {
                if (err) return next(err);
                return res.json({ id: user.id, username: user.username, punteggio: user.punteggio });
            });
        })(req, res, next);
});

app.get('/api/auth/current', (req, res) => {
    if (req.isAuthenticated()) res.json(req.user);
    // 401: Non autorizzato, se l'utente non è autenticato
    else res.status(401).json({ error: 'Non autenticato' });
});

app.delete('/api/auth/logout', (req, res) => {
    req.logout((err) => {
        if(err) return res.status(500).json({error: "Errore nel logout"});
        // 500: Errore interno del server, se qualcosa va storto durante il logout
        res.json({ message: 'Logout effettuato' })
    });
});

// solo se l'utente è autenticato può accedere a queste rotte, altrimenti riceve un 401 Unauthorized
app.get('/api/rete', isLoggedIn, (req, res) => {
    res.json({ stazioni: stazioniCache, tratte: tratteCache });
});

// creazione della partita con stazione di partenza e arrivo casuali, ma sempre raggiungibili con almeno 3 stazioni intermedie
app.get('/api/partita/nuova', isLoggedIn, (req, res) => {
    try {


        const partenzaId = stazioniCache[Math.floor(Math.random() * stazioniCache.length)].id; //random inizio tra le stazioni
        const distanze = { [partenzaId]: 0 };
        const coda = [partenzaId];
        
        //tramite una BFS calcolo la distanza di ogni stazione da quella di partenza,
        // così da poter scegliere una stazione di arrivo che sia raggiungibile con almeno 3 stazioni intermedie
        while (coda.length > 0) {
            const corrente = coda.shift();
            const vicini = grafoMappa[corrente] || [];
            for (let vicino of vicini) {
                if (distanze[vicino] === undefined) {
                    distanze[vicino] = distanze[corrente] + 1;
                    coda.push(vicino);
                }
            }
        }

        // prendo solo le stazioni che hanno distanza almeno 3 da quella di partenza
        const stazioniValide = Object.keys(distanze).filter(id => distanze[id] >= 3); 
        const arrivoId = parseInt(stazioniValide[Math.floor(Math.random() * stazioniValide.length)]); //random stazione di arrivo

        //salvamo nella sessione la missione corrente, così da poterla verificare quando
        // il client invierà il percorso da validare alla fine della partita
        // salvo anche il timestamp di inizio partita, così da poter controllare il tempo nel backend
        req.session.missioneCorrente = { 
            partenza_id: partenzaId, 
            arrivo_id: arrivoId,
            timestamp_inizio: Date.now() 
        };
        res.json({ partenza_id: partenzaId, arrivo_id: arrivoId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/partita/esegui', isLoggedIn, 
    [
        body('percorso').isArray().withMessage('Il percorso deve essere un array'),
        body('percorso.*').isInt().withMessage('Gli ID devono essere numeri interi'),
        handleValidationErrors
    ], 
    async (req, res) => {
        try {
            const percorso = req.body.percorso; 
            const missione = req.session.missioneCorrente; // recupero la missione salvata in sessione al momento della creazione della partita

            // Controllo se l'utente ha richiesto una missione
            if (!missione) {
                return res.status(400).json({ error: "Nessuna missione in corso." });
            }
            const oraAttuale = Date.now();
            const tempoTrascorsoMs = oraAttuale - missione.timestamp_inizio;

            // Limite: 90 secondi + 0.1 secondi di tolleranza per il ritardo di rete, si può aumentare a 93000 se si è su vera rete (93000 ms totali)
            if (tempoTrascorsoMs > 93000) {
                req.session.missioneCorrente = null; // annullo la missione
                await userDao.updateUserScore(req.user.id, 0); // setto punteggio a 0 in caso di timeout
                return res.json({ 
                    valido: false, 
                    punteggio_finale: 0, 
                    cronistoria: [
                        { tappa: "Tempo Scaduto", evento: `Hai impiegato troppo tempo! (${Math.floor(tempoTrascorsoMs/1000)} secondi).`, variazione: "errore" }
                    ]
                });
            }

            if (percorso.length < 3) {
                req.session.missioneCorrente = null; // annullo la missione
                await userDao.updateUserScore(req.user.id, 0);
                return res.json({ 
                    valido: false, 
                    punteggio_finale: 0, 
                    cronistoria: [
                        { tappa: "Errore di Mappa", evento: "Il percorso è troppo corto. : " + percorso.length, variazione: "errore" }
                    ]
                });
            }
            
            // capire se ha senso implementarlo TODO
            // Se l'utente ha inviato l'array partendo dalla fine, il server lo ribalta in automatico 
            /*if (percorso[percorso.length - 1] === missione.partenza_id) {
                percorso.reverse();
            }*/

            // controllo se il percorso inizia e finisce con le stazioni corrette
            if (percorso[0] !== missione.partenza_id || percorso[percorso.length - 1] !== missione.arrivo_id) {
                req.session.missioneCorrente = null; // annullo la missione
                await userDao.updateUserScore(req.user.id, 0);
                return res.json({ 
                    valido: false, 
                    punteggio_finale: 0, 
                    cronistoria: [
                        { tappa: "Errore di Mappa", evento: "Non hai rispettato le stazioni di partenza o arrivo della missione.", variazione: "errore" }
                    ]
                });
            }
            
            // check su tutte le stazioni del percorso, se almeno una non esiste è un percorso non valido
            const tutteEsistono = percorso.every(idSelezionato => stazioniIdsSet.has(idSelezionato));
             
            if (!tutteEsistono) {
                req.session.missioneCorrente = null; // annullo la missione
                await userDao.updateUserScore(req.user.id, 0);
                return res.status(404).json({ 
                    error: "Una o più stazioni inserite nel percorso non esistono." 
                });
            }

            let percorsoValido = true;
            let lineaCorrente = null;
            let monete = 20;
            let cronistoria = [];
            // ciclo su ogni coppia di stazioni consecutive nel percorso per verificare che siano collegate da una tratta,
            // che rispettino le regole di cambio linea e per calcolare il punteggio totale applicando gli eventi casuali
            
            const tratteUsate = new Set(); // aggiungo un set per svolgere un controllo se la tratta è già stata usata in precedenza
            
            for (let i = 0; i < percorso.length - 1; i++) {
                const idA = percorso[i];
                const idB = percorso[i + 1];
                const stazioneCorrente = stazioniCache.find(s => s.id === idA);
                // trovo la prima tratta che collega le due stazioni A e B, in modo da poter verificare se sono collegate
                // e quale linea le collega
                const trattaScelta = tratteCache.find(t => 
                    (t.stazione_partenza === idA && t.stazione_arrivo === idB) || 
                    (t.stazione_partenza === idB && t.stazione_arrivo === idA)
                );
                // se non ho trovato alcuna tratta tra le due stazioni, il percorso non è valido
                if (!trattaScelta) {
                    percorsoValido = false; 
                    break;
                }

                // verifico se c'è cambio linea
                if (tratteUsate.has(trattaScelta.id)) {
                    percorsoValido = false; // L'utente sta passando due volte sulla stessa tratta
                    break;
                }
                tratteUsate.add(trattaScelta.id);


                if (lineaCorrente && lineaCorrente !== trattaScelta.nome_linea) {
                    if (stazioneCorrente.snodo !== 1) {
                        percorsoValido = false; 
                        break;
                    }
                }
                lineaCorrente = trattaScelta.nome_linea;
                // applico un evento casuale ad ogni tratta percorsa

                
                const eventoEstratto = eventiCache[Math.floor(Math.random() * eventiCache.length)];
                monete += eventoEstratto.effetto;
                // prendo i nomi delle stazioni per la cronistoria
                const nomeA = stazioniCache.find(s => s.id === idA).nome;
                const nomeB = stazioniCache.find(s => s.id === idB).nome;

                cronistoria.push({
                    tappa: `${nomeA} -> ${nomeB}`,
                    evento: eventoEstratto.descrizione,
                    variazione: eventoEstratto.effetto,
                    totale_parziale: monete
                });
            }

            if (!percorsoValido) {
                cronistoria = [];
                monete = 0;
            }
            if (monete < 0){
                monete = 0;
            }
            await userDao.updateUserScore(req.user.id, monete);

            // cleanup della missione corrente
            req.session.missioneCorrente = null;

            res.json({
                valido: percorsoValido,
                punteggio_finale: monete,
                cronistoria: cronistoria
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
});

// rotta per ottenere la classifica globale, ordinata per punteggio decrescente
app.get('/api/classifica', isLoggedIn, async (req, res) => {
    try {
        const classifica = await userDao.getLeaderboard();
        res.json(classifica);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// gestione rotte non trovate
app.use((req, res, next) => {
    res.status(404).json({ 
        error: `La rotta ${req.originalUrl} non esiste su questo server.` 
    });
});

// avvio del server, solo dopo aver inizializzato i dati della mappa, altrimenti il gioco non può funzionare
inizializzaDatiMappa().then(() => {
    app.listen(PORT, () => {
        console.log(`Server Express avviato e in ascolto sulla porta ${PORT}`);
    });
});