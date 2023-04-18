// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Stablecoin is ERC20 {
    address public usdtAddress;

    constructor( uint256 initialSupply_, address usdtAddress_) ERC20("stn","STB") {
        _mint(msg.sender, initialSupply_ * 10 ** decimals());
        usdtAddress = usdtAddress_;
    }

    function balanceOfUSDT() external view returns (uint256) {
        IERC20 usdt = IERC20(usdtAddress);
        return usdt.balanceOf(address(this));
    }

    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        uint256 usdtBalance = IERC20(usdtAddress).balanceOf(address(this));
        uint256 totalSupply = totalSupply();
        uint256 newTotalSupply = totalSupply + amount;
        uint256 newUsdtBalance = (usdtBalance*10 ** decimals()) * newTotalSupply / totalSupply;
        IERC20 usdt = IERC20(usdtAddress);
        require(usdt.transferFrom(msg.sender, address(this), newUsdtBalance - usdtBalance), "Transfer failed");
        _mint(msg.sender, amount);
    }

    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
          uint256 usdtBalance = IERC20(usdtAddress).balanceOf(address(this));
        uint256 totalSupply = totalSupply();
        uint256 newTotalSupply = totalSupply - amount;
        uint256 newUsdtBalance = usdtBalance * newTotalSupply / totalSupply;
        _burn(msg.sender, amount);
        IERC20 usdt = IERC20(usdtAddress);
        require(usdt.transfer(msg.sender, usdtBalance - newUsdtBalance), "Transfer failed");
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
