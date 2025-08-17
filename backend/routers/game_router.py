from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json

from models import Player, GameState
from game_logic import PokerGame
from repositories.hand_repository import HandRepository

router = APIRouter()

# Global game instance (in production, this should be managed properly)
poker_game = PokerGame()
hand_repository = HandRepository()

class PlayerRequest(BaseModel):
    name: str
    stack: int

class ActionRequest(BaseModel):
    player_index: int
    action_type: str
    amount: Optional[int] = None

class GameStateResponse(BaseModel):
    players: List[Dict[str, Any]]
    community_cards: List[str]
    pot_amount: int
    current_street: str
    current_player_index: int
    dealer_index: int
    small_blind_index: int
    big_blind_index: int
    min_bet: int
    last_raise_amount: int
    actions: List[Dict[str, Any]]

@router.post("/start-hand")
async def start_hand(players: List[PlayerRequest]):
    """Start a new hand with given players"""
    if len(players) < 2 or len(players) > 6:
        raise HTTPException(status_code=400, detail="Must have 2-6 players")
    
    # Convert to Player objects
    player_objects = []
    for player_req in players:
        player = Player(
            name=player_req.name,
            stack=player_req.stack,
            cards=[],
            is_active=True,
            is_all_in=False,
            current_bet=0
        )
        player_objects.append(player)
    
    # Start new hand
    hand_id = poker_game.start_new_hand(player_objects)
    
    return {
        "hand_id": hand_id,
        "message": "New hand started",
        "game_state": get_game_state_response(player_objects)
    }

@router.post("/action")
async def make_action(action: ActionRequest):
    """Make a player action"""
    # Get current players (this should be stored in a proper way)
    # For now, we'll use a simplified approach
    players = get_current_players()
    
    if action.player_index >= len(players):
        raise HTTPException(status_code=400, detail="Invalid player index")
    
    success = poker_game.make_action(players, action.player_index, action.action_type, action.amount or 0)
    
    if not success:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    return {
        "message": "Action successful",
        "game_state": get_game_state_response(players)
    }

@router.post("/deal-flop")
async def deal_flop():
    """Deal the flop"""
    players = get_current_players()
    community_cards = poker_game.deal_flop(players)
    
    return {
        "message": "Flop dealt",
        "community_cards": community_cards,
        "game_state": get_game_state_response(players)
    }

@router.post("/deal-turn")
async def deal_turn():
    """Deal the turn"""
    players = get_current_players()
    turn_card = poker_game.deal_turn(players)
    
    if not turn_card:
        raise HTTPException(status_code=400, detail="Cannot deal turn at this time")
    
    return {
        "message": "Turn dealt",
        "turn_card": turn_card,
        "game_state": get_game_state_response(players)
    }

@router.post("/deal-river")
async def deal_river():
    """Deal the river"""
    players = get_current_players()
    river_card = poker_game.deal_river(players)
    
    if not river_card:
        raise HTTPException(status_code=400, detail="Cannot deal river at this time")
    
    return {
        "message": "River dealt",
        "river_card": river_card,
        "game_state": get_game_state_response(players)
    }

@router.post("/complete-hand")
async def complete_hand():
    """Complete the current hand and determine winner"""
    players = get_current_players()
    
    # Evaluate winner
    winner_info = poker_game.evaluate_winner(players)
    
    # Save hand to database
    hand = create_hand_from_game_state(players, winner_info)
    hand_repository.save_hand(hand)
    
    return {
        "message": "Hand completed",
        "winner": winner_info,
        "final_game_state": get_game_state_response(players)
    }

@router.get("/state")
async def get_current_state():
    """Get current game state"""
    players = get_current_players()
    return get_game_state_response(players)

def get_current_players() -> List[Player]:
    """Get current players (simplified - in production this should be stored properly)"""
    # This is a simplified implementation
    # In a real application, you'd store this in a database or session
    return [
        Player("Alice", 1000, []),
        Player("Bob", 1000, []),
        Player("Charlie", 1000, []),
        Player("David", 1000, []),
        Player("Eve", 1000, []),
        Player("Frank", 1000, [])
    ]

def get_game_state_response(players: List[Player]) -> GameStateResponse:
    """Convert game state to response format"""
    return GameStateResponse(
        players=[{
            "name": p.name,
            "stack": p.stack,
            "cards": p.cards,
            "is_active": p.is_active,
            "is_all_in": p.is_all_in,
            "current_bet": p.current_bet
        } for p in players],
        community_cards=poker_game.community_cards,
        pot_amount=poker_game.pot,
        current_street=poker_game.current_street,
        current_player_index=poker_game.current_player_index,
        dealer_index=poker_game.dealer_index,
        small_blind_index=poker_game.small_blind_index,
        big_blind_index=poker_game.big_blind_index,
        min_bet=poker_game.min_bet,
        last_raise_amount=poker_game.last_raise_amount,
        actions=[{
            "player_name": a.player_name,
            "action_type": a.action_type,
            "amount": a.amount,
            "street": a.street
        } for a in poker_game.actions]
    )

def create_hand_from_game_state(players: List[Player], winner_info: Dict[str, Any]):
    """Create a Hand object from current game state"""
    from models import Hand
    import uuid
    
    return Hand(
        hand_id=str(uuid.uuid4()),
        players=players,
        community_cards=poker_game.community_cards,
        pot_amount=poker_game.pot,
        current_street=poker_game.current_street,
        actions=poker_game.actions,
        winner=winner_info
    )
