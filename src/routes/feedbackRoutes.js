import express from 'express';
import { addFeedback, getAllFeedback, deleteFeedbackByTitle } from '../controllers/feedbackController.js';
import { feedbackValidation } from '../middleware/validation.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

const feedbackRouter = express.Router();

// POST /feedback - fügt neues Feedback hinzu
feedbackRouter.post('/feedback', feedbackValidation, async (req, res) => {
    try {
        const { title, text } = req.body;
        const newFeedback = await addFeedback(title, text);
        sendSuccess(res, newFeedback, "Feedback erfolgreich gespeichert.", 201);
    } catch (error) {
        console.error("Fehler beim Speichern des Feedbacks:", error); // Logs Fehler für Debugging
        sendError(res, "Fehler beim Speichern des Feedbacks.", 500);  // Gibt spezifischen Fehlerstatus zurück
    }
});

// GET /feedback - gibt alle Feedback-Einträge zurück
feedbackRouter.get('/feedback', async (req, res) => {
    try {
        const feedback = await getAllFeedback();
        sendSuccess(res, feedback, "Feedback erfolgreich abgefragt.");
    } catch (error) {
        console.error("Fehler beim Abruf des Feedbacks:", error);  // Logs Fehler für Debugging
        sendError(res, "Fehler beim Abruf des Feedbacks.", 500);   // Gibt spezifischen Fehlerstatus zurück
    }
});

// DELETE /feedback/:title - Löscht Feedback mit dem gegebenen Titel
feedbackRouter.delete('/feedback/:title', async (req, res) => {
    try {
        const { title } = req.params;
        const result = await deleteFeedbackByTitle(title);
        if (result.rowCount === 0) {
            return sendError(res, "Feedback nicht gefunden.", 404);  // Gibt 404, falls Feedback nicht gefunden wurde
        }
        sendSuccess(res, null, "Feedback erfolgreich gelöscht.");
    } catch (error) {
        console.error("Fehler beim Löschen des Feedbacks:", error);  // Logs Fehler für Debugging
        sendError(res, "Fehler beim Löschen des Feedbacks.", 500);  // Gibt spezifischen Fehlerstatus zurück
    }
});

export default feedbackRouter;
