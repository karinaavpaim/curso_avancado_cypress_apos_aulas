import 'cypress-localstorage-commands'
//import { contains } from 'cypress/types/jquery'

Cypress.Commands.add('aguardarCarregamento', () => {
    cy.contains('Loading ...').should('be.visible')
    cy.contains('Loading ...').should('not.exist')
})

