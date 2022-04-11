import React, { useEffect } from "react";
import { Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import { useSnackbar } from "notistack";
import {
  getAccount,
  getFactory,
  getProvider,
  getRouter,
  getSigner,
  getBalanceAndSymbol,
  getWeth,
  getReserves,
  getNetwork,
} from "../ethereumFunctions";

import CoinField from "../CoinSwapper/CoinField";
import { addLiquidity, quoteAddLiquidity } from "./LiquidityFunctions";

import CoinAmountInterface from "../CoinSwapper/CoinAmountInterface";
import CoinDialog from "../CoinSwapper/CoinDialog";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import COINS from "../constants/coins";
import * as chains from "../constants/chains";
import { BigNumber, Contract } from "ethers";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    width: "40%",
    overflow: "wrap",
    background: "#e5e5e5",
  },
  fullWidth: {
    width: "100%",
  },
  values: {
    width: "50%",
  },
  title: {
    textAlign: "center",
    padding: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  hr: {
    width: "100%",
  },
  balance: {
    padding: theme.spacing(1),
    overflow: "wrap",
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.4),
  },
  subText: {
    fontSize: "13px",
  },
  rightSideBottomText: {
    textAlign: "right",
  },
  leftSideBottomText: {
    textAlign: "left",
  },
  liquidityIcon: {
    width: "20px",
    marginLeft: "3px",
    marginBottom: "5px",
  },
});

const useStyles = makeStyles(styles);

