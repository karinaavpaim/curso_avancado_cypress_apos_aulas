describe('Hacker Stories', () => {
    const initialTerm = 'React'
    const newTerm = 'Cypress'

    context('Hitting the real API', () => {
        beforeEach(() => {
            cy.intercept({
                method: 'GET',
                pathname: '**/search',
                query: {
                    query: initialTerm,
                    page: '0'
                }
            }).as('getSearch')

            cy.visit('/')
            cy.wait('@getSearch')

            cy.contains('More').should('be.visible')
        })

        it('shows 20 stories, then the next 20 after clicking "More"', () => {
            cy.intercept({
                method: 'GET',
                pathname: '**/search',
                query: {
                    query: initialTerm,
                    page: '1'
                }
            }).as('getNextStories')

            cy.get('.item').should('have.length', 20)

            cy.contains('More').click()

            cy.wait('@getNextStories')

            cy.get('.item').should('have.length', 40)
        })

        it('searches via the last searched term', () => {
            cy.intercept(
                'GET',
                `**/search?query=${newTerm}&page=0`,
            ).as('getNewTermStories')

            cy.get('#search')
                .clear()
                .type(`${newTerm}{enter}`)

            cy.wait('@getNewTermStories')

            cy.getLocalStorage('search')     // Busca através do localstorage, para localizar últimas buscas realizadas
                .should('be.equal', newTerm)  // Como passamos o valor desta variavel na busca, então ela deve ficar no localstorage

            cy.get(`button:contains(${initialTerm})`)
                .should('be.visible')
                .click()

            cy.wait('@getSearch')

            cy.getLocalStorage('search')     // Busca através do localstorage, para localizar últimas buscas realizadas
                .should('be.equal', initialTerm)  // Como passamos o valor desta variavel na busca, então ela deve ficar no localstorage

            cy.get('.item').should('have.length', 20)
            cy.get('.item')
                .first()
                .should('contain', initialTerm)

            cy.get(`button:contains(${newTerm})`)
                .should('be.visible')
        })

        it('shows the footer', () => {
            cy.get('footer')
                .should('be.visible')
                .and('contain', 'Icons made by Freepik from www.flaticon.com')
        })
    })

    context('Mocking the API', () => {
        beforeEach(() => {
            cy.intercept(
                'GET',
                `**/search?query=${initialTerm}&page=0`,
                { fixture: 'stories' }   //Criado o arquivo na pasta fixtures 'stories.json'
            ).as('getSearch')

            cy.visit('/')
            cy.wait('@getSearch')

            cy.contains('More').should('be.visible')
        })

        context('List of stories', () => {
            const stories = require('../fixtures/stories')

            // Since the API is external,
            // I can't control what it will provide to the frontend,
            // and so, how can I assert on the data?
            // This is why this test is being skipped.
            // TODO: Find a way to test it out.
            it('shows the right data for all rendered stories', () => {
                cy.get('.item') //verificar se esse elemento possui o titulo com o nome da fixture
                    .first()
                    .should('be.visible')
                    .and('contain', stories.hits[0].title)
                    .and('contain', stories.hits[0].author)
                    .and('contain', stories.hits[0].num_comments)
                    .and('contain', stories.hits[0].points)

                cy.get(`.item a:contains(${stories.hits[0].title})`) //Aqui verifica que a url é a correta de cada item
                    .should('be.visible')
                    .and('have.attr', 'href', stories.hits[0].url)


                cy.get('.item') //verificar se esse elemento possui o titulo com o nome da fixture
                    .last()
                    .should('be.visible')
                    .and('contain', stories.hits[1].title)
                    .and('contain', stories.hits[1].author)
                    .and('contain', stories.hits[1].num_comments)
                    .and('contain', stories.hits[1].points)

                cy.get(`.item a:contains(${stories.hits[1].title})`) //Aqui verifica que a url é a correta de cada item
                    .should('be.visible')
                    .and('have.attr', 'href', stories.hits[1].url)
            })

            it('shows one less story after dimissing the first one', () => {
                cy.get('.button-small')
                    .first()
                    .should('be.visible')
                    .click()

                cy.get('.item').should('have.length', 1)
            })

            // Since the API is external,
            // I can't control what it will provide to the frontend,
            // and so, how can I test ordering?
            // This is why these tests are being skipped.
            // TODO: Find a way to test them out.
            context('Order by', () => {
                it('orders by title', () => {
                    cy.get('.list-header-button:contains(Title)')
                        .as('titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[0].title)

                    cy.get(`.item a:contains(${stories.hits[0].title})`)
                        .should('be.visible')
                        .should('have.attr', 'href', stories.hits[0].url)

                    cy.get('@titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[1].title)

                    cy.get(`.item a:contains(${stories.hits[1].title})`)
                        .should('be.visible')
                        .should('have.attr', 'href', stories.hits[1].url)
                })

                it('orders by author', () => {
                    cy.get('.list-header-button:contains(Author)')
                        .as('titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[0].author)

                    cy.get('@titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[1].author)
                })

                it('orders by comments', () => {
                    cy.get('.list-header-button:contains(Comments)')
                        .as('titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[1].num_comments)

                    cy.get('@titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[0].num_comments)
                })

                it('orders by points', () => {
                    cy.get('.list-header-button:contains(Points)')
                        .as('titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[1].points)

                    cy.get('@titleHeader')
                        .should('be.visible')
                        .click()

                    cy.get('.item')
                        .first()
                        .should('be.visible')
                        .and('contain', stories.hits[0].points)
                })
            })
        })
        // Hrm, how would I simulate such errors?
        // Since I still don't know, the tests are being skipped.
        // TODO: Find a way to test them out.
    })
    context('Search', () => {
        beforeEach(() => {
            cy.intercept(
                'GET',
                `**/search?query=${initialTerm}&page=0`,
                { fixture: 'empty' } // Arquivo json criado para limpar as buscas realizadas por outro teste.
            ).as('getEmptyStories')

            cy.intercept(
                'GET',
                `**/search?query=${newTerm}&page=0`,
                { fixture: 'stories' } // Intercept criado para ele trazer a listagem com 2 itens criado na fixture.
            ).as('getStories')

            cy.visit('/')
            cy.wait('@getEmptyStories')

            cy.contains('More').should('be.visible')

            cy.get('#search')
                .should('be.visible')
                .clear()
        })

        it('shows no story when none is returned', () => {
            cy.get('.item').should('not.exist')
        })

        it('types and hits ENTER', () => {
            cy.get('#search')
                .type(`${newTerm}{enter}`)

            cy.wait('@getStories')

            cy.get('.item').should('have.length', 2)

            cy.get(`button:contains(${initialTerm})`)
                .should('be.visible')
        })

        it('types and clicks the submit button', () => {
            cy.get('#search')
                .should('be.visible')
                .type(newTerm)

            cy.contains('Submit')
                .should('be.visible')
                .click()

            cy.wait('@getStories')

            cy.get('.item').should('have.length', 2)

            cy.get(`button:contains(${initialTerm})`)
                .should('be.visible')
        })

        it('types and submits the form directly', () => {
            cy.get('#search').as('input')
                .should('be.visible')
                .type(newTerm)

            cy.get('form')
                .should('be.visible')
                .submit()

            cy.wait('@getStories')

            cy.get('.item').should('have.length', 2)
        })

        context('Last searches', () => {
            it('shows a max of 5 buttons for the last searched terms', () => {
                const faker = require('faker')

                cy.intercept(
                    'GET',
                    '**/search**',
                    { fixture: 'empty' }
                ).as('getRandomStories')

                Cypress._.times(6, () => {
                    const randomWord = faker.random.word() // Criada esta constante, para obter o valor da palavra criada pelo faker

                    cy.get('#search')
                        .should('be.visible')
                        .clear()
                        .type(`${randomWord}{enter}`)

                    cy.wait('@getRandomStories')

                    cy.getLocalStorage('search')
                        .should('be.equal', randomWord)  //Aqui irá verificar a palavra faker, no local storage
                })

                cy.get('.last-searches')   //Esta é uma forma a ser utiizada quando há um seletor muito grande
                    .within(() => {
                        cy.get('button')
                            .should('have.length', 5)
                    })
            })
        })
    })
})

//Teste para simular o delay da requisição
it('shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
        'GET',
        '**/search**',
        {
            delay: 1000,
            fixture: 'stories'
        }
    ).as('getDelayedStories')

    cy.visit('/')

    cy.aguardarCarregamento()  //Comando criado para visualizar o elemento de loading e depois verificar que ele não existe mais
    cy.wait('@getDelayedStories')

    cy.get('.item').should('have.length', 2)
})



