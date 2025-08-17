'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PokerTable from '@/components/PokerTable';
import ActionControls from '@/components/ActionControls';
import ActionLog from '@/components/ActionLog';
import HandHistoryComponent from '@/components/HandHistory';
import { GameState, HandHistory, PlayerRequest } from '@/types/poker';
import * as api from '@/lib/api';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [handHistory, setHandHistory] = useState<HandHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerStacks, setPlayerStacks] = useState<{ [key: string]: number }>({
    'Alice': 1000,
    'Bob': 1000,
    'Charlie': 1000,
    'David': 1000,
    'Eve': 1000,
    'Frank': 1000
  });

  // Load hand history on component mount
  useEffect(() => {
    loadHandHistory();
  }, []);

  const loadHandHistory = async () => {
    try {
      const response = await api.getHandHistory();
      setHandHistory(response.hands);
    } catch (err) {
      console.error('Failed to load hand history:', err);
    }
  };

  const startNewHand = async () => {
    console.log('startNewHand function called');
    setLoading(true);
    setError(null);
    
    try {
      const players: PlayerRequest[] = Object.entries(playerStacks).map(([name, stack]) => ({
        name,
        stack
      }));
      
      console.log('Sending players data:', players);
      const response = await api.startHand(players);
      console.log('API response:', response);
      setGameState(response.game_state);
    } catch (err) {
      console.error('Error in startNewHand:', err);
      setError('Failed to start new hand');
    } finally {
      setLoading(false);
    }
  };

  const makeAction = async (actionType: string, amount?: number) => {
    if (!gameState) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.makeAction({
        player_index: gameState.current_player_index,
        action_type: actionType,
        amount
      });
      setGameState(response.game_state);
    } catch (err) {
      setError('Failed to make action');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dealFlop = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.dealFlop();
      setGameState(response.game_state);
    } catch (err) {
      setError('Failed to deal flop');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dealTurn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.dealTurn();
      setGameState(response.game_state);
    } catch (err) {
      setError('Failed to deal turn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dealRiver = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.dealRiver();
      setGameState(response.game_state);
    } catch (err) {
      setError('Failed to deal river');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completeHand = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.completeHand();
      setGameState(response.final_game_state);
      await loadHandHistory(); // Reload hand history
    } catch (err) {
      setError('Failed to complete hand');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerStack = (playerName: string, stack: number) => {
    setPlayerStacks(prev => ({
      ...prev,
      [playerName]: stack
    }));
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-3xl">Texas Hold'em Poker Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                Set up player stacks and start a new hand
              </div>
              
              {/* Player Stack Configuration */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(playerStacks).map(([name, stack]) => (
                  <div key={name} className="space-y-2">
                    <Label htmlFor={name}>{name}</Label>
                    <Input
                      id={name}
                      type="number"
                      value={stack}
                      onChange={(e) => updatePlayerStack(name, parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={startNewHand} 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? 'Starting...' : 'Start New Hand'}
                </Button>
              </div>
              
              {error && (
                <div className="text-center text-red-600">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Texas Hold'em Poker Game</h1>
          {error && (
            <div className="text-red-600 mt-2">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Game Controls */}
          <div className="space-y-6">
            <ActionControls
              gameState={gameState}
              onAction={makeAction}
              onDealFlop={dealFlop}
              onDealTurn={dealTurn}
              onDealRiver={dealRiver}
              onCompleteHand={completeHand}
            />
            
            <ActionLog actions={gameState.actions} />
          </div>

          {/* Center Column - Poker Table */}
          <div className="flex items-center justify-center">
            <PokerTable
              gameState={gameState}
              onPlayerAction={makeAction}
            />
          </div>

          {/* Right Column - Hand History */}
          <div>
            <HandHistoryComponent hands={handHistory} />
          </div>
        </div>

        {/* New Hand Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={startNewHand} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Starting...' : 'Start New Hand'}
          </Button>
        </div>
      </div>
    </div>
  );
}
