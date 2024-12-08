import request from 'supertest';
import express from 'express';
import router from '../routes/notice.routes';
import NoticeController from '../controllers/NoticeController';

jest.mock('../controllers/NoticeController');

const app = express();
app.use(express.json());
app.use('/notice', router);

describe('Notice Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /notice', () => {
        it('should call NoticeController.createNotice', async () => {
            // Arrange
            NoticeController.createNotice.mockImplementation((req, res) => res.status(201).json({ message: 'Notice created successfully' }));

            // Act
            const response = await request(app).post('/notice').send({ title: 'Test Notice', description: 'This is a test notice' });

            // Assert
            expect(NoticeController.createNotice).toHaveBeenCalled();
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Notice created successfully');
        });
    });

    describe('GET /notice', () => {
        it('should call NoticeController.getAllNotices', async () => {
            // Arrange
            NoticeController.getAllNotices.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched all notices' }));

            // Act
            const response = await request(app).get('/notice');

            // Assert
            expect(NoticeController.getAllNotices).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched all notices');
        });
    });

    describe('GET /notice/search', () => {
        it('should call NoticeController.searchNotices', async () => {
            // Arrange
            NoticeController.searchNotices.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched search results' }));

            // Act
            const response = await request(app).get('/notice/search').query({ query: 'test' });

            // Assert
            expect(NoticeController.searchNotices).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched search results');
        });
    });

    describe('GET /notice/parcels', () => {
        it('should call NoticeController.getParcels', async () => {
            // Arrange
            NoticeController.getParcels.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched parcels' }));

            // Act
            const response = await request(app).get('/notice/parcels');

            // Assert
            expect(NoticeController.getParcels).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched parcels');
        });
    });

    describe('GET /notice/:id', () => {
        it('should call NoticeController.getNoticeById', async () => {
            // Arrange
            const noticeId = 1;
            NoticeController.getNoticeById.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched notice by ID' }));

            // Act
            const response = await request(app).get(`/notice/${noticeId}`);

            // Assert
            expect(NoticeController.getNoticeById).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched notice by ID');
        });
    });

    describe('PUT /notice/:id', () => {
        it('should call NoticeController.updateNotice', async () => {
            // Arrange
            const noticeId = 1;
            NoticeController.updateNotice.mockImplementation((req, res) => res.status(200).json({ message: 'Notice updated successfully' }));

            // Act
            const response = await request(app).put(`/notice/${noticeId}`).send({ title: 'Updated Notice', description: 'This is an updated notice' });

            // Assert
            expect(NoticeController.updateNotice).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Notice updated successfully');
        });
    });

    describe('DELETE /notice/:id', () => {
        it('should call NoticeController.deleteNotice', async () => {
            // Arrange
            const noticeId = 1;
            NoticeController.deleteNotice.mockImplementation((req, res) => res.status(200).json({ message: 'Notice deleted successfully' }));

            // Act
            const response = await request(app).delete(`/notice/${noticeId}`);

            // Assert
            expect(NoticeController.deleteNotice).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Notice deleted successfully');
        });
    });
});