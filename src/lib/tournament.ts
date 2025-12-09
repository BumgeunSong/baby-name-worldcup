import { Candidate, Match, TournamentState } from '@/types';

export const ROUND_POINTS = {
  round32: 1,
  round16: 2,
  round8: 4,
  round4: 8,
  final: 16,
  winner: 32,
} as const;

export const ROUND_NAMES = {
  round32: '32강',
  round16: '16강',
  round8: '8강',
  round4: '4강',
  final: '결승',
} as const;

const VALID_CANDIDATE_COUNTS = [2, 4, 8, 16, 32];

export function validateCandidateCount(count: number): {
  isValid: boolean;
  message?: string;
} {
  if (VALID_CANDIDATE_COUNTS.includes(count)) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: `후보는 2, 4, 8, 16, 또는 32개여야 합니다. (현재: ${count}개)`,
  };
}

export function getStartingRound(
  candidateCount: number
): TournamentState['currentRound'] {
  switch (candidateCount) {
    case 2:
      return 'final';
    case 4:
      return 'round4';
    case 8:
      return 'round8';
    case 16:
      return 'round16';
    case 32:
      return 'round32';
    default:
      return 'round32';
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createMatches(candidates: Candidate[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < candidates.length; i += 2) {
    matches.push({
      candidate1: candidates[i],
      candidate2: candidates[i + 1],
    });
  }
  return matches;
}

export function initializeTournament(candidates: Candidate[]): TournamentState {
  const shuffled = shuffleArray(candidates);
  const matches = createMatches(shuffled);
  const startingRound = getStartingRound(candidates.length);

  return {
    currentRound: startingRound,
    currentMatchIndex: 0,
    matches,
    winners: [],
    scores: {},
  };
}

export function advanceToNextMatch(
  state: TournamentState,
  winner: Candidate
): TournamentState {
  const newWinners = [...state.winners, winner];
  const newScores = { ...state.scores };
  const currentPoints = ROUND_POINTS[state.currentRound];

  newScores[winner.author] = (newScores[winner.author] || 0) + currentPoints;

  const nextMatchIndex = state.currentMatchIndex + 1;

  if (nextMatchIndex >= state.matches.length) {
    if (state.currentRound === 'final') {
      newScores[winner.author] += ROUND_POINTS.winner;
      return {
        ...state,
        winners: newWinners,
        scores: newScores,
        currentMatchIndex: nextMatchIndex,
      };
    }

    const nextRound = getNextRound(state.currentRound);
    const nextMatches = createMatches(newWinners);

    return {
      currentRound: nextRound,
      currentMatchIndex: 0,
      matches: nextMatches,
      winners: [],
      scores: newScores,
    };
  }

  return {
    ...state,
    winners: newWinners,
    scores: newScores,
    currentMatchIndex: nextMatchIndex,
  };
}

function getNextRound(
  currentRound: TournamentState['currentRound']
): TournamentState['currentRound'] {
  const rounds: TournamentState['currentRound'][] = [
    'round32',
    'round16',
    'round8',
    'round4',
    'final',
  ];
  const currentIndex = rounds.indexOf(currentRound);
  return rounds[currentIndex + 1];
}

export function getRoundProgress(state: TournamentState): string {
  const total = state.matches.length;
  const current = state.currentMatchIndex + 1;
  return `${current}/${total}`;
}

export function getLeaderboard(scores: Record<string, number>): Array<{
  author: string;
  score: number;
}> {
  return Object.entries(scores)
    .map(([author, score]) => ({ author, score }))
    .sort((a, b) => b.score - a.score);
}
