import axios from 'axios';

import { generateUrl } from '@ff-client/utils/urls';

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
  if (['post', 'patch', 'delete'].includes(config.method) && config.data) {
    if (global.Craft !== undefined) {
      config.data[Craft.csrfTokenName] = Craft.csrfTokenValue;
    }
  }

  return config;
});
