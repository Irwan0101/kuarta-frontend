// src/store/tryoutStore.js
import { create } from 'zustand';

export const useTryoutStore = create((set, get) => ({
  /* Session */
  sessionId:   null,
  tryoutId:    null,
  questions:   [],
  answers:     {},     // { questionId: answerId }
  flagged:     {},     // { questionId: true }
  currentIdx:  0,
  startedAt:   null,
  duration:    0,      // seconds
  finished:    false,
  result:      null,

  /* Actions */
  startSession: (data) => set({
    sessionId:  data.sessionId,
    tryoutId:   data.tryoutId,
    questions:  data.questions,
    answers:    {},
    flagged:    {},
    currentIdx: 0,
    startedAt:  Date.now(),
    duration:   data.duration * 60,
    finished:   false,
    result:     null,
  }),

  setAnswer: (questionId, answerId) =>
    set(s => ({ answers: { ...s.answers, [questionId]: answerId } })),

  toggleFlag: (questionId) =>
    set(s => ({
      flagged: { ...s.flagged, [questionId]: !s.flagged[questionId] }
    })),

  setCurrentIdx: (idx) => set({ currentIdx: idx }),

  finishSession: (result) => set({ finished: true, result }),

  reset: () => set({
    sessionId: null, tryoutId: null, questions: [],
    answers: {}, flagged: {}, currentIdx: 0,
    startedAt: null, duration: 0, finished: false, result: null,
  }),

  /* Selectors */
  get answeredCount() { return Object.keys(get().answers).length; },
  get flaggedCount()  { return Object.values(get().flagged).filter(Boolean).length; },
}));