'use client';

import Image from 'next/image';
import { Candidate, TournamentState } from '@/types';
import { getLeaderboard } from '@/lib/tournament';
import { Button } from '@/components/ui/button';

interface WinnerScreenProps {
  state: TournamentState;
  onReset: () => void;
}

export function WinnerScreen({ state, onReset }: WinnerScreenProps) {
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

        <Button onClick={onReset} size="lg" className="w-full">
          다시하기
        </Button>
      </div>
    </div>
  );
}
