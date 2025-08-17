'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HandHistoryProps {
  hands: Array<{
    hand_id: string;
    players: Array<{
      name: string;
      stack: number;
      cards: string[];
      is_active: boolean;
      is_all_in: boolean;
      current_bet: number;
    }>;
    community_cards: string[];
    pot_amount: number;
    winner: {
      winner?: string;
      winners?: string[];
      amount: number;
      reason: string;
      hand_rank?: string;
    };
    created_at: string;
  }>;
}

const HandHistory: React.FC<HandHistoryProps> = ({ hands }) => {
  const formatActionSequence = (actions: any[]): string => {
    if (!actions || actions.length === 0) return '';
    
    return actions.map(action => {
      switch (action.action_type) {
        case 'fold':
          return 'f';
        case 'check':
          return 'x';
        case 'call':
          return 'c';
        case 'bet':
          return `b${action.amount}`;
        case 'raise':
          return `r${action.amount}`;
        case 'all_in':
          return 'allin';
        default:
          return action.action_type;
      }
    }).join(' ');
  };

  const formatCards = (cards: string[]): string => {
    return cards.join(' ');
  };

  const formatStackSetting = (players: any[]): string => {
    return players.map(p => `${p.name}:$${p.stack}`).join(' ');
  };

  const formatWinnings = (winner: any, players: any[]): string => {
    if (winner.winners) {
      // Split pot
      return winner.winners.map(w => `${w}:+${winner.amount}`).join(' ');
    } else if (winner.winner) {
      // Single winner
      const winnerPlayer = players.find(p => p.name === winner.winner);
      const otherPlayers = players.filter(p => p.name !== winner.winner);
      
      const result = [`${winner.winner}:+${winner.amount}`];
      otherPlayers.forEach(p => {
        result.push(`${p.name}:-${p.current_bet}`);
      });
      
      return result.join(' ');
    }
    return '';
  };

  const getPositionInfo = (players: any[], dealerIndex: number): string => {
    const positions = [];
    positions.push(`D:${players[dealerIndex]?.name || 'Unknown'}`);
    positions.push(`SB:${players[(dealerIndex + 1) % players.length]?.name || 'Unknown'}`);
    positions.push(`BB:${players[(dealerIndex + 2) % players.length]?.name || 'Unknown'}`);
    return positions.join(' ');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hand History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {hands.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No completed hands yet
            </div>
          ) : (
            <div className="space-y-4">
              {hands.map((hand, index) => (
                <div key={hand.hand_id} className="border rounded p-3 space-y-2">
                  {/* Hand UUID */}
                  <div className="text-xs font-mono text-gray-600">
                    {hand.hand_id}
                  </div>
                  
                  {/* Stack setting and positions */}
                  <div className="text-sm">
                    <span className="font-semibold">Stacks:</span> {formatStackSetting(hand.players)}
                  </div>
                  
                  {/* Player cards */}
                  <div className="text-sm">
                    <span className="font-semibold">Cards:</span>
                    {hand.players.map(player => (
                      <div key={player.name} className="ml-2 text-xs">
                        {player.name}: {formatCards(player.cards)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Community cards if any */}
                  {hand.community_cards && hand.community_cards.length > 0 && (
                    <div className="text-sm">
                      <span className="font-semibold">Board:</span> {formatCards(hand.community_cards)}
                    </div>
                  )}
                  
                  {/* Action sequence */}
                  <div className="text-sm">
                    <span className="font-semibold">Actions:</span> {formatActionSequence(hand.actions || [])}
                  </div>
                  
                  {/* Winnings */}
                  <div className="text-sm">
                    <span className="font-semibold">Result:</span> {formatWinnings(hand.winner, hand.players)}
                  </div>
                  
                  {/* Hand rank if available */}
                  {hand.winner.hand_rank && (
                    <div className="text-xs text-gray-600">
                      {hand.winner.hand_rank}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500">
                    {new Date(hand.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default HandHistory;
