import { Contract, BigNumber, ethers } from "ethers";
import * as chains from "./constants/chains";
import COINS from "./constants/coins";
import { checkStable, checkVault } from "./checkstable";

const ROUTER = require("./build/SolidRouter.json");
const ERC20 = require("./build/ERC20.json");
const YFIERC20 = require("./build/YfiVault.json");
const FACTORY = require("./build/SolidFactory.json");
const PAIR = require("./build/SolidPair.json");
const CHEF = require("./build/SolidChef.json");
const APRFEED = require("./build/AprFeed.json");
const APRFEEDSTAKING = require("./build/AprFeedStaking.json");
const EPSSTAKING = require("./build/EpsStaking.json");
const epsStakingAddress = "0x536b88CC4Aa42450aaB021738bf22D63DDC7303e";
const chefAddress = "0xC02563f20Ba3e91E459299C3AC1f70724272D618";
export function getProvider() {
  return new ethers.providers.Web3Provider(window.ethereum);
}

export function getSigner(provider) {
  return provider.getSigner();
}

export async function getNetwork(provider) {
  const network = await provider.getNetwork();
  return network.chainId;
}

export function getRouter(address, signer) {
  return new Contract(address, ROUTER.abi, signer);
}

export function getAprFeed(address, signer) {
  return new Contract(address, APRFEED.abi, signer);
}

export function getAprFeedStaking(address, signer) {
  return new Contract(address, APRFEEDSTAKING.abi, signer);
}

export function getChef(address, signer) {
  return new Contract(address, CHEF.abi, signer);
}

export function getEpsStaking(address, signer) {
  return new Contract(address, EPSSTAKING.abi, signer);
}

export async function checkNetwork(provider) {
  const chainId = getNetwork(provider);
  if (chains.networks.includes(chainId)){
    return true
  }
  return false;
}

export function getWeth(address, signer) {
  return new Contract(address, ERC20.abi, signer);
}

export function getFactory(address, signer) {
  return new Contract(address, FACTORY.abi, signer);
}

export async function getAccount() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

//This function checks if a ERC20 token exists for a given address
//    `address` - The Ethereum address to be checked
//    `signer` - The current signer
export function doesTokenExist(address, signer) {
  try {
    return new Contract(address, ERC20.abi, signer);
  } catch (err) {
    return false;
  }
}

export async function getDecimals(token) {
  const decimals = await token.decimals().then((result) => {
      return result;
    }).catch((error) => {
      console.log(token);
      return 0;
    });
    return decimals;
}

// This function returns an object with 2 fields: `balance` which container's the account's balance in the particular token,
// and `symbol` which is the abbreviation of the token name. To work correctly it must be provided with 4 arguments:
//    `accountAddress` - An Ethereum address of the current user's account
//    `address` - An Ethereum address of the token to check for (either a token or AUT)
//    `provider` - The current provider
//    `signer` - The current signer
export async function getBalanceAndSymbol(
  accountAddress,
  address,
  provider,
  signer,
  isNative,
  coins
) {
  try {
    const token = isNative ? null : new Contract(address, ERC20.abi, signer);
    const tokenDecimals = isNative ? 18 : await getDecimals(token);
    const balanceRaw = isNative ? await provider.getBalance(accountAddress) : await token.balanceOf(accountAddress);
    const symbol = isNative ? "FTM" : await token.symbol();
    return {
      balance: BigNumber.from(balanceRaw)/10**(tokenDecimals),
      symbol: symbol,
      wei: balanceRaw,
      decimals: tokenDecimals,
      address: address,
    }
  } catch (error) {
    console.log ('The getBalanceAndSymbol function had an error!');
    console.log (error)
    return false;
  }
}

