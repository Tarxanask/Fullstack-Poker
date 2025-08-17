'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState } from '@/types/poker';

interface ActionControlsProps {
  gameState: GameState;
  onAction: (actionType: string, amount?: number) => void;
  onDealFlop: () => void;
  onDealTurn: () => void;
  onDealRiver: () => void;
  onCompleteHand: () => void;
}

const ActionControls: React.FC<ActionControlsProps> = ({
  gameState,
  onAction,
  onDealFlop,
  onDealTurn,
  onDealRiver,
  onCompleteHand
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [raiseAmount, setRaiseAmount] = useState('');
  
  const { current_player_index, players, current_street, min_bet } = gameState;
  const currentPlayer = players[current_player_index];
  
  const canCheck = () => {
    const maxBet = Math.max(...players.map(p => p.current_bet));
    return currentPlayer.current_bet >= maxBet;
  };
  
  const getCallAmount = () => {
    const maxBet = Math.max(...players.map(p => p.current_bet));
    return maxBet - currentPlayer.current_bet;
  };
  
  const getMinRaise = () => {
    const maxBet = Math.max(...players.map(p => p.current_bet));
    return maxBet + gameState.last_raise_amount;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Action Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Player Info */}
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-sm font-medium">
            Current Player: {currentPlayer?.name}
          </div>
          <div className="text-xs text-gray-600">
            Stack: ${currentPlayer?.stack} | Street: {current_street}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="destructive"
            onClick={() => onAction('fold')}
            disabled={!currentPlayer?.is_active || currentPlayer?.is_all_in}
          >
            Fold
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onAction('check')}
            disabled={!currentPlayer?.is_active || currentPlayer?.is_all_in || !canCheck()}
          >
            Check
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => onAction('call', getCallAmount())}
            disabled={!currentPlayer?.is_active || currentPlayer?.is_all_in || getCallAmount() === 0}
          >
            Call ${getCallAmount()}
          </Button>
          
          <Button
            variant="default"
            onClick={() => onAction('all_in', currentPlayer?.stack)}
            disabled={!currentPlayer?.is_active || currentPlayer?.is_all_in}
          >
            All In
          </Button>
        </div>

        {/* Bet Controls */}
        <div className="space-y-2">
          <Label htmlFor="bet-amount">Bet Amount</Label>
          <div className="flex gap-2">
            <Input
              id="bet-amount"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder={`Min: ${min_bet}`}
              min={min_bet}
              max={currentPlayer?.stack}
            />
            <Button
              onClick={() => onAction('bet', parseInt(betAmount))}
              disabled={!betAmount || parseInt(betAmount) < min_bet || parseInt(betAmount) > (currentPlayer?.stack || 0)}
            >
              Bet
            </Button>
          </div>
        </div>

        {/* Raise Controls */}
        <div className="space-y-2">
          <Label htmlFor="raise-amount">Raise Amount</Label>
          <div className="flex gap-2">
            <Input
              id="raise-amount"
              type="number"
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(e.target.value)}
              placeholder={`Min: ${getMinRaise()}`}
              min={getMinRaise()}
              max={currentPlayer?.stack}
            />
            <Button
              onClick={() => onAction('raise', parseInt(raiseAmount))}
              disabled={!raiseAmount || parseInt(raiseAmount) < getMinRaise() || parseInt(raiseAmount) > (currentPlayer?.stack || 0)}
            >
              Raise
            </Button>
          </div>
        </div>

        {/* Game Flow Controls */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Game Flow</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onDealFlop}
              disabled={current_street !== 'preflop'}
            >
              Deal Flop
            </Button>
            
            <Button
              variant="outline"
              onClick={onDealTurn}
              disabled={current_street !== 'flop'}
            >
              Deal Turn
            </Button>
            
            <Button
              variant="outline"
              onClick={onDealRiver}
              disabled={current_street !== 'turn'}
            >
              Deal River
            </Button>
            
            <Button
              variant="outline"
              onClick={onCompleteHand}
              disabled={current_street !== 'river'}
            >
              Complete Hand
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionControls;
