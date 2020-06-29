const fs = require('fs');
const fetch = require("node-fetch");
const inputFileName = process.argv[2];

const rawInputData = fs.readFileSync(inputFileName);
const transactions = JSON.parse(rawInputData);
const CASH_OUT = 'cash_out';
const CASH_IN = 'cash_in';
const NATURAL_TYPE = 'natural';
const LEGAL_TYPE = 'juridical';

let users = [];

let cashInConfiguration;
let cashOutNaturalConfig;
let cashOutLegalConfig;


main()

async function main(){
    cashInConfiguration = await getData('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in');
    cashOutNaturalConfig = await getData('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural');
    cashOutLegalConfig = await getData('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical');

    for(const transaction in transactions){
        transactionSupport(transactions[transaction]);
    }
}


function transactionSupport(transaction){
    let commissionFee;

    if (transaction.type === CASH_IN) {

        commissionFee = transaction.operation.amount * (cashInConfiguration.percents / 100);
    
    }else if(transaction.type === CASH_OUT){

        if (transaction.user_type === NATURAL_TYPE) {
            
            isWeekAmountExceeded(transaction);
            commissionFee = transaction.operation.amount * (cashOutNaturalConfig.percents / 100);
        }else if(transaction.user_type === LEGAL_TYPE) {
            commissionFee = transaction.operation.amount * (cashOutLegalConfig.percents / 100);
        }else{
            console.log('Unknown user type');
        }

    }else{
        console.log('Unknown transaction type');
    }
    
    console.log(commissionFee.toFixed(2));
}

function isWeekAmountExceeded(transaction){
    let weekTimeSpan = getWeekSpan(transaction.date);

    if(users.findIndex(x => x.user_id === transaction.user_id)){
        
    }

    let user ={
        userId: transaction.user_id,

    };
    
    console.log("week starts at: " + weekTimeSpan.monday + " and ends at: " + weekTimeSpan.sunday);
}

function getWeekSpan(date) {
    date = new Date(d);
    let day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -6:1);

    let monAndSun = {
        monday: new Date(date.setDate(diff)), 
        sunday: new Date(date.setDate(diff + 6))
    }

    return monAndSun;
}

async function getData(url){
    const response = await fetch(url);
    const json = await response.json();
    return json;
};



