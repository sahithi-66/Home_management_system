// src/tests/__mocks__/NoticeController.js
export default {
    createNotice: jest.fn((req, res) => res.status(201).json({ 
      id: 1,
      message: 'Notice created successfully'
    })),
    getAllNotices: jest.fn((req, res) => res.json([])),
    getNoticeById: jest.fn((req, res) => res.json({})),
    updateNotice: jest.fn((req, res) => res.json({
      message: 'Notice updated successfully'
    })),
    deleteNotice: jest.fn((req, res) => res.json({
      message: 'Notice deleted successfully'
    })),
    getParcels: jest.fn((req, res) => res.json([])),
    searchNotices: jest.fn((req, res) => res.json([]))
  };