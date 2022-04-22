const user = Date.now()
const email = `${user}@email.com`
const password = 'a12345678'

describe('Test Snake Game', () => {

    it('Go home page', () => {
        cy.visit('http://localhost:3000')
    })

    it('Register', () => {
        cy.contains("a", "register now!").click()
        cy.get('#rc-tabs-0-panel-register').within(() => {
            cy.get('#normalRegister_email').type(email)
            cy.get('#normalRegister_username').type(user)
            cy.get('#normalRegister_password').type(password)
            cy.contains("span", "I agree to the Privacy Policy").click()
            cy.contains("button", "Register").click()
        })
    })

    it('Log out', () => {
        cy.get('.ant-modal-close').click()
        cy.contains("button", "Logout").click()
        cy.contains("button", "Yes").click()
    })

    it('Log in', () => {
        cy.get('#rc-tabs-0-panel-login').within(() => {
            cy.get('#normalLogin_email').type(email)
            cy.get('#normalLogin_password').type(password)
            cy.contains("button", "Log in").click()
        })
    })

    it('Start game', () => {
        cy.contains("button", "OK").click()
        cy.get('.ant-switch').click()
        cy.contains("span", "The game starts in 3 seconds").should("exist")
        cy.contains("span", "The game starts in 2 seconds").should("exist")
        cy.contains("span", "The game starts in 1 seconds").should("exist")
        cy.get("circle").should('have.length', 4)
    })

    it('End game', () => {
        cy.get('body').trigger('keydown', { keyCode: 37 })
        cy.wait(4000)
        cy.get('body').trigger('keyup', { keyCode: 37 })
        cy.contains("span", `RIP ${user}`).should("exist")
    })
})