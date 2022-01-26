// Test_PolyShopping.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

describe('The Home Page', () => {

    it('successfully loads', () => {
        cy.visit('http://localhost:3000')
    })

    it('Connection success', () => {
        cy.contains('Connection').click(); // change page to connection page
        cy.get('input[name=username]').type('kale');
        cy.get('input[name=password]').type('1234');
        cy.get('button[type=submit]').click();
        cy.contains('Bonjour, kale ( Déconnection )');
    })

    it('New article success', () => {
        cy.contains('Nouveau produit').click(); // change page to new product page
        cy.contains('Ajouter un produit').click(); // change page to new product page
        cy.contains('Title').type('prod1');
        //cy.get('input[name=desc]').type('premier produit');
        //cy.get('input[name=price]').type('10');
        cy.contains('Publier');
    })
  /*
    it('New article without name', () => {
    })

    it('New article without price', () => {
    })*/

    /*it('Connection failed', () => {
        cy.contains('Connection').click(); // change page to connection page
        cy.get('input[name=username]').type('kale');
        cy.get('input[name=password]').type('123');
        cy.get('button[type=submit]').click();
        cy.contains('Wrong password.');
    })*/
})