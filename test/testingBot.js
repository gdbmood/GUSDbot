const Web3 = require('web3');
const cron = require('node-cron');
const path = require('path');

const contractABI = require('../scripts/Abi/contractABI.json');
const usdtABI = require('../scripts/Abi/usdtABI.json');

let contractAddress // save in env when in prod

let usdtAddress // save in env when in prod

const web3 = new Web3("http://127.0.0.1:8545/"); // or any other RPC endpoint

const add="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

const privatekey="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"// save in env when in prod

let stablecoinContract

let usdtContract

// let mint = stablecoinContract.methods.mint;

// let burn = stablecoinContract.methods.burn;
let burnAdjust 
let mintAdjust 

// let approve = usdtContract.methods.approve;





const targetPrice = 1; // Target price in USD

const exchangeRate = 1; // Exchange rate with USDT (1:1 by default)

const threshold = 0.01; // Minimum price deviation to trigger an adjustment


const checkPrice = async () => {
    console.log("Now on checkPrice",contractAddress);
  const totalSupply = await stablecoinContract.methods.totalSupply().call();
  const usdtBalance = await stablecoinContract.methods.balanceOfUSDT().call();
  // console.log("TOTAL",usdtBalance);
  // console.log(usdtBalance,"Bslance");
  return (usdtBalance * 10 ** 18) / (totalSupply);
};

const calculateDifference = (currentPrice, targetPrice) =>{
    console.log("Calculating difference");
    console.log(" difference= ",currentPrice - targetPrice);
    return currentPrice - targetPrice;
}

// const approveUsdt = async (amount) => {
//     console.log("asking for approval for amount= ",amount);
//     try{
//   const allowance = await usdtContract.methods.allowance(add, contractAddress).call();
//   if (allowance < amount) {
//     console.log("allowance= ",allowance, "is greater",allowance < amount);
//    let amountbn= Web3.utils.toBN(amount);
//     // const tx = await usdtContract.methods.approve(contractAddress, amount).send({ from: add, gas: 100000 });
//     const approveTx = approve(contractAddress,amountbn).encodeABI();
//     const tx = {
//       from: add,
//       to: usdtAddress,
//       gas: 100000,
//       gasPrice: 1000000000,
//       data: approveTx,
//     };
//     const signedTx = await web3.eth.accounts.signTransaction(tx, privatekey);
//     const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//     console.log(`Approved ${amount} USDT for stablecoin minting (transaction hash: ${tx.transactionHash})`);
//   }}
//   catch(error){
//     console.log(error);
//   }
// };



const adjustSupply = async (difference) => {
  const totalSupply = await stablecoinContract.methods.totalSupply().call();
  const usdtBalance = await stablecoinContract.methods.balanceOfUSDT().call();
  // const totalSupply = await stablecoinContract.methods.totalSupply().call();
  console.log("totalSupply...= ",totalSupply);
  const decimals = await stablecoinContract.methods.decimals().call();
  console.log("decimals",decimals);
  let adjustment =  Math.abs((usdtBalance* 10 ** decimals)-totalSupply)  ;
  adjustment = Math.abs(adjustment)
  console.log("adjustment = ",adjustment );
let price= await checkPrice()
console.log("Current price Before ",price);
  if (price < targetPrice) {
    // If the price exceeds the target price, burn the excess stablecoin
    console.log("price exceeds the target price, burn the excess stablecoin");
    // await stablecoinContract.methods.burn(adjustment).send({ from: add, gas: 100000 });
    let amountbn= Web3.utils.toBN(adjustment);
    const burnTx = burnAdjust(amountbn).encodeABI();
    const tx = {
      from: add,
      to: contractAddress,
      gas: 100000,
      gasPrice: 1000000000,
      data: burnTx,
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privatekey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Burned ${adjustment / 10 ** decimals} stablecoin`);



  } else if (price > targetPrice) {

	
    // If the price falls below the target price, mint more stablecoin
    console.log("price falls below the target price, minting more stablecoin");
    
    let amountbn= Web3.utils.toBN(adjustment);
    // await stablecoinContract.methods.mint(adjustment).send({ from: add, gas: 100000 });
    try{const mintTx = mintAdjust(amountbn).encodeABI();
    const tx = {
      from: add,
      to: contractAddress,
      gas: 100000,
      gasPrice: 1000000000,
      data: mintTx,
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privatekey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Minted ${adjustment / 10 ** 18} stablecoin`);}
    catch(error){
      console.log(error);
    }
  }
  
  

};


const runBot = async (usdtContractAddress,stablecoinContractAdd) => {

  contractAddress=stablecoinContractAdd

usdtAddress=usdtContractAddress
stablecoinContract = new web3.eth.Contract(contractABI, contractAddress);
usdtContract = new web3.eth.Contract(usdtABI, usdtAddress);
burnAdjust = stablecoinContract.methods.burnAdjust;
mintAdjust = stablecoinContract.methods.mintAdjust;


  const currentPrice = await checkPrice();
  const usdtBalance = await stablecoinContract.methods.balanceOfUSDT().call();
  console.log("usdt balance",usdtBalance*10**18);
  const totalSupply = await stablecoinContract.methods.totalSupply().call();
  let difference = calculateDifference(currentPrice, targetPrice);
  console.log("difference",difference);

  if (Math.abs(difference) > threshold) {
  }
  await adjustSupply(difference);
  console.log("---------------------------------------------------");

  const currentPricenew = await checkPrice()
  console.log("New Price after adjustment is = ",currentPricenew);
  console.log("---------------------------------------------------\n");
  price=checkPrice()
  return price
};


module.exports={
  stabilize:runBot
}

// Sceduled to be run every minute

// Change time sheduled by converting time from
// https://www.freeformatter.com/cron-expression-generator-quartz.html
// to cron expression like '* * * * *' 
// cron.schedule('* * * * *', () => {
//     runBot();
//   }); //PER MINUTE
// cron.schedule('0/30 0 0 * * * *', () => {
//     runBot();
//   }); //PER 30 SECONDs


    // runBot();
