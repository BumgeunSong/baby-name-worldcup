import { Candidate, TournamentState } from '@/types';
import { seedCandidates } from '@/data/seedCandidates';

const CANDIDATES_KEY = 'candidates';
const TOURNAMENT_STATE_KEY = 'tournamentState';

export const storage = {
  getCandidates: (): Candidate[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CANDIDATES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // 데이터가 없으면 seed 데이터로 초기화
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(seedCandidates));
    return seedCandidates;
  },

  saveCandidates: (candidates: Candidate[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
  },

  getTournamentState: (): TournamentState | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(TOURNAMENT_STATE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveTournamentState: (state: TournamentState) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOURNAMENT_STATE_KEY, JSON.stringify(state));
  },

  clearTournamentState: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOURNAMENT_STATE_KEY);
  },
};
