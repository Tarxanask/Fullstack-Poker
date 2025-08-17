import pytest
from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

class TestGameAPI:
    """Test cases for the game API endpoints"""
    
    def test_start_hand_success(self):
        """Test starting a new hand with valid players"""
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000},
            {"name": "Charlie", "stack": 1000}
        ]
        
        response = client.post("/api/game/start-hand", json=players)
        
        assert response.status_code == 200
        data = response.json()
        assert "hand_id" in data
        assert "game_state" in data
        assert data["game_state"]["current_street"] == "preflop"
        assert len(data["game_state"]["players"]) == 3
    
    def test_start_hand_invalid_players(self):
        """Test starting a hand with invalid number of players"""
        # Too few players
        players = [{"name": "Alice", "stack": 1000}]
        response = client.post("/api/game/start-hand", json=players)
        assert response.status_code == 400
        
        # Too many players
        players = [
            {"name": f"Player{i}", "stack": 1000} 
            for i in range(7)
        ]
        response = client.post("/api/game/start-hand", json=players)
        assert response.status_code == 400
    
    def test_make_action_fold(self):
        """Test making a fold action"""
        # First start a hand
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000}
        ]
        start_response = client.post("/api/game/start-hand", json=players)
        assert start_response.status_code == 200
        
        # Make fold action
        action = {
            "player_index": 0,
            "action_type": "fold"
        }
        response = client.post("/api/game/action", json=action)
        
        assert response.status_code == 200
        data = response.json()
        assert data["game_state"]["players"][0]["is_active"] == False
    
    def test_make_action_bet(self):
        """Test making a bet action"""
        # First start a hand
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000}
        ]
        start_response = client.post("/api/game/start-hand", json=players)
        assert start_response.status_code == 200
        
        # Make bet action
        action = {
            "player_index": 0,
            "action_type": "bet",
            "amount": 100
        }
        response = client.post("/api/game/action", json=action)
        
        assert response.status_code == 200
        data = response.json()
        assert data["game_state"]["pot_amount"] > 0
    
    def test_make_action_invalid_player(self):
        """Test making action with invalid player index"""
        action = {
            "player_index": 999,
            "action_type": "fold"
        }
        response = client.post("/api/game/action", json=action)
        assert response.status_code == 400
    
    def test_deal_flop(self):
        """Test dealing the flop"""
        # First start a hand
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000}
        ]
        start_response = client.post("/api/game/start-hand", json=players)
        assert start_response.status_code == 200
        
        # Deal flop
        response = client.post("/api/game/deal-flop")
        
        assert response.status_code == 200
        data = response.json()
        assert data["game_state"]["current_street"] == "flop"
        assert len(data["community_cards"]) == 3
    
    def test_deal_turn(self):
        """Test dealing the turn"""
        # First start a hand and deal flop
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000}
        ]
        start_response = client.post("/api/game/start-hand", json=players)
        client.post("/api/game/deal-flop")
        
        # Deal turn
        response = client.post("/api/game/deal-turn")
        
        assert response.status_code == 200
        data = response.json()
        assert data["game_state"]["current_street"] == "turn"
        assert len(data["game_state"]["community_cards"]) == 4
    
    def test_deal_river(self):
        """Test dealing the river"""
        # First start a hand and deal flop and turn
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000}
        ]
        start_response = client.post("/api/game/start-hand", json=players)
        client.post("/api/game/deal-flop")
        client.post("/api/game/deal-turn")
        
        # Deal river
        response = client.post("/api/game/deal-river")
        
        assert response.status_code == 200
        data = response.json()
        assert data["game_state"]["current_street"] == "river"
        assert len(data["game_state"]["community_cards"]) == 5
    
    def test_complete_hand(self):
        """Test completing a hand"""
        # First start a hand and deal all community cards
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000}
        ]
        start_response = client.post("/api/game/start-hand", json=players)
        client.post("/api/game/deal-flop")
        client.post("/api/game/deal-turn")
        client.post("/api/game/deal-river")
        
        # Complete hand
        response = client.post("/api/game/complete-hand")
        
        assert response.status_code == 200
        data = response.json()
        assert "winner" in data
        assert "final_game_state" in data
    
    def test_get_current_state(self):
        """Test getting current game state"""
        response = client.get("/api/game/state")
        assert response.status_code == 200
        data = response.json()
        assert "players" in data
        assert "community_cards" in data
        assert "pot_amount" in data

class TestHandHistoryAPI:
    """Test cases for the hand history API endpoints"""
    
    def test_get_hand_history(self):
        """Test getting hand history"""
        response = client.get("/api/hands")
        assert response.status_code == 200
        data = response.json()
        assert "hands" in data
        assert isinstance(data["hands"], list)
    
    def test_get_hand_history_with_limit(self):
        """Test getting hand history with limit parameter"""
        response = client.get("/api/hands?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert "hands" in data
        assert len(data["hands"]) <= 5
    
    def test_get_hand_actions(self):
        """Test getting actions for a specific hand"""
        # First create a hand by completing one
        players = [
            {"name": "Alice", "stack": 1000},
            {"name": "Bob", "stack": 1000}
        ]
        start_response = client.post("/api/game/start-hand", json=players)
        hand_id = start_response.json()["hand_id"]
        
        # Complete the hand
        client.post("/api/game/deal-flop")
        client.post("/api/game/deal-turn")
        client.post("/api/game/deal-river")
        client.post("/api/game/complete-hand")
        
        # Get hand actions
        response = client.get(f"/api/hands/{hand_id}/actions")
        assert response.status_code == 200
        data = response.json()
        assert "actions" in data
        assert isinstance(data["actions"], list)

class TestRootEndpoint:
    """Test cases for the root endpoint"""
    
    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Poker Game API is running" in data["message"]

if __name__ == "__main__":
    pytest.main([__file__])
