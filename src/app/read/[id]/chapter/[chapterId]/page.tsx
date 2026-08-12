import { Suspense } from 'react';
import ChapterContent from './ChapterContent';

export default function ChapterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChapterContent />
    </Suspense>
  );
}