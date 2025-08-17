from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class Player:
    name: str
    stack: int
    cards: List[str]
    is_active: bool = True
    is_all_in: bool = False
    current_bet: int = 0

@dataclass
class Action:
    player_name: str
    action_type: str  # fold, check, call, bet, raise, all_in
    amount: Optional[int] = None
    street: str = "preflop"  # preflop, flop, turn, river

@dataclass
class Hand:
    hand_id: str
    players: List[Player]
    community_cards: List[str]
    pot_amount: int
    current_street: str = "preflop"
    actions: List[Action] = None
    winner: Optional[Dict[str, Any]] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.actions is None:
            self.actions = []
        if self.created_at is None:
            self.created_at = datetime.now()

@dataclass
class GameState:
    players: List[Player]
    community_cards: List[str]
    pot_amount: int
    current_street: str
    current_player_index: int
    dealer_index: int
    small_blind_index: int
    big_blind_index: int
    min_bet: int
    last_raise_amount: int
    actions: List[Action]

@dataclass
class HandHistory:
    hand_id: str
    players: List[Player]
    community_cards: List[str]
    pot_amount: int
    winner: Dict[str, Any]
    created_at: datetime
