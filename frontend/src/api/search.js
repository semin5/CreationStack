import axios from 'axios';
import qs from 'qs';
axios.defaults.withCredentials = true;

export const searchCreator = async params => {
  try {
    const response = await axios.get(`/api/creators`, {
      params,
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

export const searchContent = async params => {
  try {
    const response = await axios.get('/api/contents', {
      params,
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

export const searchUnified = async ({
  keyword = '',
  categories = [],
  accessType,
  searchMode,
  creatorId,
  sort = 'createdAt',
} = {}) => {
  try {
    const params = {
      keyword,
      sort,
    };

    if (categories.length > 0) {
      // 또는 axios가 배열로 자동 변환하게 하려면 그냥 `params.categories = categories`
      params.categories = categories;
    }

    if (accessType) params.accessType = accessType;
    if (searchMode) params.searchMode = searchMode;
    if (creatorId) params.creatorId = creatorId;

    const response = await axios.get('/api/search', {
      params,
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }), // 👉 categories=1&categories=2
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};