// This function swaps two particular tokens / AUT, it can handle switching from AUT to ERC20 token, ERC20 token to AUT, and ERC20 token to ERC20 token.
// No error handling is done, so any issues can be caught with the use of .catch()
// To work correctly, there needs to be 7 arguments:
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `amount` - A float or similar number representing the value of address1's token to trade
//    `routerContract` - The router contract to carry out this trade
//    `accountAddress` - An Ethereum address of the current user's account
//    `signer` - The current signer
export async function swapTokens(
  fullRoute,
  amount,
  routerContract,
  accountAddress,
  isNative,
  isNativeOut,
  signer
) {
  let actualTokens = [];

  for(let i = 0; i < fullRoute.length - 1; i++){
    actualTokens[i] = [fullRoute[i],fullRoute[i+1],checkStable(fullRoute[i], fullRoute[i+1])]
  }
  
  const time = Math.floor(Date.now() / 1000) + 200000;
  const deadline = BigNumber.from(time);

  const token1 = new Contract(fullRoute[0], ERC20.abi, signer);
  const tokenDecimals = await getDecimals(token1);

  const amountIn = ethers.utils.parseUnits(amount, tokenDecimals);

  var actualAmountOut;

  try{
    actualAmountOut = await routerContract.callStatic.getAmountsOut(
    amountIn,
    actualTokens
  );
  }catch{
    console.log("error, maybe no liq on v pair");
  }

  const allowance = await token1.allowance(accountAddress, routerContract.address);
  if(Number(allowance)<amountIn & !isNative){
    await token1.approve(routerContract.address, ethers.constants.MaxUint256);
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(5000);
  }

  if(isNative){
    await routerContract.swapExactETHForTokens(
      BigNumber.from(actualAmountOut[actualAmountOut.length-1]).mul(99).div(100),
      actualTokens,
      accountAddress,
      deadline,
      { value: amountIn }
    );
  } else if(!isNative && isNativeOut){
    await routerContract.swapExactTokensForETH(
      amountIn,
      BigNumber.from(actualAmountOut[actualAmountOut.length-1]).mul(99).div(100),
      actualTokens,
      accountAddress,
      deadline
    );
  } else{
    await routerContract.swapExactTokensForTokens(
      amountIn,
      BigNumber.from(actualAmountOut[actualAmountOut.length-1]).mul(99).div(100),
      actualTokens,
      accountAddress,
      deadline
    );
  }
}

