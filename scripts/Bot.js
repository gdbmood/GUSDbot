const Web3 = require('web3');
const cron = require('node-cron');
const path = require('path');

const contractABI = require('./Abi/contractABI.json');
const usdtABI = require('./Abi/usdtABI.json');

const contractAddress="0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6"// save in env when in prod

const usdtAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3"// save in env when in prod

// const priceOracleAddress = "0x..."; when oracle implemented

const web3 = new Web3("http://127.0.0.1:8545/"); // or any other RPC endpoint

const ownerAddress="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // save in env when in prod

const privatekey="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"// save in env when in prod

const stablecoinContract = new web3.eth.Contract(contractABI, contractAddress);

// const priceOracle = await ethers.getContractAt("PriceOracle", priceOracleAddress);

const usdtContract = new web3.eth.Contract(usdtABI, usdtAddress);

const mint = stablecoinContract.methods.mint;

const burn = stablecoinContract.methods.burn;
const burnAdjust = stablecoinContract.methods.burnAdjust;
const mintAdjust = stablecoinContract.methods.mintAdjust;

const approve = usdtContract.methods.approve;





const targetPrice = 1; // Target price in USD

const exchangeRate = 1; // Exchange rate with USDT (1:1 by default)

const threshold = 0.01; // Minimum price deviation to trigger an adjustment


const checkPrice = async () => {
  // const currentPrice = await priceOracle.getAveragePrice(); // get price from Oracle

  const totalSupply = await stablecoinContract.methods.totalSupply().call();
  const usdtBalance = await stablecoinContract.methods.balanceOfUSDT().call();
  return (usdtBalance * 10 ** 18) / (totalSupply );
};

const calculateDifference = (currentPrice, targetPrice) =>{
    
    return currentPrice - targetPrice;
}

const approveUsdt = async (amount) => {
    console.log("asking for approval for amount= ",amount);
    try{
  const allowance = await usdtContract.methods.allowance(ownerAddress, contractAddress).call();
  if (allowance < amount) {
    console.log("allowance= ",allowance, "is greater",allowance < amount);
   let amountbn= Web3.utils.toBN(amount);
    
    const approveTx = approve(contractAddress,amountbn).encodeABI();
    const tx = {
      from: ownerAddress,
      to: usdtAddress,
      gas: 100000,
      gasPrice: 1000000000,
      data: approveTx,
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privatekey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Approved ${amount} USDT for stablecoin minting (transaction hash: ${tx.transactionHash})`);
  }}
  catch(error){
    console.log(error);
  }
};



const adjustSupply = async (difference) => {
  const totalSupply = await stablecoinContract.methods.totalSupply().call(); //120 gusd 
  const usdtBalance = await stablecoinContract.methods.balanceOfUSDT().call();// 130 usdt
  console.log("totalSupply...= ",totalSupply);
  const decimals = await stablecoinContract.methods.decimals().call();
  console.log("decimals",decimals);
  let adjustment =  Math.abs((usdtBalance* 10 ** decimals)-totalSupply)  ;
  adjustment = Math.abs(adjustment)
  console.log("adjustment = ",adjustment );
let price= await checkPrice()
console.log("current price =",price);
  if (price < targetPrice) {
    // If the price exceeds the target price, burn the excess stablecoin
    console.log("price exceeds the target price, burn the excess stablecoin");
    
    let amountbn= Web3.utils.toBN(adjustment);
    const burnTx = burnAdjust(amountbn).encodeABI();
    const tx = {
      from: ownerAddress,
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

    console.log("approved");
    let amountbn= Web3.utils.toBN(adjustment);
    try{const mintTx = mintAdjust(amountbn).encodeABI();
    const tx = {
      from: ownerAddress,
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

const runBot = async () => {
  const currentPrice = await checkPrice();
  const usdtBalance = await stablecoinContract.methods.balanceOfUSDT().call();
  console.log("usdt balance",usdtBalance*10**18);
  const totalSupply = await stablecoinContract.methods.totalSupply().call();
  // console.log(totalSupply);
  let difference = calculateDifference(currentPrice, targetPrice);
  console.log("difference",difference);
//   difference=(Math.ceil(difference)) !== 0 ? Math.ceil(difference) :difference

  if (Math.abs(difference) > threshold) {
  }
  await adjustSupply(difference);
  console.log("---------------------------------------------------");

  const currentPricenew = await checkPrice()
  console.log("New Price after adjustment is = ",currentPricenew);
  console.log("---------------------------------------------------\n");
};





// Change time sheduled by converting time from
// https://www.freeformatter.com/cron-expression-generator-quartz.html
// to cron expression like '* * * * *' 


// Sceduled to be run every minute
cron.schedule('* * * * *', () => {
    runBot();
  }); //PER MINUTE


// cron.schedule('0/30 0 0 * * * *', () => {
//     runBot();
//   }); //PER 30 SECONDs

