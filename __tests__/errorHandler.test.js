import { errorHandler } from '../src/middleware/errorHandler';
import express from 'express';
import request from 'supertest';

const app = express();

app.get('/error', (req, res) => {
    throw new Error('Test Error');
});

app.get('/custom-error', (req, res, next) => {
    const err = new Error('Custom Error');
    err.status = 400;
    next(err);  // Fehler wird an die Middleware übergeben
});

app.use(errorHandler);

describe('Error Handler Middleware', () => {
    let server;

    beforeAll(() => {
        server = app.listen(3000);
    });

    afterAll(() => {
        server.close();
    });

    it('should handle errors and return 500', async () => {
        const response = await request(app).get('/error');

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should handle custom errors and return appropriate status', async () => {
        const response = await request(app).get('/custom-error');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Custom Error');
    });
});
