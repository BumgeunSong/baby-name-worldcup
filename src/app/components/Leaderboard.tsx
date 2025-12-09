'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeaderboardEntry {
  rank: number;
  authors: string;
  score: number;
  isTied: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) return null;

  return (
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
            {entries.map((entry) => (
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
  );
}

export function getTop3WithTies(
  scores: Record<string, number>
): LeaderboardEntry[] {
  if (Object.keys(scores).length === 0) return [];

  const leaderboard = Object.entries(scores)
    .map(([author, score]) => ({ author, score }))
    .sort((a, b) => b.score - a.score);

  const result: LeaderboardEntry[] = [];

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
