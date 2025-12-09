'use client';

import { useState, useEffect } from 'react';
import { Candidate } from '@/types';
import { storage } from '@/lib/storage';
import { validateCandidateCount } from '@/lib/tournament';
import { seedCandidates } from '@/data/seedCandidates';
import { CandidateModal } from './CandidateModal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ManagePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(
    null
  );

  useEffect(() => {
    setCandidates(storage.getCandidates());
  }, []);

  const handleSave = (candidate: Candidate) => {
    let updatedCandidates: Candidate[];

    if (editingCandidate) {
      updatedCandidates = candidates.map((c) =>
        c.id === candidate.id ? candidate : c
      );
    } else {
      updatedCandidates = [...candidates, candidate];
    }

    setCandidates(updatedCandidates);
    storage.saveCandidates(updatedCandidates);
    setIsModalOpen(false);
    setEditingCandidate(null);
  };

  const handleDelete = (id: string) => {
    const updatedCandidates = candidates.filter((c) => c.id !== id);
    setCandidates(updatedCandidates);
    storage.saveCandidates(updatedCandidates);
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCandidate(null);
    setIsModalOpen(true);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((line) => line.trim());

      const newCandidates: Candidate[] = lines.map((line) => {
        const [name, author, imageUrl, reason] = line
          .split(',')
          .map((s) => s.trim());

        return {
          id: crypto.randomUUID(),
          name,
          author,
          imageUrl: imageUrl || undefined,
          reason: reason || undefined,
        };
      });

      const updatedCandidates = [...candidates, ...newCandidates];
      setCandidates(updatedCandidates);
      storage.saveCandidates(updatedCandidates);
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSeedData = () => {
    if (
      candidates.length > 0 &&
      !confirm('기존 데이터가 있습니다. 샘플 데이터를 추가하시겠습니까?')
    ) {
      return;
    }

    const updatedCandidates = [...candidates, ...seedCandidates];
    setCandidates(updatedCandidates);
    storage.saveCandidates(updatedCandidates);
  };

  const validation = validateCandidateCount(candidates.length);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">후보 관리</h1>
            <p className="mt-2 text-muted-foreground">
              현재 {candidates.length}개의 후보 (2, 4, 8, 16, 또는 32개 필요)
            </p>
          </div>
          <Button asChild>
            <Link href="/">토너먼트로</Link>
          </Button>
        </div>

        {!validation.isValid && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive">
            {validation.message}
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <Button onClick={handleAdd}>후보 추가</Button>
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              CSV 업로드
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </Button>
          <Button variant="outline" onClick={handleLoadSeedData}>
            샘플 데이터 로드
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">이름</TableHead>
                <TableHead className="px-6">작성자</TableHead>
                <TableHead className="px-6">추천이유</TableHead>
                <TableHead className="px-6">이미지</TableHead>
                <TableHead className="px-6">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  className="cursor-pointer"
                  onClick={() => handleEdit(candidate)}
                >
                  <TableCell className="px-6 font-medium">
                    {candidate.name}
                  </TableCell>
                  <TableCell className="px-6 text-muted-foreground">
                    {candidate.author}
                  </TableCell>
                  <TableCell className="px-6 text-muted-foreground">
                    {candidate.reason || '-'}
                  </TableCell>
                  <TableCell className="px-6 text-muted-foreground">
                    {candidate.imageUrl ? '있음' : '-'}
                  </TableCell>
                  <TableCell className="px-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(candidate.id);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {candidates.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              후보를 추가해주세요
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CandidateModal
          candidate={editingCandidate}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCandidate(null);
          }}
        />
      )}
    </div>
  );
}
