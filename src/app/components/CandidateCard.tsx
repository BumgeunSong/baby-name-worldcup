'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Candidate } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface CandidateCardProps {
  candidate: Candidate;
  onSelect: () => void;
  isWinner?: boolean;
  isLoser?: boolean;
  disabled?: boolean;
}

export function CandidateCard({
  candidate,
  onSelect,
  isWinner,
  isLoser,
  disabled,
}: CandidateCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset loading state when candidate changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [candidate.id]);

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
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        {candidate.name}
      </h2>
      <p className="mb-2 text-sm text-muted-foreground">
        by {candidate.author}
      </p>
      {candidate.reason && (
        <p className="mb-4 text-sm text-muted-foreground">{candidate.reason}</p>
      )}
      {candidate.imageUrl && !imageError && (
        <div className="relative aspect-square w-[80%] mx-auto overflow-hidden rounded-lg bg-muted">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <Image
            src={candidate.imageUrl}
            alt={candidate.name}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            unoptimized
          />
        </div>
      )}
    </button>
  );
}
