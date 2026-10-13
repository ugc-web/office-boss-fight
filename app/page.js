import { Suspense } from 'react';
import Game from '@/components/Game';

export default function Page() {
  return (
    <main className="min-h-[100dvh]">
      <Suspense fallback={null}>
        <Game />
      </Suspense>
    </main>
  );
}
