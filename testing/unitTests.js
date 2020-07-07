const app = require('../app');
var assert = require('assert');

main();

async function main(){
    await app.getConfigurations();

    testCashOutWithExceededLimit();
    testCashOutWithExceededLimit_multipleTransactions();
    testCashOutWithExceededLimit_differentWeeks();
    testCashOutLegalType();
    testCashOutRounding();
    testCashIn();
    testCashInMaxCommission();
}

//CASH OUT --- TESTS

//Cash out exceeded limit by first opearation of week
function testCashOutWithExceededLimit() {
    let transaction = { "date": "2016-02-15", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 10000.00, "currency": "EUR" }};
    
    app.transactionSupport(transaction);

    let result = parseFloat(app.resultLog[0]).toFixed(2);

    console.log('addTwoNumbers() should return the sum of its two parameters.');
    console.log('Expect ' + 27.00 + ' equal to ' + result + '.');
    
    try {
      assert.equal(27.00, result);
      
      console.log('Passed. \n');
    } catch (error) {
      console.error('Failed. \n');
    }

}


//Cash out exceeded limit by more opearations of week
function testCashOutWithExceededLimit_multipleTransactions() {
    let transactions = [{ "date": "2016-03-15", "user_id": 2, "user_type": "natural", "type": "cash_out", "operation": { "amount": 100.00, "currency": "EUR" }},
                       { "date": "2016-03-15", "user_id": 2, "user_type": "natural", "type": "cash_out", "operation": { "amount": 700.00, "currency": "EUR" }},
                       { "date": "2016-03-15", "user_id": 2, "user_type": "natural", "type": "cash_out", "operation": { "amount": 600.00, "currency": "EUR" }}];
                       
    for(const transaction in transactions){
        app.transactionSupport(transactions[transaction]);
    }

    let result = parseFloat(app.resultLog[3]).toFixed(2);

    console.log('addTwoNumbers() should return the sum of its two parameters.');
    console.log('Expect ' + 1.20  + ' equal to ' + result + '.');
    
    try {
      assert.equal(1.20, result);
      
      console.log('Passed. \n');
    } catch (error) {
      console.error('Failed. \n');
    }

}


//Cash out exceeded limit by more opearations of week
function testCashOutWithExceededLimit_differentWeeks() {
    let transactions = [{ "date": "2016-03-15", "user_id": 3, "user_type": "natural", "type": "cash_out", "operation": { "amount": 5000.00, "currency": "EUR" }},
                       { "date": "2016-03-15", "user_id": 3, "user_type": "natural", "type": "cash_out", "operation": { "amount": 500.00, "currency": "EUR" }},
                       { "date": "2016-04-15", "user_id": 3, "user_type": "natural", "type": "cash_out", "operation": { "amount": 600.00, "currency": "EUR" }}];
                       
    for(const transaction in transactions){
        app.transactionSupport(transactions[transaction]);
    }

    let result1 = parseFloat(app.resultLog[5]).toFixed(2);
    let result2 = parseFloat(app.resultLog[6]).toFixed(2);

    console.log('addTwoNumbers() should return the sum of its two parameters.');
    console.log('Expect ' + 1.50  + ' equal to ' + result1 + '.');
    console.log('And expect ' + 0.00  + ' equal to ' + result2 + '.');
    
    try {
      assert.equal(1.50, result1);
      assert.equal(0.00, result2);
      
      console.log('Passed. \n');
    } catch (error) {
      console.error('Failed. \n');
    }

}


//Cash out for legal person not less than 0.50
function testCashOutLegalType() {
    let transaction = { "date": "2016-03-15", "user_id": 3, "user_type": "juridical", "type": "cash_out", "operation": { "amount": 50.2, "currency": "EUR" }};
                       
    app.transactionSupport(transaction);
    
    let result = parseFloat(app.resultLog[7]).toFixed(2);

    console.log('addTwoNumbers() should return the sum of its two parameters.');
    console.log('Expect ' + 0.50  + ' equal to ' + result + '.');

    try {
      assert.equal(0.50, result);
      
      console.log('Passed. \n');
    } catch (error) {
      console.error('Failed. \n');
    }

}

//Cash out rounding
function testCashOutRounding() {
    let transaction = { "date": "2016-03-15", "user_id": 3, "user_type": "juridical", "type": "cash_out", "operation": { "amount": 1027.9, "currency": "EUR" }};
                       
    app.transactionSupport(transaction);
    
    let result = parseFloat(app.resultLog[8]).toFixed(2);

    console.log('addTwoNumbers() should return the sum of its two parameters.');
    console.log('Exact number what we get is 3.0837 but we expect ' + 3.09  + ' equal to ' + result + '.');

    try {
      assert.equal(3.09, result);
      
      console.log('Passed. \n');
    } catch (error) {
      console.error('Failed. \n');
    }

}


//CASH IN --- TESTS

//test cash in transaction
function testCashIn() {
    let transaction = { "date": "2016-03-15", "user_id": 3, "user_type": "juridical", "type": "cash_in", "operation": { "amount": 1200, "currency": "EUR" }};
                       
    app.transactionSupport(transaction);
    
    let result = parseFloat(app.resultLog[9]).toFixed(2);

    console.log('addTwoNumbers() should return the sum of its two parameters.');
    console.log('Expect ' + 0.36  + ' equal to ' + result + '.');

    try {
      assert.equal(0.36, result);
      
      console.log('Passed. \n');
    } catch (error) {
      console.error('Failed. \n');
    }

}

//test max cash in commission rate
function testCashInMaxCommission() {
    let transaction = { "date": "2016-03-15", "user_id": 3, "user_type": "juridical", "type": "cash_in", "operation": { "amount": 100000, "currency": "EUR" }};
                       
    app.transactionSupport(transaction);
    
    let result = parseFloat(app.resultLog[10]).toFixed(2);

    console.log('addTwoNumbers() should return the sum of its two parameters.');
    console.log('Expect ' + 5.00  + ' equal to ' + result + '.');

    try {
      assert.equal(5.00, result);
      
      console.log('Passed. \n');
    } catch (error) {
      console.error('Failed. \n');
    }

}