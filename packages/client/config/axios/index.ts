import { APIError } from '@ff-client/types/api';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

declare const Craft: {
  csrfTokenName: string;
  csrfTokenValue: string;
};

interface CraftGlobal {
  Craft: {
    csrfTokenName: string;
    csrfTokenValue: string;
  };
}

declare let global: CraftGlobal;

axios.defaults.baseURL = generateUrl('/');

if (axios.defaults.headers.get) {
  axios.defaults.headers.get['Accept'] = 'application/json';
}

if (axios.defaults.headers.post) {
  axios.defaults.headers.post['Accept'] = 'application/json';
}

// Inject the Craft CSRF token in all POST requests
axios.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    if (config.data === undefined) {
      config.data = {};
    }

    if (global.Craft !== undefined) {
      if (config.data instanceof FormData) {
        config.data.append(
          global.Craft.csrfTokenName,
          global.Craft.csrfTokenValue
        );
      } else {
        config.data[Craft.csrfTokenName] = Craft.csrfTokenValue;
      }
    }
  }

  return config;
});

axios.interceptors.response.use(null, (error) => {
  if (error.response?.data?.error) {
    error.message = error.response.data.error;
  }

  if (error.response?.data?.errors) {
    return Promise.reject(new APIError(error));
  }

  return Promise.reject(error);
});
