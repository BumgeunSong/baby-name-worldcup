'use client';

import { useState, useEffect } from 'react';
import { Candidate, TournamentState } from '@/types';
import { storage } from '@/lib/storage';
import {
  initializeTournament,
  advanceToNextMatch,
  getRoundProgress,
  getLeaderboard,
  validateCandidateCount,
  ROUND_NAMES,
} from '@/lib/tournament';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

    // 애니메이션 후 다음 매치로 이동
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md rounded-xl bg-card p-8 text-center shadow-lg border border-border">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            박희수-오승훈
            <br />
            아기 이름 이상형 월드컵
          </h1>
          <p className="mb-4 text-sm text-muted-foreground">
            by (구)Teens Team
          </p>
          <p className="mb-8 text-muted-foreground">
            {validateCandidateCount(candidates.length).isValid
              ? '토너먼트를 시작할 준비가 되었습니다!'
              : `현재 ${candidates.length}개의 후보 (2, 4, 8, 16, 또는 32개 필요)`}
          </p>
          <div className="space-y-4">
            {validateCandidateCount(candidates.length).isValid ? (
              <Button onClick={startTournament} size="lg" className="w-full">
                시작하기
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link href="/manage">후보 관리하기</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const leaderboard = getLeaderboard(state.scores);
    const winner = state.winners[state.winners.length - 1];

    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-2xl px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-foreground">우승!</h1>
            <p className="text-muted-foreground">토너먼트가 종료되었습니다</p>
          </div>

          <div className="mb-8 rounded-xl bg-card p-8 text-center shadow-lg border border-border">
            <div className="mb-4">
              {winner.imageUrl && (
                <div className="relative mx-auto mb-4 h-48 w-48 overflow-hidden rounded-xl">
                  <Image
                    src={winner.imageUrl}
                    alt={winner.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <h2 className="mb-2 text-3xl font-bold text-foreground">
                {winner.name}
              </h2>
              <p className="text-muted-foreground">by {winner.author}</p>
              {winner.reason && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {winner.reason}
                </p>
              )}
            </div>
          </div>

          <div className="mb-8 rounded-xl bg-card p-8 shadow-lg border border-border">
            <h3 className="mb-4 text-xl font-bold text-foreground">
              작성자 리더보드
            </h3>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.author}
                  className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">
                      {entry.author}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">
                    {entry.score}점
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={resetTournament} size="lg" className="w-full">
            다시하기
          </Button>
        </div>
      </div>
    );
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

        {top3.length > 0 && (
          <div className="mt-16 mx-auto max-w-md">
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-20">순위</TableHead>
                    <TableHead>제안자</TableHead>
                    <TableHead className="text-right w-20">점수</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top3.map((entry) => (
                    <TableRow key={entry.rank}>
                      <TableCell className="text-center font-medium">
                        {entry.isTied ? `공동 ${entry.rank}위` : `${entry.rank}위`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.authors}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {entry.score}점
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

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

interface CandidateCardProps {
  candidate: Candidate;
  onSelect: () => void;
  isWinner?: boolean;
  isLoser?: boolean;
  disabled?: boolean;
}

function CandidateCard({
  candidate,
  onSelect,
  isWinner,
  isLoser,
  disabled,
}: CandidateCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`group rounded-xl bg-card p-8 shadow-lg border transition-all duration-300 text-left
        ${isWinner ? 'border-primary scale-105 shadow-xl ring-4 ring-primary/30' : ''}
        ${isLoser ? 'opacity-40 scale-95 grayscale' : ''}
        ${!isWinner && !isLoser ? 'border-border hover:shadow-xl hover:scale-[1.02] hover:border-primary' : ''}
        ${disabled && !isWinner && !isLoser ? 'pointer-events-none' : ''}
      `}
    >
      {candidate.imageUrl && (
        <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={candidate.imageUrl}
            alt={candidate.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        {candidate.name}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        by {candidate.author}
      </p>
      {candidate.reason && (
        <p className="text-sm text-muted-foreground">{candidate.reason}</p>
      )}
    </button>
  );
}

function getTop3WithTies(
  scores: Record<string, number>
): Array<{ rank: number; authors: string; score: number; isTied: boolean }> {
  if (Object.keys(scores).length === 0) return [];

  const leaderboard = Object.entries(scores)
    .map(([author, score]) => ({ author, score }))
    .sort((a, b) => b.score - a.score);

  const result: Array<{
    rank: number;
    authors: string;
    score: number;
    isTied: boolean;
  }> = [];

  let currentRank = 1;
  let i = 0;

  while (i < leaderboard.length && currentRank <= 3) {
    const currentScore = leaderboard[i].score;
    const authorsWithSameScore: string[] = [];

    while (i < leaderboard.length && leaderboard[i].score === currentScore) {
      authorsWithSameScore.push(leaderboard[i].author);
      i++;
    }

    result.push({
      rank: currentRank,
      authors: authorsWithSameScore.join(', '),
      score: currentScore,
      isTied: authorsWithSameScore.length > 1,
    });

    currentRank++;
  }

  return result.slice(0, 3);
}
