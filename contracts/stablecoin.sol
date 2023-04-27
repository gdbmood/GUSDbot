// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Stablecoin is ERC20 {
    address public usdtAddress;

    constructor( uint256 initialSupply_, address usdtAddress_) ERC20("gusdt","GUsd") {
        _mint(msg.sender, initialSupply_ * 10 ** decimals());
        usdtAddress = usdtAddress_;
    }

    function balanceOfUSDT() external view returns (uint256) {
        IERC20 usdt = IERC20(usdtAddress);
        return usdt.balanceOf(address(this));
    }

    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        IERC20 usdt = IERC20(usdtAddress);
     
         usdt.transferFrom(msg.sender, address(this), (amount / (10 ** decimals())));
        _mint(msg.sender, amount);
    }

    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        IERC20 usdt = IERC20(usdtAddress);
        require(usdt.transfer(msg.sender, amount / 10 ** decimals()), "Transfer failed");
         _burn(msg.sender, amount);
    }
        function burnAdjust(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        _burn(address(this), amount);
        
    }
        function mintAdjust(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        _mint(address(this), amount);
    }
}
