describe('Poker Game E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should load the poker game page', () => {
    cy.get('h1').should('contain', 'Texas Hold\'em Poker Game');
    cy.get('button').should('contain', 'Start New Hand');
  });

  it('should configure player stacks and start a new hand', () => {
    // Configure player stacks
    cy.get('input[id="Alice"]').clear().type('1000');
    cy.get('input[id="Bob"]').clear().type('1000');
    cy.get('input[id="Charlie"]').clear().type('1000');
    cy.get('input[id="David"]').clear().type('1000');
    cy.get('input[id="Eve"]').clear().type('1000');
    cy.get('input[id="Frank"]').clear().type('1000');

    // Start new hand
    cy.get('button').contains('Start New Hand').click();
    
    // Should show the poker table
    cy.get('.text-3xl').should('contain', 'Texas Hold\'em Poker Game');
    cy.get('button').should('contain', 'Fold');
    cy.get('button').should('contain', 'All In');
  });

  it('should display current player information', () => {
    // Start a hand first
    cy.get('button').contains('Start New Hand').click();
    
    // Check current player info
    cy.get('div').should('contain', 'Current Player:');
    cy.get('div').should('contain', 'Stack: $');
    cy.get('div').should('contain', 'Street: preflop');
  });

  it('should make a fold action', () => {
    // Start a hand
    cy.get('button').contains('Start New Hand').click();
    
    // Make fold action
    cy.get('button').contains('Fold').click();
    
    // Should update the game state
    cy.get('div').should('contain', 'No actions yet');
  });

  it('should make a bet action', () => {
    // Start a hand
    cy.get('button').contains('Start New Hand').click();
    
    // Enter bet amount
    cy.get('input[placeholder*="Min:"]').first().type('100');
    
    // Make bet
    cy.get('button').contains('Bet').click();
    
    // Should update the game state
    cy.get('div').should('contain', 'Pot: $');
  });

  it('should make an all-in action', () => {
    // Start a hand
    cy.get('button').contains('Start New Hand').click();
    
    // Make all-in action
    cy.get('button').contains('All In').click();
    
    // Should update the game state
    cy.get('div').should('contain', 'Pot: $');
  });

  it('should deal the flop', () => {
    // Start a hand
    cy.get('button').contains('Start New Hand').click();
    
    // Make some actions to complete preflop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    // Deal flop
    cy.get('button').contains('Deal Flop').click();
    
    // Should show flop cards
    cy.get('div').should('contain', 'Street: flop');
  });

  it('should deal the turn', () => {
    // Start a hand and deal flop
    cy.get('button').contains('Start New Hand').click();
    
    // Complete preflop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal Flop').click();
    
    // Complete flop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    // Deal turn
    cy.get('button').contains('Deal Turn').click();
    
    // Should show turn
    cy.get('div').should('contain', 'Street: turn');
  });

  it('should deal the river', () => {
    // Start a hand and deal flop and turn
    cy.get('button').contains('Start New Hand').click();
    
    // Complete preflop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal Flop').click();
    
    // Complete flop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal Turn').click();
    
    // Complete turn
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    // Deal river
    cy.get('button').contains('Deal River').click();
    
    // Should show river
    cy.get('div').should('contain', 'Street: river');
  });

  it('should complete a hand and show winner', () => {
    // Start a hand and deal all community cards
    cy.get('button').contains('Start New Hand').click();
    
    // Complete preflop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal Flop').click();
    
    // Complete flop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal Turn').click();
    
    // Complete turn
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal River').click();
    
    // Complete river
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    // Complete hand
    cy.get('button').contains('Complete Hand').click();
    
    // Should show winner information
    cy.get('div').should('contain', 'Hand completed');
  });

  it('should display hand history after completing a hand', () => {
    // Complete a full hand first
    cy.get('button').contains('Start New Hand').click();
    
    // Complete preflop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal Flop').click();
    
    // Complete flop
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal Turn').click();
    
    // Complete turn
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Deal River').click();
    
    // Complete river
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('Fold').click();
    
    cy.get('button').contains('Complete Hand').click();
    
    // Check hand history
    cy.get('div').should('contain', 'Hand History');
  });

  it('should handle invalid actions gracefully', () => {
    // Start a hand
    cy.get('button').contains('Start New Hand').click();
    
    // Try to bet less than minimum
    cy.get('input[placeholder*="Min:"]').first().type('10');
    cy.get('button').contains('Bet').should('be.disabled');
    
    // Try to bet more than stack
    cy.get('input[placeholder*="Min:"]').first().clear().type('2000');
    cy.get('button').contains('Bet').should('be.disabled');
  });

  it('should disable game flow buttons when not appropriate', () => {
    // Start a hand
    cy.get('button').contains('Start New Hand').click();
    
    // Deal Turn should be disabled in preflop
    cy.get('button').contains('Deal Turn').should('be.disabled');
    
    // Deal River should be disabled in preflop
    cy.get('button').contains('Deal River').should('be.disabled');
    
    // Complete Hand should be disabled in preflop
    cy.get('button').contains('Complete Hand').should('be.disabled');
  });

  it('should show action log with proper formatting', () => {
    // Start a hand
    cy.get('button').contains('Start New Hand').click();
    
    // Make some actions
    cy.get('button').contains('Fold').click();
    cy.get('button').contains('All In').click();
    
    // Check action log
    cy.get('div').should('contain', 'Action Log');
    cy.get('div').should('contain', 'f'); // fold
    cy.get('div').should('contain', 'allin'); // all-in
  });
});
