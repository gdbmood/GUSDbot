const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3 = require('web3');
const stabilizer=require('./testingBot')
describe("StabilizerBot", function () {
  let owner;
  let add;
  let stablecoinContract;
  let usdtContract;

  before(async () => {
    [owner, add] = await ethers.getSigners();
      
      const USDT = await ethers.getContractFactory("MockUSDT");
      usdtContract = await USDT.deploy();
      await usdtContract.deployed();
      
      const Contract = await ethers.getContractFactory("Stablecoin");
      stablecoinContract = await Contract.deploy(100,usdtContract.address);
      await stablecoinContract.deployed();


    await usdtContract.transfer(stablecoinContract.address, 100);
    await usdtContract.approve(
      stablecoinContract.address,
      ethers.constants.MaxUint256
    );
  });

  it("should check the price", async function () {
    const getUSDTBalance=await stablecoinContract.balanceOfUSDT()
    const gettotalSupply=await stablecoinContract.totalSupply()
    // const price = await stablecoinContract
    console.log(getUSDTBalance.toNumber());
    console.log(parseInt(gettotalSupply.toString())/10**18);
    console.log("add________",add.address);
    console.log("usdtContract.address",usdtContract.address);
    console.log("stablecoinContract.address",stablecoinContract.address);

  try{
  let check=  await stabilizer.stabilize(usdtContract.address,stablecoinContract.address)

  console.log(check);
  expect(check).to.equal(1);
}
  catch(e){
    console.log(e);
  }
  });

  it("should not Mint or Burn if price is 1", async function () {
    const TargetPrice = 1;
    try{
      let check=  await stabilizer.stabilize(usdtContract.address,stablecoinContract.address)
    
      console.log(check);
      expect(check).to.equal(TargetPrice);
    }
      catch(e){
        console.log(e);
      }
  });



  it("should adjust the supply by minting stablecoin", async function () {
   
  //  ustabilize stablecoin by increasing price by transfering usdt
    await usdtContract.transfer(stablecoinContract.address, 100);
    try{
      let check=  await stabilizer.stabilize(usdtContract.address,stablecoinContract.address)
    
      console.log(check);
      expect(check).to.equal(1);
    }
      catch(e){
        console.log(e);
      }
  });
  it("should adjust the supply by burning stablecoin", async function () {
    const Mint = await stablecoinContract.mintAdjust("10000000000000000000")
    try{
      let check=  await stabilizer.stabilize(usdtContract.address,stablecoinContract.address)
    
      console.log(check);
      expect(check).to.equal(1);
    }
      catch(e){
        console.log(e);
      }
  });
});
