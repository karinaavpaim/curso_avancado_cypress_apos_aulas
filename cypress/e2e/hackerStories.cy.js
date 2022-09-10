describe('Hacker Stories', () => {
  beforeEach(() => {
    //Método utilizado anteriormente.
    //cy.assertLoadingIsShownAndHidden() 

    //Método utilizado agora.
    cy.intercept({
      method: 'GET',
      pathname: '**/search',
      query: {
        query: 'React',
        page: '0'
      }
    }).as('getSearch')

    cy.visit('/')
    cy.wait('@getSearch')

    cy.contains('More').should('be.visible')
  })

  it('shows the footer', () => {
    cy.get('footer')
      .should('be.visible')
      .and('contain', 'Icons made by Freepik from www.flaticon.com')
  })

  context('List of stories', () => {
    // Since the API is external,
    // I can't control what it will provide to the frontend,
    // and so, how can I assert on the data?
    // This is why this test is being skipped.
    // TODO: Find a way to test it out.
    it.skip('shows the right data for all rendered stories', () => { })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      //Inserido nas aulas
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: 'React',
          page: '1'
        }
      }).as('getNextStories')

      cy.get('.item').should('have.length', 20)

      cy.contains('More').click()

      cy.wait('@getNextStories')

      //Método utilizado antes
      //cy.assertLoadingIsShownAndHidden()

      cy.get('.item').should('have.length', 40)
    })

    it('shows only nineteen stories after dimissing the first story', () => {
      cy.get('.button-small')
        .first()
        .click()

      cy.get('.item').should('have.length', 19)
    })

    // Since the API is external,
    // I can't control what it will provide to the frontend,
    // and so, how can I test ordering?
    // This is why these tests are being skipped.
    // TODO: Find a way to test them out.
    context.skip('Order by', () => {
      it('orders by title', () => { })

      it('orders by author', () => { })

      it('orders by comments', () => { })

      it('orders by points', () => { })
    })

  })
  // Hrm, how would I simulate such errors?
  // Since I still don't know, the tests are being skipped.
  // TODO: Find a way to test them out.

  context('Search', () => {
    const initialTerm = 'React'
    const newTerm = 'Cypress'

    beforeEach(() => {
      //Inserido nas aulas

      cy.intercept(
        'GET',
        `**/search?query=${newTerm}&page=0`, // Aqui utilizou-se de crase ao invés de aspas simples, para concatenar o objeto
      ).as('getNewTermStories')

      cy.get('#search')
        .clear()
    })

    it('types and hits ENTER', () => {
      cy.get('#search')
        .type(`${newTerm}{enter}`) //Digitando Enter

      // Utilizado antes das aultas
      //cy.assertLoadingIsShownAndHidden()

      // Utilizado nas aulas
      cy.wait('@getNewTermStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    it('types and clicks the submit button', () => {
      cy.get('#search')
        .type(newTerm)
      cy.contains('Submit')
        .click()

      // Utilizado antes das aultas
      //cy.assertLoadingIsShownAndHidden()

      // Utilizado nas aulas
      cy.wait('@getNewTermStories')

      cy.get('.item').should('have.length', 20)
      cy.get('.item')
        .first()
        .should('contain', newTerm)
      cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
    })

    it('types and submits the form directly', () => {
      cy.get('#search').as('input')
        .type(newTerm)

      cy.get('form').submit() // Recurso do cypress para já clicar no botão submit

      cy.wait('@getNewTermStories')

      cy.get('@input').should('have.value', newTerm)
      cy.get('span').should('contain', newTerm)
      cy.get('.item').should('have.length', 20)
    })

    context('Last searches', () => {
      it('searches via the last searched term', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)

        //Metodo utilizado antes das aulas
        //cy.assertLoadingIsShownAndHidden()

        //Metoto utilizado nas aulas
        cy.wait('@getNewTermStories')

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
          .click()

        //Metodo utilizado antes das aulas
        //cy.assertLoadingIsShownAndHidden()

        //Metoto utilizado nas aulas
        cy.wait('@getSearch')

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', initialTerm)
        cy.get(`button:contains(${newTerm})`)
          .should('be.visible')
      })

      it('shows a max of 5 buttons for the last searched terms', () => {
        const faker = require('faker')

        //Inserido este intercept para aguardar a busca
        cy.intercept(
          'GET',
          '**/search**'
        ).as('getRandomStories')

        //Utilizamos este método para não precisarmos escrever toda hora. Para repetir.
        //Também pode ser utilizado para um teste, ou classe inteira
        Cypress._.times(6, () => {
          cy.get('#search')
            .clear()
            .type(`${faker.random.word()}{enter}`)

          //Incluído dentro de cada vez que for buscar uma palavra:
          cy.wait('@getRandomStories')
        })

        //Metodo utilizado antes das aulas
        //cy.assertLoadingIsShownAndHidden()

        cy.get('.last-searches button')
          .should('have.length', 5)
      })
    })
  })
})

context('List of stories', () => {
  context('Errors', () => {
    const errorMsg = 'Oops! Tente novamente mais tarde.'

    it.only('shows "Something went wrong ..." in case of a server error', () => {
      cy.intercept(
        'GET',
        '**/search**', //interceptar para qualquer busca
        { statusCode: 500 } //objeto passado para 500 que simula erro no servidor
      ).as('getServerFailure')

      cy.visit('/')
      cy.wait('@getServerFailure')

      cy.get('p:contains(Something went wrong ...)')
        .should('be.visible')
    })
    it.only('shows "Something went wrong ..." in case of a network error', () => {
      cy.intercept(
        'GET',
        '**/search**', //interceptar para qualquer busca
        { forceNetworkError: true } //objeto passado para forçar erro na rede
      ).as('getNetworkFailure')

      cy.visit('/')
      cy.wait('@getNetworkFailure')

      cy.get('p:contains(Something went wrong ...)')
        .should('be.visible')
    })
  })
})
