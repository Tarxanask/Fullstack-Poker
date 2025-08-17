// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands here
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
    }
  }
}
