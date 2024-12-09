// src/tests/Notice/noticemodel.test.js
import { jest } from '@jest/globals';
import Notice from '../../models/Notice.js';
import db from '../../config/database.js';
import { mockNotice, mockParcelNotice } from '../utils/notice-test-utils.js';
import { mockDbResponse } from '../utils/test-utils.js';

// Mock the database module
jest.mock('../../config/database.js', () => ({
  execute: jest.fn(),
  default: {
    execute: jest.fn()
  }
}));

describe('Notice Model', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the mock implementation
    db.execute.mockImplementation(() => Promise.resolve([[]]));
  });

  describe('create', () => {
    it('should create a new notice', async () => {
      const notice = mockNotice();
      db.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await Notice.create(notice);

      expect(result).toBe(1);
      expect(db.execute).toHaveBeenCalledWith(
        'INSERT INTO notices (title, content, author_id, is_parcel) VALUES (?, ?, ?, ?)',
        [notice.title, notice.content, notice.author_id, notice.is_parcel]
      );
    });

    it('should handle database errors', async () => {
      const notice = mockNotice();
      db.execute.mockRejectedValueOnce(new Error('Database error'));

      await expect(Notice.create(notice)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all notices', async () => {
      const mockNotices = [mockNotice(), mockNotice({ id: 2 })];
      db.execute.mockResolvedValueOnce([mockNotices]);

      const result = await Notice.findAll();

      expect(result).toEqual(mockNotices);
      expect(db.execute).toHaveBeenCalledWith(
        'SELECT * FROM notices ORDER BY created_at DESC',
        []
      );
    });

    it('should filter by is_parcel when provided', async () => {
      const mockParcelNotices = [mockParcelNotice()];
      db.execute.mockResolvedValueOnce([mockParcelNotices]);

      const result = await Notice.findAll({ is_parcel: true });

      expect(result).toEqual(mockParcelNotices);
      expect(db.execute).toHaveBeenCalledWith(
        'SELECT * FROM notices WHERE is_parcel = ? ORDER BY created_at DESC',
        [true]
      );
    });
  });

  describe('findById', () => {
    it('should find notice by id', async () => {
      const mockSingleNotice = mockNotice();
      db.execute.mockResolvedValueOnce([[mockSingleNotice]]);

      const result = await Notice.findById(1);

      expect(result).toEqual(mockSingleNotice);
      expect(db.execute).toHaveBeenCalledWith(
        'SELECT * FROM notices WHERE id = ?',
        [1]
      );
    });

    it('should return undefined for non-existent notice', async () => {
      db.execute.mockResolvedValueOnce([[]]);

      const result = await Notice.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update notice successfully', async () => {
      const updatedNotice = mockNotice({ title: 'Updated Title' });
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await Notice.update(1, updatedNotice);

      expect(result).toBe(true);
      expect(db.execute).toHaveBeenCalledWith(
        'UPDATE notices SET title = ?, content = ?, is_parcel = ? WHERE id = ?',
        [updatedNotice.title, updatedNotice.content, updatedNotice.is_parcel, 1]
      );
    });

    it('should return false if notice not found', async () => {
      db.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await Notice.update(999, mockNotice());

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete notice successfully', async () => {
      db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await Notice.delete(1);

      expect(result).toBe(true);
      expect(db.execute).toHaveBeenCalledWith(
        'DELETE FROM notices WHERE id = ?',
        [1]
      );
    });

    it('should return false if notice not found', async () => {
      db.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await Notice.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('findParcels', () => {
    it('should return all parcel notices', async () => {
      const mockParcels = [mockParcelNotice(), mockParcelNotice({ id: 2 })];
      db.execute.mockResolvedValueOnce([mockParcels]);

      const result = await Notice.findParcels();

      expect(result).toEqual(mockParcels);
      expect(db.execute).toHaveBeenCalledWith(
        'SELECT * FROM notices WHERE is_parcel = true ORDER BY created_at DESC'
      );
    });
  });

  describe('search', () => {
    it('should search notices by title and content', async () => {
      const searchResults = [mockNotice()];
      db.execute.mockResolvedValueOnce([searchResults]);

      const result = await Notice.search('test');

      expect(result).toEqual(searchResults);
      expect(db.execute).toHaveBeenCalledWith(
        'SELECT * FROM notices WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC',
        ['%test%', '%test%']
      );
    });
  });
});