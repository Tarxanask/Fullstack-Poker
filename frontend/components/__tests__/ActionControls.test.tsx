import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionControls from '../ActionControls';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, ...props }: any) => (
    <input value={value} onChange={onChange} {...props} />
  ),
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

const mockGameState = {
  current_player_index: 0,
  players: [
    {
      name: 'Alice',
      stack: 1000,
      cards: ['Ah', 'Kh'],
      is_active: true,
      is_all_in: false,
      current_bet: 0,
    },
    {
      name: 'Bob',
      stack: 1000,
      cards: ['Qh', 'Jh'],
      is_active: true,
      is_all_in: false,
      current_bet: 40,
    },
  ],
  current_street: 'preflop',
  min_bet: 40,
  last_raise_amount: 0,
  community_cards: [],
  pot_amount: 60,
  dealer_index: 0,
  small_blind_index: 1,
  big_blind_index: 2,
  actions: [],
};

const mockProps = {
  gameState: mockGameState,
  onAction: jest.fn(),
  onDealFlop: jest.fn(),
  onDealTurn: jest.fn(),
  onDealRiver: jest.fn(),
  onCompleteHand: jest.fn(),
};

describe('ActionControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders current player information', () => {
    render(<ActionControls {...mockProps} />);
    
    expect(screen.getByText('Current Player: Alice')).toBeInTheDocument();
    expect(screen.getByText('Stack: $1000 | Street: preflop')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<ActionControls {...mockProps} />);
    
    expect(screen.getByText('Fold')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
    expect(screen.getByText('Call $40')).toBeInTheDocument();
    expect(screen.getByText('All In')).toBeInTheDocument();
  });

  it('calls onAction when fold button is clicked', () => {
    render(<ActionControls {...mockProps} />);
    
    const foldButton = screen.getByText('Fold');
    fireEvent.click(foldButton);
    
    expect(mockProps.onAction).toHaveBeenCalledWith('fold');
  });

  it('calls onAction when all-in button is clicked', () => {
    render(<ActionControls {...mockProps} />);
    
    const allInButton = screen.getByText('All In');
    fireEvent.click(allInButton);
    
    expect(mockProps.onAction).toHaveBeenCalledWith('all_in', 1000);
  });

  it('disables check button when player cannot check', () => {
    render(<ActionControls {...mockProps} />);
    
    const checkButton = screen.getByText('Check');
    expect(checkButton).toBeDisabled();
  });

  it('enables check button when player can check', () => {
    const gameStateWithCheck = {
      ...mockGameState,
      players: [
        {
          name: 'Alice',
          stack: 1000,
          cards: ['Ah', 'Kh'],
          is_active: true,
          is_all_in: false,
          current_bet: 40,
        },
        {
          name: 'Bob',
          stack: 1000,
          cards: ['Qh', 'Jh'],
          is_active: true,
          is_all_in: false,
          current_bet: 40,
        },
      ],
    };

    render(<ActionControls {...mockProps} gameState={gameStateWithCheck} />);
    
    const checkButton = screen.getByText('Check');
    expect(checkButton).not.toBeDisabled();
  });

  it('renders bet and raise input fields', () => {
    render(<ActionControls {...mockProps} />);
    
    expect(screen.getByLabelText('Bet Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Raise Amount')).toBeInTheDocument();
    expect(screen.getByText('Bet')).toBeInTheDocument();
    expect(screen.getByText('Raise')).toBeInTheDocument();
  });

  it('calls onAction with bet amount when bet button is clicked', () => {
    render(<ActionControls {...mockProps} />);
    
    const betInput = screen.getByLabelText('Bet Amount');
    const betButton = screen.getByText('Bet');
    
    fireEvent.change(betInput, { target: { value: '100' } });
    fireEvent.click(betButton);
    
    expect(mockProps.onAction).toHaveBeenCalledWith('bet', 100);
  });

  it('renders game flow buttons', () => {
    render(<ActionControls {...mockProps} />);
    
    expect(screen.getByText('Deal Flop')).toBeInTheDocument();
    expect(screen.getByText('Deal Turn')).toBeInTheDocument();
    expect(screen.getByText('Deal River')).toBeInTheDocument();
    expect(screen.getByText('Complete Hand')).toBeInTheDocument();
  });

  it('calls onDealFlop when deal flop button is clicked', () => {
    render(<ActionControls {...mockProps} />);
    
    const dealFlopButton = screen.getByText('Deal Flop');
    fireEvent.click(dealFlopButton);
    
    expect(mockProps.onDealFlop).toHaveBeenCalled();
  });

  it('disables game flow buttons when not in correct street', () => {
    render(<ActionControls {...mockProps} />);
    
    const dealTurnButton = screen.getByText('Deal Turn');
    const dealRiverButton = screen.getByText('Deal River');
    const completeHandButton = screen.getByText('Complete Hand');
    
    expect(dealTurnButton).toBeDisabled();
    expect(dealRiverButton).toBeDisabled();
    expect(completeHandButton).toBeDisabled();
  });

  it('enables correct game flow button for current street', () => {
    const flopGameState = {
      ...mockGameState,
      current_street: 'flop',
    };

    render(<ActionControls {...mockProps} gameState={flopGameState} />);
    
    const dealTurnButton = screen.getByText('Deal Turn');
    expect(dealTurnButton).not.toBeDisabled();
  });

  it('disables action buttons for inactive player', () => {
    const inactiveGameState = {
      ...mockGameState,
      players: [
        {
          name: 'Alice',
          stack: 1000,
          cards: ['Ah', 'Kh'],
          is_active: false,
          is_all_in: false,
          current_bet: 0,
        },
        {
          name: 'Bob',
          stack: 1000,
          cards: ['Qh', 'Jh'],
          is_active: true,
          is_all_in: false,
          current_bet: 40,
        },
      ],
    };

    render(<ActionControls {...mockProps} gameState={inactiveGameState} />);
    
    const foldButton = screen.getByText('Fold');
    const allInButton = screen.getByText('All In');
    
    expect(foldButton).toBeDisabled();
    expect(allInButton).toBeDisabled();
  });

  it('disables action buttons for all-in player', () => {
    const allInGameState = {
      ...mockGameState,
      players: [
        {
          name: 'Alice',
          stack: 0,
          cards: ['Ah', 'Kh'],
          is_active: true,
          is_all_in: true,
          current_bet: 1000,
        },
        {
          name: 'Bob',
          stack: 1000,
          cards: ['Qh', 'Jh'],
          is_active: true,
          is_all_in: false,
          current_bet: 40,
        },
      ],
    };

    render(<ActionControls {...mockProps} gameState={allInGameState} />);
    
    const foldButton = screen.getByText('Fold');
    const allInButton = screen.getByText('All In');
    
    expect(foldButton).toBeDisabled();
    expect(allInButton).toBeDisabled();
  });
});
