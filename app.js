const fs = require('fs');
const fetch = require("node-fetch");
const inputFileName = process.argv[2];
const CASH_OUT = 'cash_out';
const CASH_IN = 'cash_in';
const NATURAL_TYPE = 'natural';
const LEGAL_TYPE = 'juridical';

let transactions = [];
let users = [];
let resultLog = [];

let cashInConfiguration;
let cashOutNaturalConfig;
let cashOutLegalConfig;

exports.getConfigurations = getConfigurations;
exports.transactionSupport = transactionSupport;
exports.resultLog = resultLog;

//for testing enviroment separation
if (inputFileName != 'test') {
    const rawInputData = fs.readFileSync(inputFileName);
    transactions = JSON.parse(rawInputData);
    main();
}

//all configuration data
async function getConfigurations(){
    cashInConfiguration = await getData('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in');
    cashOutNaturalConfig = await getData('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural');
    cashOutLegalConfig = await getData('http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical');
}

//program start
async function main(){
    await getConfigurations();

    for(const transaction in transactions){
        transactionSupport(transactions[transaction]);
    }
}


//Commission calculations
function transactionSupport(transaction) {
    let commissionFee;

    if (transaction.type === CASH_IN) {

        commissionFee = transaction.operation.amount * (cashInConfiguration.percents / 100);
        commissionFee = (commissionFee > cashInConfiguration.max.amount) ? cashInConfiguration.max.amount : commissionFee;
        commissionFee = roundUp(commissionFee, 2);
    
    }else if(transaction.type === CASH_OUT){

        if (transaction.user_type === NATURAL_TYPE) {
            
            if(isWeekAmountExceeded(transaction)){
                let user = users.findIndex(x => x.userId === transaction.user_id);

                if(users[user].limitExceeded){
                    users[user].weekAmount = (!users[user].amountSubstraction) ? users[user].weekAmount -= 1000 : users[user].weekAmount;
                    users[user].amountSubstraction = true;
                    users[user].limitExceeded = true;
                }
                
                commissionFee = (users[user].weekAmount) * (cashOutNaturalConfig.percents / 100);
                commissionFee = roundUp(commissionFee, 2);

            }else{
                commissionFee = 0;
            }

        }else if(transaction.user_type === LEGAL_TYPE) {
            commissionFee = transaction.operation.amount * (cashOutLegalConfig.percents / 100);
            commissionFee = (commissionFee < cashOutLegalConfig.min.amount) ? cashOutLegalConfig.min.amount : commissionFee;
            commissionFee = roundUp(commissionFee, 2);
        }else{
            console.log('Unknown user type');
        }

    }else{
        console.log('Unknown transaction type');
    }
    
    //Print result of commission Fee
    console.log(commissionFee.toFixed(2));
    resultLog.push(commissionFee.toFixed(2));
}



//checks if week amount exceeded
function isWeekAmountExceeded(transaction){
    let weekTimeSpan = getWeekSpan(transaction.date);
    let user = users.findIndex(x => x.userId === transaction.user_id);
    const transactionDate = new Date(transaction.date);

    if(user != -1 && users[user].mondayDate <= transactionDate && users[user].sundayDate >= transactionDate){
        
        if (!users[user].limitExceeded) {
            users[user].weekAmount += transaction.operation.amount;
        }else{
            users[user].weekAmount = transaction.operation.amount;
        }

        if(users[user].weekAmount > 1000 || users[user].limitExceeded){
            users[user].limitExceeded = true;
            return true;
        }else{
            return false;
        }
    }
    else{

        //Deletes user object from past weeks
        if(user != -1){
            users.splice(user, 1);
        }

        user ={
            userId: transaction.user_id,
            weekAmount: transaction.operation.amount,
            mondayDate: weekTimeSpan.monday,
            sundayDate: weekTimeSpan.sunday,
            limitExceeded: false,
            amountSubstraction: false
        };


        if(user.weekAmount > 1000 || user.limitExceeded){
            user.limitExceeded = true;
            users.push(user);
            return true;
        }else{
            users.push(user);
            return false;
        }
    }
}

//gets Monday and Sunday date of the week
function getWeekSpan(date) {
    date = new Date(date);

    let day = date.getDay(),
        diff = date.getDate() - day + (day == 0 ? -6:1);

    let monAndSun = {
        monday: new Date(date.setDate(diff)), 
        sunday: new Date(date.setDate(diff + 6))
    }

    return monAndSun;
}

//Rounding to smallest currency item
function roundUp(num, precision) {
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}

async function getData(url){
    const response = await fetch(url);
    const json = await response.json();
    return json;
};



