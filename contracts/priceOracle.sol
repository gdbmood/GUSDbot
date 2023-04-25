// // contracts/PriceOracle.sol
// pragma solidity ^0.8.0;

// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// contract PriceOracle {
//     AggregatorV3Interface internal priceFeed;
//     uint256 public constant TWAP_BLOCKS = 10;

//     constructor(address aggregatorAddress) {
//         priceFeed = AggregatorV3Interface(aggregatorAddress);
//     }

//     function getAveragePrice() public view returns (int256) {
//         int256 sum = 0;
//         uint256 count = 0;
//         for (uint256 i = 0; i < TWAP_BLOCKS; i++) {
//             (, int256 price, , uint256 timeStamp, ) = priceFeed.getRoundData(priceFeed.latestRound() - i);
//             if (timeStamp > 0) {
//                 sum += price;
//                 count++;
//             }
//         }
//         return sum / int256(count);
//     }
// }
