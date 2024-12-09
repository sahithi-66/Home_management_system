// src/tests/Notice/noticeController.test.js
import { jest } from '@jest/globals';
import NoticeController from '../../controllers/NoticeController.js';
import { mockNotice } from '../utils/notice-test-utils.js';

// Mock the entire NoticeService module
const mockNoticeService = {
  createNotice: jest.fn(),
  getAllNotices: jest.fn(),
  getNoticeById: jest.fn(),
  updateNotice: jest.fn(),
  deleteNotice: jest.fn(),
  getParcels: jest.fn(),
  searchNotices: jest.fn()
};

jest.mock('../../services/NoticeService.js', () => ({
  default: mockNoticeService
}));

describe('NoticeController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createNotice', () => {
    it('should create notice successfully', async () => {
      const newNotice = mockNotice();
      req.body = newNotice;
      mockNoticeService.createNotice.mockResolvedValue(1);

      await NoticeController.createNotice(req, res, next);

      expect(mockNoticeService.createNotice).toHaveBeenCalledWith(newNotice);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        message: 'Notice created successfully'
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Creation failed');
      mockNoticeService.createNotice.mockRejectedValue(error);

      await NoticeController.createNotice(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllNotices', () => {
    it('should return all notices', async () => {
      const mockNotices = [mockNotice(), mockNotice({ id: 2 })];
      mockNoticeService.getAllNotices.mockResolvedValue(mockNotices);

      await NoticeController.getAllNotices(req, res, next);

      expect(mockNoticeService.getAllNotices).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockNotices);
    });

    it('should handle parcel filter', async () => {
      req.query = { is_parcel: 'true' };
      const mockParcels = [mockNotice({ is_parcel: true })];
      mockNoticeService.getAllNotices.mockResolvedValue(mockParcels);

      await NoticeController.getAllNotices(req, res, next);

      expect(mockNoticeService.getAllNotices).toHaveBeenCalledWith({ is_parcel: true });
    });
  });

  describe('getNoticeById', () => {
    it('should return notice by id', async () => {
      const mockSingleNotice = mockNotice();
      req.params.id = '1';
      mockNoticeService.getNoticeById.mockResolvedValue(mockSingleNotice);

      await NoticeController.getNoticeById(req, res, next);

      expect(mockNoticeService.getNoticeById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockSingleNotice);
    });

    it('should handle not found error', async () => {
      req.params.id = '999';
      const error = new Error('Notice not found');
      mockNoticeService.getNoticeById.mockRejectedValue(error);

      await NoticeController.getNoticeById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateNotice', () => {
    it('should update notice successfully', async () => {
      const updatedNotice = mockNotice({ title: 'Updated Title' });
      req.params.id = '1';
      req.body = updatedNotice;
      mockNoticeService.updateNotice.mockResolvedValue(updatedNotice);

      await NoticeController.updateNotice(req, res, next);

      expect(mockNoticeService.updateNotice).toHaveBeenCalledWith('1', updatedNotice);
      expect(res.json).toHaveBeenCalledWith({
        notice: updatedNotice,
        message: 'Notice updated successfully'
      });
    });
  });

  describe('deleteNotice', () => {
    it('should delete notice successfully', async () => {
      req.params.id = '1';
      mockNoticeService.deleteNotice.mockResolvedValue(true);

      await NoticeController.deleteNotice(req, res, next);

      expect(mockNoticeService.deleteNotice).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Notice deleted successfully'
      });
    });
  });

  describe('getParcels', () => {
    it('should return parcel notices', async () => {
      const mockParcels = [mockNotice({ is_parcel: true })];
      mockNoticeService.getParcels.mockResolvedValue(mockParcels);

      await NoticeController.getParcels(req, res, next);

      expect(mockNoticeService.getParcels).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockParcels);
    });
  });

  describe('searchNotices', () => {
    it('should search notices successfully', async () => {
      req.query.term = 'test';
      const mockResults = [mockNotice()];
      mockNoticeService.searchNotices.mockResolvedValue(mockResults);

      await NoticeController.searchNotices(req, res, next);

      expect(mockNoticeService.searchNotices).toHaveBeenCalledWith('test');
      expect(res.json).toHaveBeenCalledWith(mockResults);
    });

    it('should validate search term', async () => {
      await NoticeController.searchNotices(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Search term is required'
      });
    });
  });
});