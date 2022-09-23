// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract BlueToken is ERC20, Ownable {
  uint256 public maxSupply = 1_000_000 * (10 ** decimals());
  uint256 public cost = 0.01 ether;

  constructor() ERC20("BlueToken", "Blue") {
    _mint(msg.sender, maxSupply);
  }

  function approveContract (address _contract) public onlyOwner {
    approve(_contract, maxSupply);
  }

  function buy(uint256 _buyAmount, address _to) public payable {
    require(msg.value == cost * (_buyAmount / (10 ** decimals())), "Please send 0.01 ETH per BlueToken you want to mint.");
    // if wallet2 calls this function directly, they are msg.sender and do not have ownership of owner's tokens
    transferFrom(owner(), _to, _buyAmount);
  }

  function getBalance() public view onlyOwner returns (uint256) {
    return address(this).balance;
  }

  function withdraw() public payable onlyOwner {
    payable(owner()).transfer(getBalance());
  }
}

contract BuyBlueToken {
  BlueToken blueToken;

  constructor(BlueToken _blueToken) {
    blueToken = _blueToken;
  }

  function buy(uint256 _buyAmount, address _to) public payable {
    blueToken.buy{value: msg.value}(_buyAmount, _to);
  }
}