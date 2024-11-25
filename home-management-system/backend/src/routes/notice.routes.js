import express from 'express';
import NoticeController from '../controllers/NoticeController.js';

const router = express.Router();

// Regular notice board routes
router.post('/', NoticeController.createNotice);
router.get('/', NoticeController.getAllNotices);
router.get('/search', NoticeController.searchNotices);
router.get('/parcels', NoticeController.getParcels);
router.get('/:id', NoticeController.getNoticeById);
router.put('/:id', NoticeController.updateNotice);
router.delete('/:id', NoticeController.deleteNotice);

export default router;