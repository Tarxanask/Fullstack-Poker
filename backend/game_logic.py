import random
import uuid
from typing import List, Dict, Any, Optional, Tuple
from models import Player, Action, Hand, GameState
from pokerkit import Card, Hand as PokerHand, NoLimitTexasHoldem, Automation

class CustomDeck:
    """Custom deck implementation to avoid pokerkit Deck issues"""
    def __init__(self):
        self.cards = []
        self._create_deck()
        self.shuffle()
    
    def _create_deck(self):
        """Create a standard 52-card deck"""
        suits = ['h', 'd', 'c', 's']  # hearts, diamonds, clubs, spades
        ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
        
        for suit in suits:
            for rank in ranks:
                self.cards.append(f"{rank}{suit}")
    
    def shuffle(self):
        """Shuffle the deck"""
        random.shuffle(self.cards)
    
    def draw(self) -> str:
        """Draw a card from the deck"""
        if not self.cards:
            raise ValueError("No cards left in deck")
        return self.cards.pop()

class PokerGame:
    def __init__(self):
        self.deck = None
        self.community_cards = []
        self.pot = 0
        self.current_street = "preflop"
        self.current_player_index = 0
        self.dealer_index = 0
        self.small_blind_index = 1
        self.big_blind_index = 2
        self.min_bet = 40  # Big blind
        self.last_raise_amount = 0
        self.actions = []
        
    def start_new_hand(self, players: List[Player]) -> str:
        """Start a new hand and return hand_id"""
        hand_id = str(uuid.uuid4())
        
        # Reset game state
        self.deck = CustomDeck()
        self.community_cards = []
        self.pot = 0
        self.current_street = "preflop"
        self.current_player_index = 0
        self.last_raise_amount = 0
        self.actions = []
        
        # Rotate positions
        self.dealer_index = (self.dealer_index + 1) % len(players)
        self.small_blind_index = (self.dealer_index + 1) % len(players)
        self.big_blind_index = (self.dealer_index + 2) % len(players)
        
        # Deal cards to players
        for player in players:
            player.cards = [self.deck.draw(), self.deck.draw()]
            player.is_active = True
            player.is_all_in = False
            player.current_bet = 0
        
        # Post blinds
        small_blind_player = players[self.small_blind_index]
        big_blind_player = players[self.big_blind_index]
        
        small_blind_amount = min(20, small_blind_player.stack)
        big_blind_amount = min(40, big_blind_player.stack)
        
        small_blind_player.stack -= small_blind_amount
        small_blind_player.current_bet = small_blind_amount
        big_blind_player.stack -= big_blind_amount
        big_blind_player.current_bet = big_blind_amount
        
        self.pot = small_blind_amount + big_blind_amount
        self.min_bet = big_blind_amount
        
        # Set current player to first after big blind
        self.current_player_index = (self.big_blind_index + 1) % len(players)
        
        return hand_id
    
    def deal_flop(self, players: List[Player]) -> List[str]:
        """Deal the flop"""
        if self.current_street != "preflop":
            return self.community_cards
            
        self.community_cards = [
            self.deck.draw(),
            self.deck.draw(),
            self.deck.draw()
        ]
        self.current_street = "flop"
        self.current_player_index = (self.dealer_index + 1) % len(players)
        self.min_bet = 40
        self.last_raise_amount = 0
        
        # Reset current bets for new street
        for player in players:
            player.current_bet = 0
            
        return self.community_cards
    
    def deal_turn(self, players: List[Player]) -> str:
        """Deal the turn"""
        if self.current_street != "flop":
            return None
            
        self.community_cards.append(self.deck.draw())
        self.current_street = "turn"
        self.current_player_index = (self.dealer_index + 1) % len(players)
        self.min_bet = 40
        self.last_raise_amount = 0
        
        # Reset current bets for new street
        for player in players:
            player.current_bet = 0
            
        return self.community_cards[-1]
    
    def deal_river(self, players: List[Player]) -> str:
        """Deal the river"""
        if self.current_street != "turn":
            return None
            
        self.community_cards.append(self.deck.draw())
        self.current_street = "river"
        self.current_player_index = (self.dealer_index + 1) % len(players)
        self.min_bet = 40
        self.last_raise_amount = 0
        
        # Reset current bets for new street
        for player in players:
            player.current_bet = 0
            
        return self.community_cards[-1]
    
    def make_action(self, players: List[Player], player_index: int, action_type: str, amount: int = 0) -> bool:
        """Make a player action"""
        if player_index != self.current_player_index:
            return False
            
        player = players[player_index]
        if not player.is_active or player.is_all_in:
            return False
            
        action = Action(
            player_name=player.name,
            action_type=action_type,
            amount=amount,
            street=self.current_street
        )
        
        if action_type == "fold":
            player.is_active = False
            self.actions.append(action)
            self._next_player(players)
            return True
            
        elif action_type == "check":
            if self._can_check(players):
                self.actions.append(action)
                self._next_player(players)
                return True
            return False
            
        elif action_type == "call":
            call_amount = self._get_call_amount(players, player)
            if call_amount <= player.stack:
                player.stack -= call_amount
                player.current_bet += call_amount
                self.pot += call_amount
                action.amount = call_amount
                self.actions.append(action)
                self._next_player(players)
                return True
            return False
            
        elif action_type == "bet":
            if amount >= self.min_bet and amount <= player.stack:
                player.stack -= amount
                player.current_bet += amount
                self.pot += amount
                self.min_bet = amount
                self.last_raise_amount = amount
                action.amount = amount
                self.actions.append(action)
                self._next_player(players)
                return True
            return False
            
        elif action_type == "raise":
            min_raise = self._get_min_raise(players)
            if amount >= min_raise and amount <= player.stack:
                player.stack -= amount
                player.current_bet += amount
                self.pot += amount
                self.min_bet = amount
                self.last_raise_amount = amount
                action.amount = amount
                self.actions.append(action)
                self._next_player(players)
                return True
            return False
            
        elif action_type == "all_in":
            all_in_amount = player.stack
            player.stack = 0
            player.current_bet += all_in_amount
            player.is_all_in = True
            self.pot += all_in_amount
            action.amount = all_in_amount
            self.actions.append(action)
            self._next_player(players)
            return True
            
        return False
    
    def _can_check(self, players: List[Player]) -> bool:
        """Check if current player can check"""
        current_player = players[self.current_player_index]
        max_bet = max(p.current_bet for p in players if p.is_active)
        return current_player.current_bet >= max_bet
    
    def _get_call_amount(self, players: List[Player], player: Player) -> int:
        """Get amount needed to call"""
        max_bet = max(p.current_bet for p in players if p.is_active)
        return max_bet - player.current_bet
    
    def _get_min_raise(self, players: List[Player]) -> int:
        """Get minimum raise amount"""
        max_bet = max(p.current_bet for p in players if p.is_active)
        return max_bet + self.last_raise_amount
    
    def _next_player(self, players: List[Player]):
        """Move to next active player"""
        while True:
            self.current_player_index = (self.current_player_index + 1) % len(players)
            if players[self.current_player_index].is_active and not players[self.current_player_index].is_all_in:
                break
    
    def is_hand_complete(self, players: List[Player]) -> bool:
        """Check if current street is complete"""
        active_players = [p for p in players if p.is_active]
        if len(active_players) <= 1:
            return True
            
        # Check if all active players have matched bets
        max_bet = max(p.current_bet for p in active_players)
        for player in active_players:
            if not player.is_all_in and player.current_bet < max_bet:
                return False
        return True
    
    def evaluate_winner(self, players: List[Player]) -> Dict[str, Any]:
        """Evaluate and return winner(s) using pokerkit"""
        active_players = [p for p in players if p.is_active]
        
        if len(active_players) == 1:
            winner = active_players[0]
            winner.stack += self.pot
            return {
                "winner": winner.name,
                "amount": self.pot,
                "reason": "Last player standing",
                "hand_rank": "No showdown"
            }
        
        # Use pokerkit for proper hand evaluation
        try:
            # Create pokerkit state for evaluation
            state = NoLimitTexasHoldem.create_state(
                (
                    Automation.ANTE_POSTING,
                    Automation.BET_COLLECTION,
                    Automation.BLIND_OR_STRADDLE_POSTING,
                    Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
                    Automation.HAND_KILLING,
                    Automation.CHIPS_PUSHING,
                    Automation.CHIPS_PULLING,
                ),
                True,  # Uniform antes
                0,  # No antes
                (20, 40),  # Blinds
                40,  # Min bet
                [p.stack + p.current_bet for p in active_players],  # Stacks
                len(active_players),  # Number of players
            )
            
            # Deal hole cards to active players
            for player in active_players:
                hole_cards = ''.join(player.cards)
                state.deal_hole(hole_cards)
            
            # Deal community cards if available
            if len(self.community_cards) >= 3:
                # Deal flop
                flop_cards = ''.join(self.community_cards[:3])
                state.burn_card()
                state.deal_board(flop_cards)
                
                if len(self.community_cards) >= 4:
                    # Deal turn
                    state.burn_card()
                    state.deal_board(self.community_cards[3])
                    
                    if len(self.community_cards) >= 5:
                        # Deal river
                        state.burn_card()
                        state.deal_board(self.community_cards[4])
            
            # Get hand rankings
            hand_rankings = []
            for i, player in enumerate(active_players):
                try:
                    # Get player's hand evaluation
                    player_hand = state.hole_cards[i]
                    if len(self.community_cards) >= 3:
                        # Create 7-card hand for evaluation
                        all_cards = player.cards + self.community_cards
                        hand = PokerHand.from_cards(all_cards)
                        hand_rankings.append({
                            'player': player.name,
                            'hand': hand,
                            'rank': hand.rank,
                            'cards': player.cards
                        })
                    else:
                        # Preflop - use hole cards only
                        hand_rankings.append({
                            'player': player.name,
                            'hand': None,
                            'rank': 0,
                            'cards': player.cards
                        })
                except Exception as e:
                    print(f"Error evaluating hand for {player.name}: {e}")
                    hand_rankings.append({
                        'player': player.name,
                        'hand': None,
                        'rank': 0,
                        'cards': player.cards
                    })
            
            # Find winner(s)
            if len(self.community_cards) >= 3:
                # Post-flop evaluation
                best_rank = max(h['rank'] for h in hand_rankings if h['hand'] is not None)
                winners = [h for h in hand_rankings if h['hand'] is not None and h['rank'] == best_rank]
                
                if len(winners) == 1:
                    winner = winners[0]
                    winner_player = next(p for p in active_players if p.name == winner['player'])
                    winner_player.stack += self.pot
                    
                    return {
                        "winner": winner['player'],
                        "amount": self.pot,
                        "reason": f"Best hand: {winner['hand'].description}",
                        "hand_rank": winner['hand'].description,
                        "community_cards": self.community_cards
                    }
                else:
                    # Split pot
                    split_amount = self.pot // len(winners)
                    for winner in winners:
                        winner_player = next(p for p in active_players if p.name == winner['player'])
                        winner_player.stack += split_amount
                    
                    return {
                        "winners": [w['player'] for w in winners],
                        "amount": split_amount,
                        "reason": f"Split pot: {winners[0]['hand'].description}",
                        "hand_rank": winners[0]['hand'].description,
                        "community_cards": self.community_cards
                    }
            else:
                # Preflop - random winner (no community cards)
                winner = random.choice(active_players)
                winner.stack += self.pot
                
                return {
                    "winner": winner.name,
                    "amount": self.pot,
                    "reason": "Preflop winner (no community cards)",
                    "hand_rank": "Preflop",
                    "community_cards": self.community_cards
                }
                
        except Exception as e:
            print(f"Error in pokerkit evaluation: {e}")
            # Fallback to random winner
            winner = random.choice(active_players)
            winner.stack += self.pot
            
            return {
                "winner": winner.name,
                "amount": self.pot,
                "reason": "Random winner (evaluation error)",
                "hand_rank": "Error",
                "community_cards": self.community_cards
            }
