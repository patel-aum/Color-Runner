export type GameState = {
  position: number;
  color: string;
  speed: number;
  score: number;
  isGameOver: boolean;
  obstacles: Obstacle[];
  gameStarted: boolean;
};

export type Obstacle = {
  id: string;
  position: number;
  color: string;
};