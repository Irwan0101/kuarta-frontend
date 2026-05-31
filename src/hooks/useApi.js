// src/hooks/useApi.js
import { useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE = import.meta.env.VITE_API_URL || '/api';

export function useApi() {
  const token = useAuthStore(s => s.token);

  const api = useCallback((method, endpoint, data, cfg = {}) => {
    return axios({
      method,
      url: `${BASE}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...cfg.headers,
      },
      ...cfg,
    }).then(r => r.data);
  }, [token]);

  const get    = (url, cfg)       => api('GET',    url, undefined, cfg);
  const post   = (url, body, cfg) => api('POST',   url, body, cfg);
  const put    = (url, body, cfg) => api('PUT',    url, body, cfg);
  const patch  = (url, body, cfg) => api('PATCH',  url, body, cfg);
  const del    = (url, cfg)       => api('DELETE', url, undefined, cfg);

  return { get, post, put, patch, del };
}