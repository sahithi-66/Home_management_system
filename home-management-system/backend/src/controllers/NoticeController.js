// src/controllers/NoticeController.js
import NoticeService from '../services/NoticeService.js';

class NoticeController {
  async createNotice(req, res, next) {
    try {
      const noticeId = await NoticeService.createNotice(req.body);
      res.status(201).json({
        id: noticeId,
        message: 'Notice created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllNotices(req, res, next) {
    try {
      const { is_parcel } = req.query;
      const filters = {};
      
      if (is_parcel !== undefined) {
        filters.is_parcel = is_parcel === 'true';
      }
      
      const notices = await NoticeService.getAllNotices(filters);
      res.json(notices);
    } catch (error) {
      next(error);
    }
  }

  async getNoticeById(req, res, next) {
    try {
      const notice = await NoticeService.getNoticeById(req.params.id);
      res.json(notice);
    } catch (error) {
      next(error);
    }
  }

  async updateNotice(req, res, next) {
    try {
      const notice = await NoticeService.updateNotice(req.params.id, req.body);
      res.json({
        notice,
        message: 'Notice updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotice(req, res, next) {
    try {
      await NoticeService.deleteNotice(req.params.id);
      res.json({
        message: 'Notice deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getParcels(req, res, next) {
    try {
      const parcels = await NoticeService.getParcels();
      res.json(parcels);
    } catch (error) {
      next(error);
    }
  }

  async searchNotices(req, res, next) {
    try {
      const { term } = req.query;
      if (!term) {
        return res.status(400).json({
          message: 'Search term is required'
        });
      }
      
      const notices = await NoticeService.searchNotices(term);
      res.json(notices);
    } catch (error) {
      next(error);
    }
  }
}

export default new NoticeController();