import json
from typing import List, Optional
from database import get_db_connection
from models import Hand, Action, HandHistory, Player
from datetime import datetime

class HandRepository:
    def __init__(self):
        pass
    
    def save_hand(self, hand: Hand) -> bool:
        """Save completed hand to database"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Convert players to JSON
            players_json = []
            for player in hand.players:
                player_dict = {
                    "name": player.name,
                    "stack": player.stack,
                    "cards": player.cards,
                    "is_active": player.is_active,
                    "is_all_in": player.is_all_in,
                    "current_bet": player.current_bet
                }
                players_json.append(player_dict)
            
            # Insert hand
            cursor.execute("""
                INSERT INTO hands (hand_id, players, community_cards, pot_amount, winner)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (hand_id) DO NOTHING
            """, (
                hand.hand_id,
                json.dumps(players_json),
                json.dumps(hand.community_cards),
                hand.pot_amount,
                json.dumps(hand.winner) if hand.winner else None
            ))
            
            # Insert actions
            for action in hand.actions:
                cursor.execute("""
                    INSERT INTO actions (hand_id, player_name, action_type, amount, street)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    hand.hand_id,
                    action.player_name,
                    action.action_type,
                    action.amount,
                    action.street
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error saving hand: {e}")
            return False
    
    def get_hand_history(self, limit: int = 10) -> List[HandHistory]:
        """Get recent hand history"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT hand_id, players, community_cards, pot_amount, winner, created_at
                FROM hands
                ORDER BY created_at DESC
                LIMIT %s
            """, (limit,))
            
            hands = []
            for row in cursor.fetchall():
                hand_id, players_json, community_cards_json, pot_amount, winner_json, created_at = row
                
                # Parse JSON data
                players_data = json.loads(players_json)
                players = [Player(**player_data) for player_data in players_data]
                community_cards = json.loads(community_cards_json)
                winner = json.loads(winner_json) if winner_json else {}
                
                hand = HandHistory(
                    hand_id=hand_id,
                    players=players,
                    community_cards=community_cards,
                    pot_amount=pot_amount,
                    winner=winner,
                    created_at=created_at
                )
                hands.append(hand)
            
            cursor.close()
            conn.close()
            return hands
            
        except Exception as e:
            print(f"Error getting hand history: {e}")
            return []
    
    def get_hand_actions(self, hand_id: str) -> List[Action]:
        """Get actions for a specific hand"""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT player_name, action_type, amount, street, created_at
                FROM actions
                WHERE hand_id = %s
                ORDER BY created_at ASC
            """, (hand_id,))
            
            actions = []
            for row in cursor.fetchall():
                player_name, action_type, amount, street, created_at = row
                action = Action(
                    player_name=player_name,
                    action_type=action_type,
                    amount=amount,
                    street=street
                )
                actions.append(action)
            
            cursor.close()
            conn.close()
            return actions
            
        except Exception as e:
            print(f"Error getting hand actions: {e}")
            return []
