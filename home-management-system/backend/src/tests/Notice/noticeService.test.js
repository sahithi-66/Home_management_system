// src/tests/Notice/noticeService.test.js
import NoticeService from '../../services/NoticeService.js';
import Notice from '../../models/Notice.js';
import { mockNotice } from '../utils/notice-test-utils.js';

jest.mock('../../models/Notice.js');

describe('NoticeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotice', () => {
    const validNoticeData = mockNotice();

    it('should create notice when all fields are provided', async () => {
      Notice.create.mockResolvedValue(1);

      const result = await NoticeService.createNotice(validNoticeData);

      expect(result).toBe(1);
      expect(Notice.create).toHaveBeenCalledWith(validNoticeData);
    });

    it('should throw error when title is missing', async () => {
      const invalidData = { ...validNoticeData, title: '' };

      await expect(NoticeService.createNotice(invalidData))
        .rejects
        .toThrow('Title, content, and author_id are required');
    });

    it('should throw error when content is missing', async () => {
      const invalidData = { ...validNoticeData, content: '' };

      await expect(NoticeService.createNotice(invalidData))
        .rejects
        .toThrow('Title, content, and author_id are required');
    });
  });

  describe('getAllNotices', () => {
    it('should return all notices with filters', async () => {
      const mockNotices = [mockNotice(), mockNotice({ id: 2 })];
      Notice.findAll.mockResolvedValue(mockNotices);

      const result = await NoticeService.getAllNotices({ is_parcel: true });

      expect(result).toEqual(mockNotices);
      expect(Notice.findAll).toHaveBeenCalledWith({ is_parcel: true });
    });
  });

  describe('getNoticeById', () => {
    it('should return notice by id', async () => {
      const mockSingleNotice = mockNotice();
      Notice.findById.mockResolvedValue(mockSingleNotice);

      const result = await NoticeService.getNoticeById(1);

      expect(result).toEqual(mockSingleNotice);
    });

    it('should throw error if notice not found', async () => {
      Notice.findById.mockResolvedValue(null);

      await expect(NoticeService.getNoticeById(999))
        .rejects
        .toThrow('Notice not found');
    });
  });

  describe('updateNotice', () => {
    const updateData = { title: 'Updated Title', content: 'Updated Content' };

    it('should update notice successfully', async () => {
      Notice.findById.mockResolvedValue(mockNotice());
      Notice.update.mockResolvedValue(true);
      Notice.findById.mockResolvedValue({ ...mockNotice(), ...updateData });

      const result = await NoticeService.updateNotice(1, updateData);

      expect(result).toEqual(expect.objectContaining(updateData));
    });

    it('should throw error if notice not found', async () => {
      Notice.findById.mockResolvedValue(null);

      await expect(NoticeService.updateNotice(999, updateData))
        .rejects
        .toThrow('Notice not found');
    });

    it('should throw error if update fails', async () => {
      Notice.findById.mockResolvedValue(mockNotice());
      Notice.update.mockResolvedValue(false);

      await expect(NoticeService.updateNotice(1, updateData))
        .rejects
        .toThrow('Failed to update notice');
    });
  });

  describe('deleteNotice', () => {
    it('should delete notice successfully', async () => {
      Notice.delete.mockResolvedValue(true);

      const result = await NoticeService.deleteNotice(1);

      expect(result).toBe(true);
    });

    it('should throw error if notice not found', async () => {
      Notice.delete.mockResolvedValue(false);

      await expect(NoticeService.deleteNotice(999))
        .rejects
        .toThrow('Notice not found');
    });
  });

  describe('getParcels', () => {
    it('should return all parcel notices', async () => {
      const mockParcels = [mockNotice({ is_parcel: true })];
      Notice.findParcels.mockResolvedValue(mockParcels);

      const result = await NoticeService.getParcels();

      expect(result).toEqual(mockParcels);
    });
  });

  describe('searchNotices', () => {
    it('should search notices with valid term', async () => {
      const mockResults = [mockNotice()];
      Notice.search.mockResolvedValue(mockResults);

      const result = await NoticeService.searchNotices('test');

      expect(result).toEqual(mockResults);
    });

    it('should throw error if search term is empty', async () => {
      await expect(NoticeService.searchNotices(''))
        .rejects
        .toThrow('Search term is required');
    });
  });
});