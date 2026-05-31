// src/hooks/useTheme.js
// Centralized theme tokens — reads CSS variables from :root / body.light

import { useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';

/* ── color tokens (consumed by inline styles) ────────────────────────── */
const DARK = {
  bg1: '#0A0A0F', bg2: '#111118', bg3: '#18181F', bg4: '#222230', bg5: '#2A2A38',
  border:  'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#F4F4F8', text2: '#C0C0CC', text3: '#8888A0', text4: '#55556A',
};

const LIGHT = {
  bg1: '#F5F5F7', bg2: '#FFFFFF', bg3: '#F0F0F5', bg4: '#E8E8F0', bg5: '#DDDDE8',
  border:  'rgba(0,0,0,0.07)',
  border2: 'rgba(0,0,0,0.12)',
  text: '#0A0A0F', text2: '#333340', text3: '#666678', text4: '#AAAABC',
};

const COLORS = {
  orange:     '#FF6B00',
  orangeDim:  '#CC5500',
  orangeGlow: 'rgba(255,107,0,0.18)',
  green:      '#22C55E',
  greenDim:   '#16A34A',
  red:        '#EF4444',
  blue:       '#3B82F6',
  yellow:     '#F59E0B',
};

/* ── hook ─────────────────────────────────────────────────────────────── */
export function useTheme() {
  const { dark, toggleTheme } = useUIStore();
  const T = dark ? DARK : LIGHT;

  // Sync body class for global CSS variables
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('light', !dark);
  }

  /* Quick orange button style helper */
  const btnOrange = useCallback((extra = {}) => ({
    background: COLORS.orange,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'opacity .15s, transform .1s',
    ...extra,
  }), []);

  const btnGhost = useCallback((extra = {}) => ({
    background: T.bg4,
    color: T.text2,
    border: `1px solid ${T.border2}`,
    borderRadius: 10,
    fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    transition: 'background .15s',
    ...extra,
  }), [T]);

  return { T, C: COLORS, dark, toggleTheme, btnOrange, btnGhost };
}