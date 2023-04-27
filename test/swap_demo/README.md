# Stablecoin Swap Tests

## Description

#### These tests are designed to verify the functionality of a stablecoin contract that can perform simple swaps. When a stablecoin (Gusd) is minted, the equivalent amount of USDT should be deducted from the user's wallet. When an Gusd is burned, the corresponding USDT amount should be returned to the user's wallet.


## Tests

### Test 1: Minting Stablecoin

This test checks whether the stablecoin contract can properly mint a new stablecoin. When a user mints an SC, the equivalent amount of USDT should be deducted from their wallet. The test performs the following steps:

1. Initializes the stablecoin and USDT contracts
2. Transfers 100 USDT to the stablecoin contract
3. Transfers 10 USDT to the 2nd account for minting stablecoin (to popultae users wallet)
4. Gets the user's USDT balance
5. Gets the stablecoin balance of the user
6. Gets approval from the account to mint stablecoin
7. Mints stablecoin for the user
8. Checks the new USDT balance, which should be less than the original balance

### Test 2: Burning Stablecoin

This test verifies whether the stablecoin contract can correctly burn an existing stablecoin. When a user burns an SC, the equivalent amount of USDT should be returned to their wallet. The test performs the following steps:

1. Gets the previous USDT balance of the user
2. Gets approval from the account to burn stablecoin
3. Burns 1 stablecoin for the user
4. Checks the new USDT balance of the user, which should be greater than the previous balance

# Steps To Run Swap Demo Test
### 1 Run Hardhat Node
```
npx hardhat node
```
### 2 Run Test Script
```
npx hardhat test test/swap_demo/swapTest.js --network localhost
```
