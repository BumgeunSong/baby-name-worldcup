'use client';

import { useState, useEffect } from 'react';
import { Candidate, TournamentState } from '@/types';
import { storage } from '@/lib/storage';
import {
  initializeTournament,
  advanceToNextMatch,
  getRoundProgress,
  validateCandidateCount,
  ROUND_NAMES,
} from '@/lib/tournament';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StartScreen } from './components/StartScreen';
import { WinnerScreen } from './components/WinnerScreen';
import { CandidateCard } from './components/CandidateCard';
import { Leaderboard, getTop3WithTies } from './components/Leaderboard';

export default function Home() {
  const [state, setState] = useState<TournamentState | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  useEffect(() => {
    const savedCandidates = storage.getCandidates();
    setCandidates(savedCandidates);

    const savedState = storage.getTournamentState();
    if (savedState) {
      setState(savedState);
      if (
        savedState.currentRound === 'final' &&
        savedState.currentMatchIndex >= savedState.matches.length
      ) {
        setIsFinished(true);
      }
    }
  }, []);

  const startTournament = () => {
    const validation = validateCandidateCount(candidates.length);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    const newState = initializeTournament(candidates);
    setState(newState);
    storage.saveTournamentState(newState);
    setIsFinished(false);
  };

  const handleSelect = (winner: Candidate, loserId: string) => {
    if (!state || selectedWinner) return;

    setSelectedWinner(winner.id);

    setTimeout(() => {
      const newState = advanceToNextMatch(state, winner);
      setState(newState);
      storage.saveTournamentState(newState);
      setSelectedWinner(null);

      if (
        newState.currentRound === 'final' &&
        newState.currentMatchIndex >= newState.matches.length
      ) {
        setIsFinished(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 600);
  };

  const resetTournament = () => {
    setState(null);
    storage.clearTournamentState();
    setIsFinished(false);
  };

  if (!state) {
    return (
      <StartScreen
        candidateCount={candidates.length}
        onStart={startTournament}
      />
    );
  }

  if (isFinished) {
    return <WinnerScreen state={state} onReset={resetTournament} />;
  }

  const currentMatch = state.matches[state.currentMatchIndex];
  if (!currentMatch) {
    return null;
  }

  const top3 = getTop3WithTies(state.scores);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-6xl px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            {ROUND_NAMES[state.currentRound]} {getRoundProgress(state)}
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CandidateCard
            candidate={currentMatch.candidate1}
            onSelect={() =>
              handleSelect(currentMatch.candidate1, currentMatch.candidate2.id)
            }
            isWinner={selectedWinner === currentMatch.candidate1.id}
            isLoser={selectedWinner === currentMatch.candidate2.id}
            disabled={!!selectedWinner}
          />
          <CandidateCard
            candidate={currentMatch.candidate2}
            onSelect={() =>
              handleSelect(currentMatch.candidate2, currentMatch.candidate1.id)
            }
            isWinner={selectedWinner === currentMatch.candidate2.id}
            isLoser={selectedWinner === currentMatch.candidate1.id}
            disabled={!!selectedWinner}
          />
        </div>

        <Leaderboard entries={top3} />

        <div className="mt-12 flex justify-center gap-4">
          <Button variant="outline" onClick={resetTournament}>
            리셋
          </Button>
          <Button variant="outline" asChild>
            <Link href="/manage">후보 관리</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
