//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 10000000 * (10**18));
    }

    // used to make initialization of test wallets easy
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
