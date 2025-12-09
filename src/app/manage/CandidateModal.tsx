'use client';

import { useState, useEffect } from 'react';
import { Candidate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface CandidateModalProps {
  candidate: Candidate | null;
  onSave: (candidate: Candidate) => void;
  onClose: () => void;
}

export function CandidateModal({
  candidate,
  onSave,
  onClose,
}: CandidateModalProps) {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (candidate) {
      setName(candidate.name);
      setAuthor(candidate.author);
      setImageUrl(candidate.imageUrl || '');
      setReason(candidate.reason || '');
    } else {
      setName('');
      setAuthor('');
      setImageUrl('');
      setReason('');
    }
  }, [candidate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !author.trim()) {
      alert('이름과 작성자는 필수입니다.');
      return;
    }

    const savedCandidate: Candidate = {
      id: candidate?.id || crypto.randomUUID(),
      name: name.trim(),
      author: author.trim(),
      imageUrl: imageUrl.trim() || undefined,
      reason: reason.trim() || undefined,
    };

    onSave(savedCandidate);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{candidate ? '후보 수정' : '후보 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="후보 이름"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">작성자 *</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="작성자 이름"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">이미지 URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">추천이유</Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="이 이름을 추천하는 이유"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
