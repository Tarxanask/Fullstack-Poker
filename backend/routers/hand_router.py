from fastapi import APIRouter, HTTPException
from typing import List, Optional
from repositories.hand_repository import HandRepository

router = APIRouter()
hand_repository = HandRepository()

@router.get("/")
async def get_hand_history(limit: int = 10):
    """Get recent hand history"""
    hands = hand_repository.get_hand_history(limit)
    
    return {
        "hands": [
            {
                "hand_id": hand.hand_id,
                "players": [
                    {
                        "name": p.name,
                        "stack": p.stack,
                        "cards": p.cards,
                        "is_active": p.is_active,
                        "is_all_in": p.is_all_in,
                        "current_bet": p.current_bet
                    } for p in hand.players
                ],
                "community_cards": hand.community_cards,
                "pot_amount": hand.pot_amount,
                "winner": hand.winner,
                "created_at": hand.created_at.isoformat()
            } for hand in hands
        ]
    }

@router.get("/{hand_id}")
async def get_hand_details(hand_id: str):
    """Get details of a specific hand"""
    actions = hand_repository.get_hand_actions(hand_id)
    
    return {
        "hand_id": hand_id,
        "actions": [
            {
                "player_name": action.player_name,
                "action_type": action.action_type,
                "amount": action.amount,
                "street": action.street
            } for action in actions
        ]
    }

@router.get("/{hand_id}/actions")
async def get_hand_actions(hand_id: str):
    """Get all actions for a specific hand"""
    actions = hand_repository.get_hand_actions(hand_id)
    
    return {
        "hand_id": hand_id,
        "actions": [
            {
                "player_name": action.player_name,
                "action_type": action.action_type,
                "amount": action.amount,
                "street": action.street
            } for action in actions
        ]
    }
