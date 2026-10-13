import { Suspense } from 'react';
import Game from '@/components/Game';

export default function Page() {
  return (
    <main className="min-h-screen flex items-start sm:items-center justify-center p-3 sm:p-8">
      <Suspense fallback={null}>
        <Game />
      </Suspense>
    </main>
  );
}
