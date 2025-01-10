import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

const Game = lazy(() => import('./components/Game'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="min-h-screen bg-gray-900 overflow-hidden">
        <Game />
      </div>
    </Suspense>
  );
}

export default App;