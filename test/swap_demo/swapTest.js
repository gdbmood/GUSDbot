const { expect } = require("chai");
const { ethers } = require("hardhat");
const Web3 = require('web3');
const stabilizer=require('./../testingBot')

describe("StabilizerBot", function () {
    let owner;
    let add;
    let stablecoinContract;
    let usdtContract;
  
    before(async () => {
      [owner, add] = await ethers.getSigners();
        console.log("owner",owner.address);
        console.log("add",add.address);
        const USDT = await ethers.getContractFactory("MockUSDT");
        usdtContract = await USDT.deploy();
        await usdtContract.deployed();
        
        const Contract = await ethers.getContractFactory("Stablecoin");
        stablecoinContract = await Contract.deploy(100,usdtContract.address);
        await stablecoinContract.deployed();
  
  
      await usdtContract.transfer(stablecoinContract.address, 100);
      await usdtContract.transfer(add.address, ethers.utils.parseUnits('10')); // transfer 10usdt to USER who will mint gusd
      await usdtContract.approve(
        stablecoinContract.address,
        ethers.constants.MaxUint256
      );
    });
  
    it("should check the price", async function () {
      const getUSDTBalance=await stablecoinContract.balanceOfUSDT()
      const gettotalSupply=await stablecoinContract.totalSupply()
      // const price = await stablecoinContract

      
      console.log("Usdt Total Supply",getUSDTBalance.toNumber());
      
      console.log("StableCoin Total Supply",parseInt(gettotalSupply.toString())/10**18);
      
      console.log("owner________",owner.address);
      
      console.log("userAddress________",add.address);
      
      console.log("usdtContract address",usdtContract.address);
      
      console.log("stablecoinContract address",stablecoinContract.address);
  
   
    });
  


    it("should mint 1 token for the price of 1 usdt", async function () {
      let userAddress = add.address;

  
      // Get 2nd user balance of USDT
      let userBalanceUSDT = await usdtContract.balanceOf(userAddress);
      console.log("User USDT balance:", (userBalanceUSDT/10**18).toString());
  
      // Get Stablecoin balance
      let stablecoinBalance = await stablecoinContract.balanceOf(userAddress);
      console.log("User Stablecoin balance:", stablecoinBalance.toString());
      
      // Get approval from 2nd account
      await usdtContract.connect(add).approve(stablecoinContract.address, ethers.utils.parseUnits('1'));
      
      // Mint Stablecoin
      await stablecoinContract.connect(add).mint(ethers.utils.parseUnits('1000000000000000000'));
      
      // Check new USDT balance
      let newUserBalanceUSDT = await usdtContract.balanceOf(userAddress);
      let newStablecoinBalance = await stablecoinContract.balanceOf(userAddress);
      console.log("New User USDT balance:", (newUserBalanceUSDT/10**18).toString());
      console.log("New User Stablecoin balance:", (parseInt(newStablecoinBalance/10**36)));
      ethers.utils.parseInt
  
      // Check if the new USDT balance is less than the original balance
      expect(newUserBalanceUSDT).to.be.lt(userBalanceUSDT);
    });




    it("should burn 1 token and USDT balance of user should be greater than previous balance", async function () {
      let userAddress = add.address;
      try{// Get Stablecoin balance
        let stablecoinBalance = await stablecoinContract.balanceOf(userAddress);
          console.log("User Stablecoin balance:", parseInt(stablecoinBalance/10**36));
      // Get the previous USDT balance of the user
      let previousUserBalanceUSDT = await usdtContract.balanceOf(userAddress);
      console.log("Previous User USDT balance:", parseInt(previousUserBalanceUSDT/10**18));
    
      // Get approval from the 2nd account to burn Stablecoin
      await stablecoinContract.connect(add).approve(stablecoinContract.address, ethers.utils.parseUnits('1000000000000000000'));
    
      // Burn 1 Stablecoin
      await stablecoinContract.connect(add).burn(ethers.utils.parseUnits('1000000000000000000'));
      let newStablecoinBalance = await stablecoinContract.balanceOf(userAddress);
      console.log("New User Stablecoin balance:", parseInt(newStablecoinBalance/10**36));
      // Check the new USDT balance
      let newUserBalanceUSDT = await usdtContract.balanceOf(userAddress);
      console.log("New User USDT balance:", parseInt(newUserBalanceUSDT/10**18));
    
      // Check if the new USDT balance is greater than the previous balance
      expect(newUserBalanceUSDT).to.be.gt(previousUserBalanceUSDT);
   } catch(e){
    console.log(e);
   }});
  });

      // it("should mint 1 token for the price of 1 usdt", async function () {
    //   let userAddress='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    //   try{
    //     // await usdtContract.transfer(stablecoinContract.address, 100); // Transfer 100 usdt to user's wallet
    //     // await usdtContract.transfer(add.address, 100); // Transfer 100 usdt to user's wallet
    //     console.log(await stablecoinContract.balanceOf(userAddress));
    //     let userbalnaceUSDT=await usdtContract.balanceOf(userAddress) // get balance of usdt in user wallet BEFORE Mint
    //     const allowance = await usdtContract.allowance(userAddress, stablecoinContract.address)// Request allaowance from user tp spemd usdt on their behalf
    //     const approve = await usdtContract.approve(stablecoinContract.address, '1000') // user gives approval to smart contract to spend 1 usdt to mint 1 token
    //     const  Stablecoin=await stablecoinContract.approve(stablecoinContract.address,'10000000000000000000000')
    //     const mint=await stablecoinContract.mint('1000000000000000000000')
    //     let getStableCoinBalance=await stablecoinContract.balanceOf(userAddress)
    //     console.log("balancesssssssssssssssss",getStableCoinBalance);
    //     let userNewBalnaceUSDT=await usdtContract.balanceOf(userAddress) // get balance of usdt in user wallet AFTER Mint
    //       let check=  await stabilizer.stabilize(usdtContract.address,stablecoinContract.address)
        
    //       console.log(check);
    //       expect(check).to.equal(1);
    //       // 9999999999999999999900
    //  console.log(".................e1");
    //  console.log((userbalnaceUSDT).toString(),"b1");
    //  console.log((userNewBalnaceUSDT).toString(),"b2");
    //  console.log(".................e2",userbalnaceUSDT-userNewBalnaceUSDT);
    // }
    //     catch(e){
    //       console.log(e);
    //     }
    // });
  



      // it("should burn 1 token and transfer usdt in users wallet/eoa", async function () {
    //   let userAddress='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    //   try{
    //     let userbalnaceUSDT=await usdtContract.balanceOf(userAddress) // get balance of usdt in user wallet BEFORE Mint
    //     let getStableCoinBalance=await stablecoinContract.balanceOf(userAddress)
    //     const burn=await stablecoinContract.burn('10000000000000000')
        
    //     let userNewBalnaceUSDT=await usdtContract.balanceOf(userAddress) // get balance of usdt in user wallet AFTER Mint
    //     let newGetStableCoinBalance=await stablecoinContract.balanceOf(userAddress) 
    //     let check=  await stabilizer.stabilize(usdtContract.address,stablecoinContract.address)
        
    //       console.log(check);
    //       // expect(check).to.equal(getStableCoinBalance-1);
   
     
    //   expect(newGetStableCoinBalance).to.equal(0);
    //   expect(userNewBalnaceUSDT).to.equal(userbalnaceUSDT-1);
    // }
    //     catch(e){
    //       console.log(e);
    //     }
    // });
  