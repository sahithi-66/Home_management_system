import request from 'supertest';
import express from 'express';
import NoticeController from '../controllers/NoticeController.js';
import NoticeService from '../services/NoticeService.js';

const app = express();
app.use(express.json());
app.use('/notices', NoticeController);

jest.mock('../services/NoticeService.js');

describe('NoticeController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a notice successfully', async () => {
        NoticeService.createNotice.mockResolvedValue(1);

        const response = await request(app)
            .post('/notices')
            .send({ title: 'Meeting', content: 'Important meeting tomorrow' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: 1, message: 'Notice created successfully' });
    });

    it('should get all notices', async () => {
        const notices = [{ id: 1, title: 'Meeting', content: 'Important meeting tomorrow' }];
        NoticeService.getAllNotices.mockResolvedValue(notices);

        const response = await request(app).get('/notices');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(notices);
    });

    it('should get notices filtered by parcel', async () => {
        const notices = [{ id: 1, title: 'Parcel arrival', content: 'Your parcel has arrived' }];
        NoticeService.getAllNotices.mockResolvedValue(notices);

        const response = await request(app).get('/notices?is_parcel=true');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(notices);
    });

    it('should get notice by id', async () => {
        const notice = { id: 1, title: 'Meeting', content: 'Important meeting tomorrow' };
        NoticeService.getNoticeById.mockResolvedValue(notice);

        const response = await request(app).get('/notices/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(notice);
    });

    it('should update a notice successfully', async () => {
        const notice = { id: 1, title: 'Updated Meeting', content: 'Updated content' };
        NoticeService.updateNotice.mockResolvedValue(notice);

        const response = await request(app)
            .put('/notices/1')
            .send({ title: 'Updated Meeting', content: 'Updated content' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ notice, message: 'Notice updated successfully' });
    });

    it('should delete a notice successfully', async () => {
        NoticeService.deleteNotice.mockResolvedValue();

        const response = await request(app).delete('/notices/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Notice deleted successfully' });
    });

    it('should get all parcels', async () => {
        const parcels = [{ id: 1, title: 'Parcel', content: 'Your parcel has arrived' }];
        NoticeService.getParcels.mockResolvedValue(parcels);

        const response = await request(app).get('/notices/parcels');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(parcels);
    });

    it('should search notices', async () => {
        const notices = [{ id: 1, title: 'Meeting', content: 'Important meeting tomorrow' }];
        NoticeService.searchNotices.mockResolvedValue(notices);

        const response = await request(app).get('/notices/search?term=meeting');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(notices);
    });

    it('should return 400 if search term is missing', async () => {
        const response = await request(app).get('/notices/search');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Search term is required' });
    });
});