function LiquidityDeployer(props) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [weth, setWeth] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen, setwrongNetworkOpen] = React.useState(false);

  // Stores data about their respective coin
  const [coin1, setCoin1] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
    decimals: undefined,
    wei: undefined,
  });
  const [coin2, setCoin2] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
    decimals: undefined,
    wei: undefined,
  });

  const [coins, setCoins] = React.useState([]);

  // Stores the current reserves in the liquidity pool between coin1 and coin2
  const [reserves, setReserves] = React.useState(["0.0", "0.0"]);

  // Stores the current value of their respective text box
  const [field1Value, setField1Value] = React.useState("");
  const [field2Value, setField2Value] = React.useState("");

  const [balanceMap, setBalanceMap] = React.useState("");

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  // Stores the user's balance of liquidity tokens for the current pair
  const [liquidityTokens, setLiquidityTokens] = React.useState("");

  // Used when getting a quote of liquidity
  const [liquidityOut, setLiquidityOut] = React.useState([0, 0, 0]);

  // Switches the top and bottom coins, this is called when users hit the swap button or select the opposite
  // token in the dialog (e.g. if coin1 is TokenA and the user selects TokenB when choosing coin2)
  const switchFields = () => {
    let oldField1Value = field1Value;
    let oldField2Value = field2Value;

    setCoin1(coin2);
    setCoin2(coin1);
    setField1Value(oldField2Value);
    setField2Value(oldField1Value);
    setReserves(reserves.reverse());
  };

  // These functions take an HTML event, pull the data out and puts it into a state variable.
  const handleChange = {
    field1: (e) => {
      setField1Value(e.target.value);
    },
    field2: (e) => {
      setField2Value(e.target.value);
    },
  };

  // Turns the account's balance into something nice and readable
  const formatBalance = (balance, symbol) => {
    if (balance && symbol)
      return parseFloat(balance).toPrecision(8) + " " + symbol;
    else return "0.0";
  };

  // Turns the coin's reserves into something nice and readable
  const formatReserve = (reserve, symbol) => {
    if (reserve && symbol) return reserve + " " + symbol;
    else return "0.0";
  };

  // Determines whether the button should be enabled or not
  const isButtonEnabled = () => {
    // If both coins have been selected, and a valid float has been entered for both, which are less than the user's balances, then return true
    const parsedInput1 = parseFloat(field1Value);
    const parsedInput2 = parseFloat(field2Value);
    return (
      coin1.address &&
      coin2.address &&
      !isNaN(parsedInput1) &&
      !isNaN(parsedInput2) &&
      0 < parsedInput1 &&
      0 < parsedInput2 &&
      Number(ethers.utils.parseUnits(field1Value, coin1.decimals)) <= Number(coin1.wei) &&
      Number(ethers.utils.parseUnits(field2Value, coin2.decimals)) <= Number(coin2.wei)
    );
  };

  const deploy = () => {
    console.log("Attempting to deploy liquidity...");
    setLoading(true);

    // TODO frontrunning exteranl instead of internal
    addLiquidity(
      coin1.address,
      coin2.address,
      field1Value,
      field2Value,
      "0",
      "0",
      coin1.symbol == "FTM" ? true : false,
      coin2.symbol == "FTM" ? true : false,
      router,
      account,
      signer
    )
      .then(() => {
        setLoading(false);

        // If the transaction was successful, we clear to input to make sure the user doesn't accidental redo the transfer
        setField1Value("");
        setField2Value("");
        enqueueSnackbar("Deployment Successful", { variant: "success" });
      })
      .catch((e) => {
        setLoading(false);
        enqueueSnackbar("Deployment Failed (" + e.message + ")", {
          variant: "error",
          autoHideDuration: 10000,
        });
      });
  };

  // Called when the dialog window for coin1 exits
  const onToken1Selected = ([address, abbr]) => {
    // Close the dialog window
    setDialog1Open(false);

    const isNative = abbr == "FTM" ? true : false;

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === coin2.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      // Getting some token data is async, so we need to wait for the data to return, hence the promise
      getBalanceAndSymbol(
        account,
        address,
        provider,
        signer,
        isNative,
        coins
      ).then((data) => {
        setCoin1({
          address: address,
          symbol: data.symbol,
          balance: data.balance,
          decimals: data.decimals,
          wei: data.wei,
        });
      });
    }
  };

  // Called when the dialog window for coin2 exits
  const onToken2Selected = ([address, abbr]) => {
    // Close the dialog window
    setDialog2Open(false);

    const isNative = abbr == "FTM" ? true : false;

    // If the user inputs the same token, we want to switch the data in the fields
    if (address === coin1.address) {
      switchFields();
    }
    // We only update the values if the user provides a token
    else if (address) {
      // Getting some token data is async, so we need to wait for the data to return, hence the promise
      getBalanceAndSymbol(
        account,
        address,
        provider,
        signer,
        isNative,
        coins
      ).then((data) => {
        setCoin2({
          address: address,
          symbol: data.symbol,
          balance: data.balance,
          decimals: data.decimals,
          wei: data.wei,
        });
      });
    }
  };

  // This hook is called when either of the state variables `coin1.address` or `coin2.address` change.
  // This means that when the user selects a different coin to convert between, or the coins are swapped,
  // the new reserves will be calculated.
  // ToDo reserves
  useEffect(() => {
    console.log(
      "Trying to get reserves M1 between:\n" +
        coin1.address +
        "\n" +
        coin2.address
    );
    if (coin1.address && coin2.address && account) {
      getReserves(coin1.address, coin2.address, factory, signer, account).then(
        (data) => {
          setReserves([data[0], data[1]]);
          setLiquidityTokens(data[2]);
        }
      );
    }
  }, [coin1.address, coin2.address, account, factory, signer]);

  // This hook is called when either of the state variables `field1Value`, `field2Value`, `coin1.address` or `coin2.address` change.
  // It will give a preview of the liquidity deployment.
  useEffect(() => {
    if (coin1.address && coin2.address && field1Value) {
      console.log("fill other field");
      const oneTrillion = String(BigNumber.from(1e12));
      const [amount1, amount2] = [field1Value, oneTrillion];
      quoteAddLiquidity(
        coin1.address,
        coin2.address,
        amount1,
        amount2,
        factory,
        signer
      ).then((data) => {
        // console.log(data);
        console.log("TokenA in: ", data[0]);
        console.log("TokenB in: ", data[1]);
        setField2Value(String(data[1]));
        console.log("Liquidity out: ", data[2]);
        setLiquidityOut([data[0], data[1], data[2]]);
        console.log("fill Finished");
      });
    }
  }, [coin1.address, coin2.address, field1Value, factory, signer]);

  // This hook creates a timeout that will run every ~10 seconds, it's role is to check if the user's balance has
  // updated has changed. This allows them to see when a transaction completes by looking at the balance output.
  useEffect(() => {
    const coinTimeout = setTimeout(() => {
      console.log("Checking balances & Getting reserves...");

      if (coin1.address && coin2.address && account) {
        getReserves(
          coin1.address,
          coin2.address,
          factory,
          signer,
          account
        ).then((data) => {
          setReserves([data[0], data[1]]);
          setLiquidityTokens(data[2]);
        });
      }

      if (coin1.address && account && !wrongNetworkOpen) {
        getBalanceAndSymbol(
          account,
          coin1.address,
          provider,
          signer,
          coin1.symbol == "FTM" ? true : false,
          coins
        ).then((data) => {
          setCoin1({
            ...coin1,
            balance: data.balance,
            decimals: data.decimals,
            wei: data.wei,
          });
        });
      }
      if (coin2.address && account && !wrongNetworkOpen) {
        getBalanceAndSymbol(
          account,
          coin2.address,
          provider,
          signer,
          coin2.symbol == "FTM" ? true : false,
          coins
        ).then((data) => {
          setCoin2({
            ...coin2,
            balance: data.balance,
            decimals: data.decimals,
            wei: data.wei,
          });
        });
      }
    }, 10000);

    return () => clearTimeout(coinTimeout);
  });

  // This hook will run when the component first mounts, it can be useful to put logic to populate variables here
  useEffect(() => {
    getAccount().then((account) => {
      setAccount(account);
    });

    async function Network() {
      const chainId = await getNetwork(provider).then((chainId) => {
        setChainId(chainId);
        return chainId;
      });

      if (chains.networks.includes(chainId)) {
        setwrongNetworkOpen(false);
        console.log("chainID: ", chainId);
        // Get the router using the chainID
        const router = await getRouter(
          chains.routerAddress.get(chainId),
          signer
        );
        setRouter(router);
        // Get Weth address from router
        await router.weth().then((wethAddress) => {
          setWeth(getWeth(wethAddress, signer));
          // Set the value of the weth address in the default coins array
          const coins = COINS.get(chainId);
          setCoins(coins);
        });

        const balancePromises = [];

        for(let i = 0; i < coins.length; i++){
          if(i==0){
            balancePromises[i] = getBalanceAndSymbol(account,coins[i]["address"],provider,signer,true,coins);
            continue;
          }
          balancePromises[i] = getBalanceAndSymbol(account,coins[i]["address"],provider,signer,false,coins);
        }
        Promise.allSettled(balancePromises).then((results) => {
          const newBalanceMap = [];
          results.forEach((result, index) => {
            const { value: v, status } = result;
            if (status === "fulfilled") {
              newBalanceMap[v["symbol"] == "FTM" ? "FTM" :v["address"]] = v["balance"];//(Number(v) / 1e18).toFixed(0);
            }
          });
          setBalanceMap(newBalanceMap);
        })

        // Get the factory address from the router
        await router.factory().then((factory_address) => {
          setFactory(getFactory(factory_address, signer));
        });
      } else {
        console.log("Wrong network mate.");
        setwrongNetworkOpen(true);
      }

      if (!coin1.address && !coin2.address) {
        getBalanceAndSymbol(
          account,
          "0x321162Cd933E2Be498Cd2267a90534A804051b11", //wbtc
          provider,
          signer,
          false,
          coins
        ).then((data) => {
          setCoin1({
            address: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
            symbol: "WBTC",
            balance: data.balance,
            decimals: data.decimals,
            wei: data.wei,
          });
        });

        getBalanceAndSymbol(
          account,
          "0x74b23882a30290451A17c44f4F05243b6b58C76d", //weth
          provider,
          signer,
          false,
          coins
        ).then((data) => {
          setCoin2({
            address: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
            symbol: "WETH",
            balance: data.balance,
            decimals: data.decimals,
            wei: data.wei,
          });
        });
      }
    }

    Network();
  }, [account, coin1.address, coin2.address, coins, provider, signer]);

  return (
    <div>
      {/* Liquidity deployer */}

      {/* Dialog Windows */}
      <CoinDialog
        open={dialog1Open}
        onClose={onToken1Selected}
        coins={coins}
        signer={signer}
        balanceMap={balanceMap}
      />
      <CoinDialog
        open={dialog2Open}
        onClose={onToken2Selected}
        coins={coins}
        signer={signer}
        balanceMap={balanceMap}
      />
      <WrongNetwork open={wrongNetworkOpen} />

      <CoinAmountInterface
        activeField={true}
        value={field1Value}
        onClick={() => setDialog1Open(true)}
        onChange={handleChange.field1}
        symbol={coin1.symbol !== undefined ? coin1.symbol : "Select"}
        maxValue={coin1.balance}
        decimals={coin1.decimals}
        maxWeiValue={coin1.wei}
      />
      <div className="mb-2"></div>
      <CoinField
        activeField={false}
        value={field2Value}
        onClick={() => setDialog2Open(true)}
        onChange={handleChange.field2}
        symbol={coin2.symbol !== undefined ? coin2.symbol : "Select"}
        maxValue={coin2.balance}
        decimals={coin2.decimals}
        maxWeiValue={coin2.wei}
      />

      {/* Tokens in */}
      {coin1.symbol && coin2.symbol && (
        <section className="mt-3">
          {/* Reserves Display */}

          <div className="mt-3">
            <h3 className="font-bold">You Will Receive</h3>
            {liquidityOut[2] + " " + coin1.symbol + "-" + coin2.symbol + " LP"}
          </div>
        </section>
      )}

      {/* Button */}
      <div className="mt-3">
        <LoadingButton
          loading={loading}
          valid={isButtonEnabled()}
          success={false}
          fail={false}
          onClick={deploy}
        >
          <AccountBalanceIcon className={classes.buttonIcon} />
          Deploy
        </LoadingButton>
      </div>
    </div>
  );
}

export default LiquidityDeployer;
