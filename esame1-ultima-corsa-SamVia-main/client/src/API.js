const BASE_URL = 'http://localhost:3001/api';

async function handleResponse(response) {
    if (response.ok) {
        return await response.json();
    } else {
        const err = await response.json();
        throw new Error(err.error || err.errors?.[0]?.msg || 'Errore di rete');
    }
}

const logIn = async (credentials) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', //Manda il cookie al server
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

const getUserInfo = async () => {
    const response = await fetch(`${BASE_URL}/auth/current`, {
        credentials: 'include', // include il cookie nella richiesta
    });
    return handleResponse(response);
};

const logOut = async () => {
    const response = await fetch(`${BASE_URL}/auth/logout`, { 
        method: 'DELETE',
        credentials: 'include', 
    });
    return handleResponse(response);
};

// 2. GIOCO
const getMappa = async () => {
    const response = await fetch(`${BASE_URL}/rete`, { credentials: 'include' });
    return handleResponse(response);
};

const getNuovaPartita = async () => {
    const response = await fetch(`${BASE_URL}/partita/nuova`, { credentials: 'include' });
    return handleResponse(response);
};

const eseguiPartita = async (percorso) => {
    const response = await fetch(`${BASE_URL}/partita/esegui`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ percorso }),
    });
    return handleResponse(response);
};

const getClassifica = async () => {
    const response = await fetch(`${BASE_URL}/classifica`, { credentials: 'include' });
    return handleResponse(response);
};

const API = { logIn, getUserInfo, logOut, getMappa, getNuovaPartita, eseguiPartita, getClassifica };
export default API;