export interface Player {
  name: string;
  stack: number;
  cards: string[];
  is_active: boolean;
  is_all_in: boolean;
  current_bet: number;
}

export interface Action {
  player_name: string;
  action_type: string;
  amount?: number;
  street: string;
}

export interface GameState {
  players: Player[];
  community_cards: string[];
  pot_amount: number;
  current_street: string;
  current_player_index: number;
  dealer_index: number;
  small_blind_index: number;
  big_blind_index: number;
  min_bet: number;
  last_raise_amount: number;
  actions: Action[];
}

export interface HandHistory {
  hand_id: string;
  players: Player[];
  community_cards: string[];
  pot_amount: number;
  winner: any;
  created_at: string;
}

export interface PlayerRequest {
  name: string;
  stack: number;
}

export interface ActionRequest {
  player_index: number;
  action_type: string;
  amount?: number;
}
