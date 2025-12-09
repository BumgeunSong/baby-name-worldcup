export interface Candidate {
  id: string;
  name: string;
  author: string;
  imageUrl?: string;
  reason?: string;
}

export interface Match {
  candidate1: Candidate;
  candidate2: Candidate;
}

export interface TournamentState {
  currentRound: 'round32' | 'round16' | 'round8' | 'round4' | 'final';
  currentMatchIndex: number;
  matches: Match[];
  winners: Candidate[];
  scores: Record<string, number>;
}
