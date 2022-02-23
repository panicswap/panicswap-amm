export function checkStable(address1, address2){
    let isBtc = {};
    let isUsd = {};
    const renbtc = "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501";
    const yvwbtc = "0xd817A100AB8A29fE3DBd925c2EB489D67F758DA9";
    const yvdai = "0x637eC617c86D24E421328e6CAEa1d92114892439";
    const yvusdc = "0xEF0210eB96c7EB36AF8ed1c20306462764935607";
  
    isBtc[yvwbtc.toLowerCase()] = true;
    isBtc[renbtc.toLowerCase()] = true;
    isUsd[yvdai.toLowerCase()] = true;
    isUsd[yvusdc.toLowerCase()] = true;
  
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