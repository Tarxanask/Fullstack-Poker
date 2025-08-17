'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Player, GameState } from '@/types/poker';

interface PokerTableProps {
  gameState: GameState;
  onPlayerAction: (playerIndex: number, actionType: string, amount?: number) => void;
}

const PokerTable: React.FC<PokerTableProps> = ({ gameState, onPlayerAction }) => {
  const { players, community_cards, pot_amount, current_street, current_player_index } = gameState;

  const getPlayerPosition = (index: number) => {
    const positions = [
      'bottom-center', // 0 - dealer
      'bottom-left',   // 1 - small blind
      'top-left',      // 2 - big blind
      'top-center',    // 3
      'top-right',     // 4
      'bottom-right'   // 5
    ];
    return positions[index] || 'bottom-center';
  };

  const getPositionClasses = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'bottom-center': 'absolute bottom-1 left-1/2 transform -translate-x-1/2',
      'bottom-left': 'absolute bottom-1 left-1',
      'top-left': 'absolute top-1 left-1',
      'top-center': 'absolute top-1 left-1/2 transform -translate-x-1/2',
      'top-right': 'absolute top-1 right-1',
      'bottom-right': 'absolute bottom-1 right-1'
    };
    return positionMap[position] || '';
  };

  const renderCard = (card: string) => {
    const suit = card.slice(-1);
    const rank = card.slice(0, -1);
    
    const suitSymbols: { [key: string]: string } = {
      'h': '♥',
      'd': '♦',
      'c': '♣',
      's': '♠'
    };
    
    const color = suit === 'h' || suit === 'd' ? 'text-red-600' : 'text-black';
    
    return (
      <div className={`inline-block w-6 h-8 border border-gray-300 rounded bg-white text-center leading-[2rem] text-xs font-bold ${color}`}>
        {rank}{suitSymbols[suit]}
      </div>
    );
  };

  return (
    <div className="relative w-full h-96 bg-green-800 rounded-full border-8 border-brown-600">
      {/* Community Cards */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-center">
          <div className="text-white text-sm mb-2">{current_street.toUpperCase()}</div>
          <div className="flex gap-1 justify-center">
            {community_cards.map((card, index) => (
              <div key={index}>
                {renderCard(card)}
              </div>
            ))}
          </div>
          <div className="text-white text-lg font-bold mt-2">Pot: ${pot_amount}</div>
        </div>
      </div>

      {/* Players */}
      {players.map((player, index) => (
        <div key={index} className={getPositionClasses(getPlayerPosition(index))}>
          <Card className={`w-32 ${current_player_index === index ? 'ring-2 ring-yellow-400' : ''}`}>
            <CardContent className="p-2">
              <div className="text-center">
                <div className="font-bold text-xs">{player.name}</div>
                <div className="text-xs text-gray-600">Stack: ${player.stack}</div>
                {player.current_bet > 0 && (
                  <div className="text-xs text-blue-600">Bet: ${player.current_bet}</div>
                )}
                {player.is_all_in && (
                  <div className="text-xs text-red-600 font-bold">ALL IN</div>
                )}
                {!player.is_active && (
                  <div className="text-xs text-gray-500">FOLDED</div>
                )}
                {player.cards.length > 0 && (
                  <div className="flex gap-1 justify-center mt-1">
                    {player.cards.map((card, cardIndex) => (
                      <div key={cardIndex}>
                        {renderCard(card)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default PokerTable;
