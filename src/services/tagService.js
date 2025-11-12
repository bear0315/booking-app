import { apiRequest } from './api';

export const tagService = {
  /**
   * Get all tags (Public)
   */
  getAllTags: async () => {
    return await apiRequest('/Tags');
  },

  /**
   * Get popular tags
   */
  getPopularTags: async (take = 20) => {
    return await apiRequest(`/Tags/popular?take=${take}`);
  },

  /**
   * Get tags with tours
   */
  getTagsWithTours: async (minTourCount = 1) => {
    return await apiRequest(`/Tags/with-tours?minTourCount=${minTourCount}`);
  },

  /**
   * Search tags
   */
  searchTags: async (keyword = null) => {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    return await apiRequest(`/Tags/search${params}`);
  },

  /**
   * Get tag dictionary (id -> name)
   */
  getTagDictionary: async () => {
    return await apiRequest('/Tags/dictionary');
  },

  /**
   * Get tag usage counts
   */
  getUsageCounts: async () => {
    return await apiRequest('/Tags/usage-counts');
  },

  /**
   * Get tag by ID
   */
  getTagById: async (id) => {
    return await apiRequest(`/Tags/${id}`);
  },

  /**
   * Get tag by slug
   */
  getTagBySlug: async (slug) => {
    return await apiRequest(`/Tags/slug/${slug}`);
  },

  /**
   * Create new tag (Admin, Manager)
   */
  createTag: async (tagData) => {
    return await apiRequest('/Tags', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  },

  /**
   * Update tag (Admin, Manager)
   */
  updateTag: async (id, tagData) => {
    return await apiRequest(`/Tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...tagData,
        id: id
      }),
    });
  },

  /**
   * Delete tag (Admin)
   */
  deleteTag: async (id) => {
    return await apiRequest(`/Tags/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Bulk create tags (Admin, Manager, Staff)
   */
  bulkCreateTags: async (tagNames) => {
    return await apiRequest('/Tags/bulk-create', {
      method: 'POST',
      body: JSON.stringify(tagNames),
    });
  },

  /**
   * Get or create tags by names
   */
  getOrCreateTags: async (tagNames) => {
    return await apiRequest('/Tags/bulk-create', {
      method: 'POST',
      body: JSON.stringify(tagNames),
    });
  }
};

export default tagService;