//This function returns the conversion rate between two token addresses
//    `address1` - An Ethereum address of the token to swaped from (either a token or AUT)
//    `address2` - An Ethereum address of the token to swaped to (either a token or AUT)
//    `amountIn` - Amount of the token at address 1 to be swaped from
//    `routerContract` - The router contract to carry out this swap
export async function getAmountOut(
  address1,
  address2,
  amountIn,
  routerContract,
  signer
) {
  console.log("trying to fetch amount out");
  try {
    const token1 = new Contract(address1, ERC20.abi, signer);
    const token1Decimals = await getDecimals(token1);

    const token2 = new Contract(address2, ERC20.abi, signer);
    const token2Decimals = await getDecimals(token2);

    const svalues_out = await routerContract.getAmountsOut(
      ethers.utils.parseUnits(String(amountIn), token1Decimals),
      [[address1, address2, true]]
    );

    console.log("routeV",[[address1, address2, false]]);

    const vvalues_out = await routerContract.getAmountsOut(
      ethers.utils.parseUnits(String(amountIn), token1Decimals),
      [[address1, address2, false]]
    );
    const variablePair = await routerContract.pairFor(address1,address2,false);
    const stablePair = await routerContract.pairFor(address1,address2,true);    
    console.log("s values", svalues_out, "vvalues", vvalues_out);
    const [actualValuesOut, actualPair, stable] = Number(vvalues_out[1]) > Number(svalues_out[1]) ? [vvalues_out[1], variablePair, false]: [svalues_out[1], stablePair, true];

    const pairContract = new Contract(actualPair, PAIR.abi, signer);

    const pairFee = await pairContract.fee();
    const tokenFee = amountIn/pairFee;
    const normalizedFee = 100 / pairFee;

    let priceImpact;// = finalPrice/initialPrice;
    const reserves = await fetchReserves(address1, address2, pairContract, signer);

    if(stable){
      //Price impact is not perfect
      const averagePrice = amountIn/actualValuesOut;
      
      const parsedAmount =   ethers.utils.parseUnits(String(amountIn), token1Decimals);
      const stableValuesStart = await routerContract.getAmountsOut(
        String(parsedAmount).substring(0, String(parsedAmount).length - 2),//todo recursive
        [[address1, address2, true]]
      );
      const valuesOutStart = stableValuesStart[1];
      const startingPrice = (amountIn/100)/valuesOutStart;
      const finalPrice = startingPrice + (averagePrice - startingPrice) * 2;
      
      console.log("STABLE PRICES: ", startingPrice, averagePrice, finalPrice);
      priceImpact = 100-(startingPrice*100/finalPrice)+normalizedFee;
    }
    else{
      const initialPrice = reserves[0]/reserves[1];

      const numerator = (
        reserves[0] +
        Number(amountIn) -
        tokenFee 
      );

      const denominator = (
        reserves[1] -
        (actualValuesOut/10**token2Decimals)
      );

      console.log("PRICEDATA0", reserves[0], reserves[1], amountIn, tokenFee );
      console.log("PRICEDATA1", numerator, denominator);

      const finalPrice = numerator / denominator;
      priceImpact = 100-(initialPrice*100/finalPrice)+normalizedFee;
    }
    const amount_out = actualValuesOut*10**(-token2Decimals);
    console.log('amount out: ', amount_out, 'price impact:', priceImpact, 'tokenFee', tokenFee, "normalizedFee", normalizedFee);


    return [Number(amount_out), priceImpact, tokenFee, normalizedFee];
  } catch {
    return false;
  }
}


//This function returns the conversion rate between two token addresses
//    `address1` - An Ethereum address of the token to swaped from (either a token or AUT)
//    `address2` - An Ethereum address of the token to swaped to (either a token or AUT)
//    `amountIn` - Amount of the token at address 1 to be swaped from
//    `routerContract` - The router contract to carry out this swap
export async function getAmountsOut(
  fullRoute,
  amountIn,
  routerContract,
  signer
) {
  console.log("trying to fetch amounts out");
  try {
    const token1 = new Contract(fullRoute[0], ERC20.abi, signer);
    const token1Decimals = await getDecimals(token1);

    const token2 = new Contract(fullRoute[fullRoute.length-1], ERC20.abi, signer);
    const token2Decimals = await getDecimals(token2);
 
    let finalRoute = [];
    let normalizedFee = 0;
    for(let i = 0; i < fullRoute.length - 1; i++){
      finalRoute[i] = [fullRoute[i],fullRoute[i+1],checkStable(fullRoute[i], fullRoute[i+1])]
      const pair = await routerContract.pairFor(fullRoute[i],fullRoute[i+1],checkStable(fullRoute[i], fullRoute[i+1]));
      const pairC = new Contract(pair, PAIR.abi, signer);
      const pairFee = await pairC.fee();
      normalizedFee += 1/pairFee;
    }
    console.log(finalRoute);

    const parsedAmount = ethers.utils.parseUnits(String(amountIn), token1Decimals);
    const finalAmounts = await routerContract.getAmountsOut(
      parsedAmount,//todo recursive
      finalRoute
    );

    const approxStartingAmounts = await routerContract.getAmountsOut(
      String(parsedAmount).substring(0, String(parsedAmount).length - 2),//todo recursive
      finalRoute
    );

    const averagePrice = amountIn/finalAmounts[finalAmounts.length-1];
    const startingPrice = amountIn/100/approxStartingAmounts[finalAmounts.length-1];
    const finalPrice = startingPrice+(averagePrice-startingPrice)*2;
    const priceImpact = 100-(startingPrice*100/finalPrice)+normalizedFee*100;
    const amount_out = finalAmounts[finalAmounts.length-1]/10**(token2Decimals);
    console.log("priceImpact", priceImpact, "normalizedFee", normalizedFee);
    return [Number(amount_out), priceImpact, Number(amountIn)*normalizedFee, normalizedFee];//TODO add real fees
  }catch(err){
    console.log("multihop quote failed",err);
    return false;
  }
}



