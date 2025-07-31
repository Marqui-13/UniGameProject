import { create } from 'zustand';

type Level = 'easy' | 'medium' | 'hard';

interface GameState {
  time: number;
  level: Level;
  isGameStarted: boolean;
  lane: number;
  gameOver: boolean;
  obstacles: { id: number; position: [number, number, number] }[];
  leaderboard: { easy: any[]; medium: any[]; hard: any[] };
  setTime: (time: number) => void;
  setLevel: (level: Level) => void;
  setIsGameStarted: (isStarted: boolean) => void;
  setLane: (lane: number) => void;
  moveLane: (direction: 'left' | 'right') => void;
  setGameOver: (gameOver: boolean) => void;
  addObstacle: (obstacle: { id: number; position: [number, number, number] }) => void;
  updateObstacles: (obstacles: { id: number; position: [number, number, number] }[]) => void;
  setLeaderboard: (leaderboard: { easy: any[]; medium: any[]; hard: any[] }) => void;
  resetGame: () => void;
}

const useGameStore = create<GameState>((set) => ({
  time: 0,
  level: 'easy',
  isGameStarted: false,
  lane: 0,
  gameOver: false,
  obstacles: [],
  leaderboard: { easy: [], medium: [], hard: [] },
  setTime: (time) => set({ time }),
  setLevel: (level) => set({ level, isGameStarted: false, time: 0, obstacles: [], gameOver: false }),
  setIsGameStarted: (isGameStarted) => set({ isGameStarted, time: 0, obstacles: [], gameOver: false }),
  setLane: (lane) => set({ lane }),
  moveLane: (direction) =>
    set((state) => {
      console.log('Moving lane:', direction, 'Current lane:', state.lane);
      if (direction === 'left' && state.lane > -2) {
        return { lane: state.lane - 2 };
      } else if (direction === 'right' && state.lane < 2) {
        return { lane: state.lane + 2 };
      }
      return state;
    }),
  setGameOver: (gameOver) => set({ gameOver }),
  addObstacle: (obstacle) => set((state) => ({ obstacles: [...state.obstacles, obstacle] })),
  updateObstacles: (obstacles) => set({ obstacles }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  resetGame: () => set({ time: 0, isGameStarted: false, lane: 0, gameOver: false, obstacles: [] }),
}));

export default useGameStore;