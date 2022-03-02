export function checkStable(address1, address2){
    let isBtc = {};
    let isUsd = {};
    const renbtc = "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501";
    const yvwbtc = "0xd817A100AB8A29fE3DBd925c2EB489D67F758DA9";
    const yvdai = "0x637eC617c86D24E421328e6CAEa1d92114892439";
    const yvusdc = "0xEF0210eB96c7EB36AF8ed1c20306462764935607";
  
    const dai = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
    const wftm = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
    const wbtc = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
    const weth = "0x74b23882a30290451A17c44f4F05243b6b58C76d";
    const usdc = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
    const yfi  = "0x29b0Da86e484E1C0029B56e817912d778aC0EC69";

    isBtc[yvwbtc.toLowerCase()] = true;
    isBtc[wbtc.toLowerCase()] = true;
    isBtc[renbtc.toLowerCase()] = true;
    isUsd[yvdai.toLowerCase()] = true;
    isUsd[yvusdc.toLowerCase()] = true;
    isUsd[dai.toLowerCase()] = true;
    isUsd[usdc.toLowerCase()] = true;
  
    let result = false;
    try {
      if(isBtc[address1.toLowerCase()] && isBtc[address2.toLowerCase()]) result = true
    }catch{
      
    }  try {
      if(isUsd[address1.toLowerCase()] && isUsd[address2.toLowerCase()]) result = true
    }catch{
      
    }
    return result;
  }

export function checkVault(address){
  let vault = {};
  const dai = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";
  const wftm = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
  const wbtc = "0x321162Cd933E2Be498Cd2267a90534A804051b11";
  const weth = "0x74b23882a30290451A17c44f4F05243b6b58C76d";
  const usdc = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
  const yfi  = "0x29b0Da86e484E1C0029B56e817912d778aC0EC69";
  
  const yvdai = "0x637ec617c86d24e421328e6caea1d92114892439";
  const yvwftm = "0x0DEC85e74A92c52b7F708c4B10207D9560CEFaf0";
  const yvwbtc = "0xd817A100AB8A29fE3DBd925c2EB489D67F758DA9";
  const yvweth = "0xCe2Fc0bDc18BD6a4d9A725791A3DEe33F3a23BB7";
  const yvusdc = "0xEF0210eB96c7EB36AF8ed1c20306462764935607";
  const yvyfi  = "0x2C850cceD00ce2b14AA9D658b7Cad5dF659493Db";

  vault[dai.toLowerCase()] = yvdai;
  vault[wftm.toLowerCase()] = yvwftm;
  vault[wbtc.toLowerCase()] = yvwbtc;
  vault[weth.toLowerCase()] = yvweth;
  vault[usdc.toLowerCase()] = yvusdc;
  vault[yfi.toLowerCase()] = yvyfi;
  try{
    if(vault[String(address).toLowerCase()])
      return vault[String(address).toLowerCase()];
    return address;
  }catch{
    return address;
  }
}