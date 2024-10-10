import express from 'express';
import cors from 'cors';
import feedbackRouter from './routes/feedbackRoutes.js';
import { createTable } from './db.js';

// Erstelle die Express-App
const app = express();
const PORT = process.env.PORT || 3000; // PORT aus Umgebungsvariablen nutzen oder Standard auf 3000

// Setup CORS
app.use(cors());
// Middleware für JSON-Parsing
app.use(express.json());

// Erstelle die Feedback-Tabelle
createTable();

// Routen verwenden
app.use('/', feedbackRouter);

// Starte die App
const server = app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

// Für Tests exportieren
export default server;
