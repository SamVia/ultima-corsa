# L'Ultima Corsa - Exam #1

This repository contains the source code for "L'Ultima Corsa", a full-stack web application developed for Exam #1. The project features an interactive web-based game with a dynamic React frontend and a Node.js/Express backend using a SQLite database. For further documentation, check the [README.md](./esame1-ultima-corsa-SamVia-main/README.md).

## Repository Structure

```text
├── client/                 
│   ├── public/             
│   ├── src/                
│   │   ├── API.js          
│   │   ├── App.jsx         
│   │   ├── AuthContext.jsx 
│   │   ├── Classifica.jsx  
│   │   ├── Gioco.jsx       
│   │   ├── GiocoFacile.jsx 
│   │   ├── Homepage.jsx    
│   │   ├── Hub.jsx         
│   │   ├── Istruzioni.jsx  
│   │   ├── Login.jsx       
│   │   └── main.jsx        
│   └── vite.config.js      
├── server/                 
│   ├── database.db         
│   ├── db.js               
│   ├── dao-gioco.js        
│   ├── dao-user.js         
│   └── index.js            
└── img/                    

```

## Local Development Setup

1. **Initialize the Server:**
```bash
cd server
npm install
npm start

```


2. **Initialize the Client:** Open a new terminal session:
```bash
cd client
npm install
npm run dev

```



## Test Credentials

Use the following credentials to test the authentication and protected routes:

* **username:** mario | **password:** password
* **username:** luigi | **password:** password
* **username:** bowser | **password:** password
* **username:** peach | **password:** password