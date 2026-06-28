import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/mobile|android|iphone|ipad/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

let sessionId = sessionStorage.getItem('_track_sid');
if (!sessionId) {
  sessionId = Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem('_track_sid', sessionId);
}

export function usePageTracker() {
  const location = useLocation();
  const last = useRef('');

  useEffect(() => {
    const page = location.pathname;
    if (page === last.current) return;
    last.current = page;

    axios.post(`${BASE}/analytics/track`, {
      page,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      deviceType: getDeviceType(),
      sessionId,
    }).catch(() => {});
  }, [location]);
}
