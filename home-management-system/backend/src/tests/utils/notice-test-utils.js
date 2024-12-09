// src/tests/utils/notice-test-utils.js
import { mockDate } from './test-utils';

export const mockNotice = (overrides = {}) => ({
  id: 1,
  title: 'Test Notice',
  content: 'Test Content',
  author_id: 1,
  is_parcel: false,
  created_at: new Date('2024-01-01').toISOString(),
  ...overrides
});

export const mockParcelNotice = (overrides = {}) => ({
  ...mockNotice(),
  is_parcel: true,
  title: 'Parcel Notice',
  content: 'You have a parcel',
  ...overrides
});

export const setupNoticeTestDb = () => {
  return {
    notices: [
      mockNotice({ id: 1 }),
      mockNotice({ id: 2, title: 'Second Notice' }),
      mockParcelNotice({ id: 3 })
    ]
  };
};