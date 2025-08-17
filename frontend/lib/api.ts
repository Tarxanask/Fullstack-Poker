import { PlayerRequest, ActionRequest, GameState, HandHistory } from '@/types/poker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function startHand(players: PlayerRequest[]): Promise<{ hand_id: string; game_state: GameState }> {
  console.log('API: startHand called with players:', players);
  console.log('API: Using base URL:', API_BASE_URL);
  
  const url = `${API_BASE_URL}/api/game/start-hand`;
  console.log('API: Making request to:', url);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(players),
  });

  console.log('API: Response status:', response.status);
  console.log('API: Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API: Error response:', errorText);
    throw new Error('Failed to start hand');
  }

  const result = await response.json();
  console.log('API: Success response:', result);
  return result;
}

export async function makeAction(action: ActionRequest): Promise<{ game_state: GameState }> {
  const response = await fetch(`${API_BASE_URL}/api/game/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action),
  });

  if (!response.ok) {
    throw new Error('Failed to make action');
  }

  return response.json();
}

export async function dealFlop(): Promise<{ community_cards: string[]; game_state: GameState }> {
  const response = await fetch(`${API_BASE_URL}/api/game/deal-flop`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to deal flop');
  }

  return response.json();
}

export async function dealTurn(): Promise<{ turn_card: string; game_state: GameState }> {
  const response = await fetch(`${API_BASE_URL}/api/game/deal-turn`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to deal turn');
  }

  return response.json();
}

export async function dealRiver(): Promise<{ river_card: string; game_state: GameState }> {
  const response = await fetch(`${API_BASE_URL}/api/game/deal-river`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to deal river');
  }

  return response.json();
}

export async function completeHand(): Promise<{ winner: any; final_game_state: GameState }> {
  const response = await fetch(`${API_BASE_URL}/api/game/complete-hand`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to complete hand');
  }

  return response.json();
}

export async function getCurrentState(): Promise<GameState> {
  const response = await fetch(`${API_BASE_URL}/api/game/state`);

  if (!response.ok) {
    throw new Error('Failed to get current state');
  }

  return response.json();
}

export async function getHandHistory(limit: number = 10): Promise<{ hands: HandHistory[] }> {
  const response = await fetch(`${API_BASE_URL}/api/hands?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to get hand history');
  }

  return response.json();
}
