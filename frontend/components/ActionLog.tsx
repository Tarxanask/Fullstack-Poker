'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Action {
  player_name: string;
  action_type: string;
  amount?: number;
  street: string;
}

interface ActionLogProps {
  actions: Action[];
}

const ActionLog: React.FC<ActionLogProps> = ({ actions }) => {
  const formatAction = (action: Action): string => {
    const playerName = action.player_name;
    
    switch (action.action_type) {
      case 'fold':
        return `${playerName}: f`;
      case 'check':
        return `${playerName}: x`;
      case 'call':
        return `${playerName}: c`;
      case 'bet':
        return `${playerName}: b${action.amount}`;
      case 'raise':
        return `${playerName}: r${action.amount}`;
      case 'all_in':
        return `${playerName}: allin`;
      default:
        return `${playerName}: ${action.action_type}${action.amount ? ` ${action.amount}` : ''}`;
    }
  };

  const groupActionsByStreet = () => {
    const grouped: { [key: string]: Action[] } = {};
    
    actions.forEach(action => {
      if (!grouped[action.street]) {
        grouped[action.street] = [];
      }
      grouped[action.street].push(action);
    });
    
    return grouped;
  };

  const groupedActions = groupActionsByStreet();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Action Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {actions.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No actions yet
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedActions).map(([street, streetActions]) => (
                <div key={street} className="space-y-1">
                  <div className="text-sm font-semibold text-gray-700 uppercase">
                    {street}
                  </div>
                  {streetActions.map((action, index) => (
                    <div key={index} className="text-sm text-gray-600 pl-2">
                      {formatAction(action)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActionLog;
