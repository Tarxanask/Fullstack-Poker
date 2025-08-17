// Custom commands for poker game testing

Cypress.Commands.add('startNewHand', () => {
  cy.get('button').contains('Start New Hand').click();
});

Cypress.Commands.add('makeAction', (actionType: string, amount?: number) => {
  switch (actionType) {
    case 'fold':
      cy.get('button').contains('Fold').click();
      break;
    case 'check':
      cy.get('button').contains('Check').click();
      break;
    case 'call':
      cy.get('button').contains(/Call \$/).click();
      break;
    case 'bet':
      if (amount) {
        cy.get('input[placeholder*="Min:"]').first().type(amount.toString());
        cy.get('button').contains('Bet').click();
      }
      break;
    case 'raise':
      if (amount) {
        cy.get('input[placeholder*="Min:"]').last().type(amount.toString());
        cy.get('button').contains('Raise').click();
      }
      break;
    case 'all_in':
      cy.get('button').contains('All In').click();
      break;
  }
});

Cypress.Commands.add('dealFlop', () => {
  cy.get('button').contains('Deal Flop').click();
});

Cypress.Commands.add('dealTurn', () => {
  cy.get('button').contains('Deal Turn').click();
});

Cypress.Commands.add('dealRiver', () => {
  cy.get('button').contains('Deal River').click();
});

Cypress.Commands.add('completeHand', () => {
  cy.get('button').contains('Complete Hand').click();
});

Cypress.Commands.add('completePreflop', () => {
  // Make actions for all 6 players to complete preflop
  for (let i = 0; i < 6; i++) {
    cy.makeAction('fold');
  }
});

Cypress.Commands.add('completeStreet', () => {
  // Make actions for all active players to complete current street
  for (let i = 0; i < 6; i++) {
    cy.makeAction('fold');
  }
});

declare global {
  namespace Cypress {
    interface Chainable {
      startNewHand(): Chainable<void>;
      makeAction(actionType: string, amount?: number): Chainable<void>;
      dealFlop(): Chainable<void>;
      dealTurn(): Chainable<void>;
      dealRiver(): Chainable<void>;
      completeHand(): Chainable<void>;
      completePreflop(): Chainable<void>;
      completeStreet(): Chainable<void>;
    }
  }
}
