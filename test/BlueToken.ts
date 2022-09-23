import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('BlueToken', function () {
  async function deployBlueToken() {
    const [owner, wallet2] = await ethers.getSigners();

    const BlueToken = await ethers.getContractFactory('BlueToken');
    const blueToken = await BlueToken.deploy();

    const BuyBlueToken = await ethers.getContractFactory('BuyBlueToken');
    const buyBlueToken = await BuyBlueToken.deploy(blueToken.address);

    await blueToken.connect(owner).approveContract(buyBlueToken.address);

    console.log('blueToken address is', blueToken.address);
    console.log('buyBlueToken address is', buyBlueToken.address);
    console.log('wallet1 is', owner.address);
    console.log('wallet2 is', wallet2.address);

    return { blueToken, buyBlueToken, owner, wallet2 };
  }

  async function boughtBlueTokens() {
    const { blueToken, buyBlueToken, owner, wallet2 } = await loadFixture(deployBlueToken);

    // when the user passes in the value, you need to add 18 decimals via ethers.utils.parseUnits('10', 18)
    await buyBlueToken.connect(wallet2).buy(ethers.utils.parseUnits('10', 18), wallet2.address, { value: ethers.utils.parseEther('0.10') });
    const wallet2Balance = await blueToken.balanceOf(wallet2.address);
    const wallet2BalanceFormatted = ethers.utils.formatUnits(wallet2Balance, 18);
    console.log(`wallet2BalanceFormatted: ${wallet2BalanceFormatted}`);

    return { blueToken, buyBlueToken, owner, wallet2 };
  }

  describe('BlueToken tests', function () {
    it('Should mint 1,000,000 tokens to the owner', async function () {
      const { blueToken, owner } = await loadFixture(deployBlueToken);
      const ownerBalance = await blueToken.balanceOf(owner.address);
      console.log(`ownerBalance: ${ownerBalance}`);
    });

    it('wallet2 buys 10 tokens', async function () {
      const { blueToken, buyBlueToken, owner, wallet2 } = await loadFixture(deployBlueToken);

      // when the user passes in the value, you need to add 18 decimals via ethers.utils.parseUnits('10', 18)
      await buyBlueToken.connect(wallet2).buy(ethers.utils.parseUnits('10', 18), wallet2.address, { value: ethers.utils.parseEther('0.10') });
      const wallet2Balance = await blueToken.balanceOf(wallet2.address);
      const wallet2BalanceFormatted = ethers.utils.formatUnits(wallet2Balance, 18);
      console.log(`wallet2BalanceFormatted: ${wallet2BalanceFormatted}`);
    });

    it('owner withdraws ETH balance', async function () {
      const { blueToken, buyBlueToken, owner, wallet2 } = await loadFixture(boughtBlueTokens);

      const balanceBefore = await blueToken.getBalance();
      const balanceBeforeFormatted = ethers.utils.formatUnits(balanceBefore, 18);
      console.log(`balanceBeforeFormatted: ${balanceBeforeFormatted}`);
      await blueToken.connect(owner).withdraw();
      const balanceAfter = await blueToken.getBalance();
      console.log(`balanceAfter: ${balanceAfter}`);
    });
  });
});