// This function calls the pair contract to fetch the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2. Some extra logic was needed to make sure that the results were returned in the correct order, as
// `pair.getReserves()` would always return the reserves in the same order regardless of which order the addresses were.
//    `address1` - An Ethereum address of the token to trade from (either a ERC20 token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a ERC20 token or AUT)
//    `pair` - The pair contract for the two tokens
export async function fetchReserves(address1, address2, pair, signer) {
  try {
    const [vAddress1, vAddress2] = [checkVault(address1), checkVault(address2)];
    // Get decimals for each coin
    const coin1 = new Contract(vAddress1, YFIERC20.abi, signer);
    const coin2 = new Contract(vAddress2, YFIERC20.abi, signer);

    const [coin1Decimals, coin2Decimals, pps1, pps2, pairToken0, pairToken1, reservesRaw] = await Promise.all([
        getDecimals(coin1), getDecimals(coin2),
        vAddress1 != address1 ? coin1.pricePerShare() : 0, vAddress2 != address2 ? coin2.pricePerShare() : 0,
        pair.token0(), pair.token1(),
        // Get reserves
        pair.getReserves()
    ]);

    // Put the results in the right order
    const results =  [
      ethers.utils.getAddress(pairToken0) === ethers.utils.getAddress(vAddress1) ? reservesRaw[0] : reservesRaw[1],
      ethers.utils.getAddress(pairToken1) === ethers.utils.getAddress(vAddress2) ? reservesRaw[1] : reservesRaw[0],
    ];
    // Scale each to the right decimal place
    return [
      (address1 != vAddress1 ? results[0]*pps1*10**(-coin1Decimals*2) : results[0]*10**(-coin1Decimals)),
      (address2 != vAddress2 ? results[1]*pps2*10**(-coin2Decimals*2) : results[1]*10**(-coin2Decimals))
    ]
  } catch (err) {
    console.log("error!");
    console.log(err);
    return [0, 0];
  }
}

// This function returns the reserves stored in a the liquidity pool between the token of address1 and the token
// of address2, as well as the liquidity tokens owned by accountAddress for that pair.
//    `address1` - An Ethereum address of the token to trade from (either a token or AUT)
//    `address2` - An Ethereum address of the token to trade to (either a token or AUT)
//    `factory` - The current factory
//    `signer` - The current signer
export async function getReserves(
  address1,
  address2,
  factory,
  signer,
  accountAddress
) {
  try {
    const [vAddress1, vAddress2] = [checkVault(address1), checkVault(address2)];
    const stable = checkStable(vAddress1, vAddress2);
    const pairAddress = await factory.getPair(vAddress1, vAddress2, stable);
    console.log("pairAddress",pairAddress);
    const pair = new Contract(pairAddress, PAIR.abi, signer);
    if (pairAddress !== '0x0000000000000000000000000000000000000000'){
  
      const reservesRaw = await fetchReserves(address1, address2, pair, signer);
      const liquidityTokens_BN = await pair.balanceOf(accountAddress);
      const liquidityTokens = Number(
        ethers.utils.formatEther(liquidityTokens_BN)
      );
    
      return [
        reservesRaw[0].toPrecision(6),
        reservesRaw[1].toPrecision(6),
        liquidityTokens,
        liquidityTokens_BN
      ];
    } else {
      console.log("no reserves yet");
      return [0,0,0,0];
    }
  }catch (err) {
    console.log("error!");
    console.log(err);
    return [0, 0, 0, 0];
  }
}
