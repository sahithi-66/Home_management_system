// src/services/NoticeService.js
import Notice from '../models/Notice.js';

class NoticeService {
  async createNotice(noticeData) {
    // Validate required fields
    if (!noticeData.title || !noticeData.content || !noticeData.author_id) {
      throw new Error('Title, content, and author_id are required');
    }
    
    return await Notice.create(noticeData);
  }

  async getAllNotices(filters) {
    return await Notice.findAll(filters);
  }

  async getNoticeById(id) {
    const notice = await Notice.findById(id);
    if (!notice) {
      throw new Error('Notice not found');
    }
    return notice;
  }

  async updateNotice(id, noticeData) {
    const notice = await Notice.findById(id);
    if (!notice) {
      throw new Error('Notice not found');
    }

    const success = await Notice.update(id, noticeData);
    if (!success) {
      throw new Error('Failed to update notice');
    }

    return await this.getNoticeById(id);
  }

  async deleteNotice(id) {
    const success = await Notice.delete(id);
    if (!success) {
      throw new Error('Notice not found');
    }
    return true;
  }

  async getParcels() {
    return await Notice.findParcels();
  }

  async searchNotices(searchTerm) {
    if (!searchTerm) {
      throw new Error('Search term is required');
    }
    return await Notice.search(searchTerm);
  }
}

export default new NoticeService();