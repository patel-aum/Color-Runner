import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Square } from 'lucide-react';
import { GameState, Obstacle } from '../types';
import ReactConfetti from 'react-confetti';

const COLORS = ['#FF6B6B', '#4ECDC4'];
const INITIAL_SPEED = 0.6;
const SPEED_INCREMENT = 0.00001;
const PLAYER_SIZE = window.innerWidth < 768 ? 15 : 25; // Responsive size based on screen size
const OBSTACLE_WIDTH = window.innerWidth < 768 ? 20 : 35; // Responsive width based on screen size

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    position: 0,
    color: COLORS[0],
    speed: INITIAL_SPEED,
    score: 0,
    isGameOver: false,
    obstacles: [],
    gameStarted: false
  });
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  const gameLoop = useRef<number>();
  const lastTimestamp = useRef<number>();

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = Math.min(width * 0.6, window.innerHeight * 0.7); // More flexible ratio while maintaining proportion
      setDimensions({ width, height });
    }
  }, []);

  const generateObstacle = useCallback(() => {
    const obstacle: Obstacle = {
      id: Math.random().toString(),
      position: dimensions.width,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    return obstacle;
  }, [dimensions.width]);

  const handleInput = useCallback((event?: KeyboardEvent | TouchEvent) => {
    if (gameState.isGameOver) return;
    
    if (!gameState.gameStarted) {
      setGameState(prev => ({ ...prev, gameStarted: true }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      color: prev.color === COLORS[0] ? COLORS[1] : COLORS[0],
    }));
  }, [gameState.isGameOver, gameState.gameStarted]);

  const resetGame = useCallback(() => {
    setShowConfetti(false);
    setGameState({
      position: 0,
      color: COLORS[0],
      speed: INITIAL_SPEED,
      score: 0,
      isGameOver: false,
      obstacles: [generateObstacle()],
      gameStarted: false
    });
  }, [generateObstacle]);

  const updateGame = useCallback((timestamp: number) => {
    if (!lastTimestamp.current) {
      lastTimestamp.current = timestamp;
      gameLoop.current = requestAnimationFrame(updateGame);
      return;
    }

    const deltaTime = timestamp - lastTimestamp.current;
    lastTimestamp.current = timestamp;

    setGameState(prev => {
      if (!prev.gameStarted || prev.isGameOver) return prev;

      const newSpeed = prev.speed + SPEED_INCREMENT * deltaTime;
      const newObstacles = prev.obstacles
        .filter(obs => obs.position > -OBSTACLE_WIDTH)
        .map(obs => ({
          ...obs,
          position: obs.position - newSpeed * deltaTime,
        }));

      const playerRight = PLAYER_SIZE * 2;
      const collision = newObstacles.some(
        obs =>
          obs.position < playerRight &&
          obs.position + OBSTACLE_WIDTH > PLAYER_SIZE &&
          obs.color !== prev.color
      );

      if (collision) {
        const finalScore = Math.floor(prev.score);
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('highScore', finalScore.toString());
          setShowConfetti(true);
        }
        return { ...prev, isGameOver: true };
      }

      if (
        newObstacles.length === 0 ||
        newObstacles[newObstacles.length - 1].position < dimensions.width - 300
      ) {
        newObstacles.push(generateObstacle());
      }

      const newScore = prev.score + deltaTime * 0.01;

      return {
        ...prev,
        speed: newSpeed,
        obstacles: newObstacles,
        score: newScore,
      };
    });

    gameLoop.current = requestAnimationFrame(updateGame);
  }, [generateObstacle, dimensions.width, highScore]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('keydown', handleInput);
    window.addEventListener('touchstart', handleInput);
    gameLoop.current = requestAnimationFrame(updateGame);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('touchstart', handleInput);
      if (gameLoop.current) {
        cancelAnimationFrame(gameLoop.current);
      }
    };
  }, [handleInput, updateGame, updateDimensions]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-900 text-white p-2 sm:p-4 md:p-6 overflow-hidden" ref={containerRef}>
        {showConfetti && (
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
          />
        )}
      <div className="w-full max-w-5xl px-2 sm:px-4 md:px-6">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold">Color Runner</h1>
          <div className="text-right">
            <p className="text-base sm:text-lg md:text-xl">Score: {Math.floor(gameState.score)}</p>
            <p className="text-xs sm:text-sm md:text-lg text-gray-400">High Score: {highScore}</p>
          </div>
        </div>

        <div
          className="relative bg-gray-800 rounded-lg overflow-hidden mx-auto"
          style={{ width: '100%', height: dimensions.height }}
        >
          {!gameState.gameStarted && !gameState.isGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center p-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Welcome to Color Runner!</h2>
                <div className="space-y-2 text-sm md:text-base">
                  <p>🎮 Match your color with the obstacles</p>
                  <p>🔄 Press SPACE or tap screen to switch colors</p>
                  <p>⚡ Speed increases as you progress</p>
                  <p>🏆 Try to beat your high score!</p>
                </div>
                <button
                  className="mt-6 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setGameState(prev => ({ ...prev, gameStarted: true }))}
                >
                  Start Game
                </button>
              </div>
            </div>
          )}

          <div
            className="absolute transition-colors duration-200"
            style={{
              left: PLAYER_SIZE,
              top: dimensions.height / 2 - PLAYER_SIZE / 2,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            }}
          >
            <Square
              size={PLAYER_SIZE}
              fill={gameState.color}
              color={gameState.color}
            />
          </div>

          {gameState.obstacles.map(obstacle => (
            <div
              key={obstacle.id}
              className="absolute"
              style={{
                left: obstacle.position,
                top: 0,
                width: OBSTACLE_WIDTH,
                height: '100%',
                backgroundColor: obstacle.color,
              }}
            />
          ))}

          {gameState.isGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center p-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Game Over!</h2>
                <p className="text-lg md:text-xl mb-2">Final Score: {Math.floor(gameState.score)}</p>
                <p className="text-sm md:text-base text-gray-400 mb-4">
                  {Math.floor(gameState.score) > highScore ? '🎉 New High Score!' : `High Score: ${highScore}`}
                </p>
                <button
                  className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={resetGame}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm md:text-base">
            {gameState.gameStarted ? 'Press SPACE or tap screen to switch colors' : 'Get ready to match colors!'}
          </p>
        </div>
      </div>
    </div>
  );
}
