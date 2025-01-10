import { render, fireEvent, act } from '@testing-library/react';
import Game from './Game';
import '@testing-library/jest-dom';

// Mock window.requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((callback) => {
  return window.setTimeout(() => callback(Date.now()), 0);
});

const mockCancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

describe('Game Component', () => {
  beforeAll(() => {
    window.requestAnimationFrame = mockRequestAnimationFrame;
    window.cancelAnimationFrame = mockCancelAnimationFrame;
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('renders initial game state correctly', () => {
    const { getByText } = render(<Game />);
    
    expect(getByText('Welcome to Color Runner!')).toBeInTheDocument();
    expect(getByText('Score: 0')).toBeInTheDocument();
    expect(getByText('High Score: 0')).toBeInTheDocument();
  });

  test('starts game when start button is clicked', () => {
    const { getByText, queryByText } = render(<Game />);
    
    const startButton = getByText('Start Game');
    fireEvent.click(startButton);
    
    expect(queryByText('Welcome to Color Runner!')).not.toBeInTheDocument();
    expect(getByText('Press SPACE or tap screen to switch colors')).toBeInTheDocument();
  });

  test('switches player color on space key press', () => {
    const { container } = render(<Game />);
    
    // Start the game
    const startButton = container.querySelector('button');
    fireEvent.click(startButton!);
    
    const initialColor = container.querySelector('svg')?.getAttribute('fill');
    
    // Simulate spacebar press
    fireEvent.keyDown(window, { key: 'Space' });
    
    const newColor = container.querySelector('svg')?.getAttribute('fill');
    expect(newColor).not.toBe(initialColor);
  });

  test('loads high score from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('100');
    
    const { getByText } = render(<Game />);
    
    expect(getByText('High Score: 100')).toBeInTheDocument();
  });

  test('handles game over state', () => {
    const { getByText } = render(<Game />);
    
    // Start the game
    fireEvent.click(getByText('Start Game'));
    
    // Force game over by modifying game state
    act(() => {
      // Simulate collision by moving obstacle to player position
      const timestamp = Date.now();
      mockRequestAnimationFrame.mock.calls[0][0](timestamp);
    });
    
    // Check if game over screen appears
    expect(getByText('Game Over!')).toBeInTheDocument();
    expect(getByText('Play Again')).toBeInTheDocument();
  });

  test('resets game state when Play Again is clicked', () => {
    const { getByText } = render(<Game />);
    
    // Start game and force game over
    fireEvent.click(getByText('Start Game'));
    act(() => {
      const timestamp = Date.now();
      mockRequestAnimationFrame.mock.calls[0][0](timestamp);
    });
    
    // Click Play Again
    fireEvent.click(getByText('Play Again'));
    
    // Check if back to initial state
    expect(getByText('Welcome to Color Runner!')).toBeInTheDocument();
    expect(getByText('Score: 0')).toBeInTheDocument();
  });

  test('updates high score when beating previous record', () => {
    mockLocalStorage.getItem.mockReturnValue('50');
    
    const { getByText } = render(<Game />);
    
    // Start game and force game over with high score
    fireEvent.click(getByText('Start Game'));
    act(() => {
      const timestamp = Date.now();
      mockRequestAnimationFrame.mock.calls[0][0](timestamp);
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });
});