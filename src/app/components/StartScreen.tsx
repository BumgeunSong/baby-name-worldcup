'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { validateCandidateCount } from '@/lib/tournament';

interface StartScreenProps {
  candidateCount: number;
  onStart: () => void;
}

export function StartScreen({ candidateCount, onStart }: StartScreenProps) {
  const validation = validateCandidateCount(candidateCount);

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
          {validation.isValid
            ? '토너먼트를 시작할 준비가 되었습니다!'
            : `현재 ${candidateCount}개의 후보 (2, 4, 8, 16, 또는 32개 필요)`}
        </p>
        <div className="space-y-4">
          {validation.isValid ? (
            <Button onClick={onStart} size="lg" className="w-full">
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
