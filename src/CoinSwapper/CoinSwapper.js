import { AiOutlineSwap } from "react-icons/ai";

import React, { useEffect } from "react";
import {
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SwapVerticalCircleIcon from "@material-ui/icons/SwapVerticalCircle";
import { useSnackbar } from "notistack";
import LoopIcon from "@material-ui/icons/Loop";
import {
  getAccount,
  getFactory,
  getProvider,
  getRouter,
  getSigner,
  getNetwork,
  getAmountOut,
  getAmountsOut,
  getBalanceAndSymbol,
  getWeth,
  swapTokens,
  getReserves,
} from "../ethereumFunctions";
import CoinAmountInterface from "./CoinAmountInterface";
import CoinDialog from "./CoinDialog";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import COINS from "../constants/coins";
import * as chains from "../constants/chains";
import CoinField from "./CoinField";
import { ethers } from "ethers";
import { checkRoute } from "../checkstable";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
  },
  switchButton: {
    zIndex: 1,
    margin: "-10px",
    padding: theme.spacing(0.5),
  },
  fullWidth: {
    width: "100%",
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
  orange: {
    color: "orange",
  },
  red: {
    color: "red",
  },
  green: {
    color: "green",
  },
});

const useStyles = makeStyles(styles);

function CoinSwapper(props) {
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

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  const [priceImpact, setPriceImpact] = React.useState([]);
  const [tokenFee, setTokenFee] = React.useState([]);
  const [pairFee, setPairFee] = React.useState([]);

  // Switches the top and bottom coins, this is called when users hit the swap button or select the opposite
  // token in the dialog (e.g. if coin1 is TokenA and the user selects TokenB when choosing coin2)
  const switchFields = () => {
    setCoin1(coin2);
    setCoin2(coin1);
    setField1Value(field2Value);
    setReserves(reserves.reverse());
  };

  // These functions take an HTML event, pull the data out and puts it into a state variable.
  const handleChange = {
    field1: (e) => {
      setField1Value(e.target.value);
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
    // If both coins have been selected, and a valid float has been entered which is less than the user's balance, then return true
    try {
      const parsedInput1 = parseFloat(field1Value);
      const parsedInput2 = parseFloat(field2Value);
      return (
        coin1.address &&
        coin2.address &&
        !isNaN(parsedInput1) &&
        !isNaN(parsedInput2) &&
        0 < parsedInput1 &&
        Number(ethers.utils.parseUnits(field1Value, coin1.decimals)) <=
          Number(coin1.wei)
      );
    } catch {
      return false;
    }
  };

  // Called when the dialog window for coin1 exits
  const onToken1Selected = ([address, abbr]) => {
    // Close the dialog window
    setDialog1Open(false);

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
        abbr == "FTM" ? true : false,
        coins
      ).then((data) => {
        setCoin1({
          address: address,
          symbol: abbr,
          balance: data.balance,
          decimals: data.decimals,
          wei: data.wei,
        });
      });
    }
  };

  function warningSeverity(priceImpact) {
    if (!priceImpact) return undefined;
    if (Number(priceImpact) < 1) return classes.green;
    if (Number(priceImpact) < 5) return classes.orange;
    return classes.red;
  }

  function FormattedPriceImpact(priceImpact) {
    if (priceImpact < 0.01) return "<0.01";
    if (priceImpact > 50) return ">50";
    else return priceImpact.toFixed(2);
  }
  // Called when the dialog window for coin2 exits
  const onToken2Selected = ([address, abbr]) => {
    // Close the dialog window
    setDialog2Open(false);

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
        abbr == "FTM" ? true : false,
        coins
      ).then((data) => {
        setCoin2({
          address: address,
          symbol: abbr,
          balance: data.balance,
          decimals: data.decimals,
          wei: data.wei,
        });
      });
    }
  };

  // Calls the swapTokens Ethereum function to make the swap, then resets nessicary state variables
  const swap = () => {
    console.log("Attempting to swap tokens...");
    setLoading(true);

    console.log("COIN1", coin1);

    const fullRoute = checkRoute(coin1["address"], coin2["address"]);

    swapTokens(
      fullRoute,
      field1Value,
      router,
      account,
      coin1.symbol == "FTM" ? true : false,
      coin2.symbol == "FTM" ? true : false,
      signer
    )
      .then(() => {
        setLoading(false);

        // If the transaction was successful, we clear to input to make sure the user doesn't accidental redo the transfer
        setField1Value("");
        enqueueSnackbar("Transaction Successful", { variant: "success" });
      })
      .catch((e) => {
        setLoading(false);
        enqueueSnackbar("Transaction Failed (" + e.message + ")", {
          variant: "error",
          autoHideDuration: 10000,
        });
      });
  };

  // The lambdas within these useEffects will be called when a particular dependency is updated. These dependencies
  // are defined in the array of variables passed to the function after the lambda expression. If there are no dependencies
  // the lambda will only ever be called when the component mounts. These are very useful for calculating new values
  // after a particular state change, for example, calculating the new exchange rate whenever the addresses
  // of the two coins change.

  // This hook is called when either of the state variables `coin1.address` or `coin2.address` change.
  // This means that when the user selects a different coin to convert between, or the coins are swapped,
  // the new reserves will be calculated.
  useEffect(() => {
    console.log(
      "Trying to get Reserves M2 between:\n" +
        coin1.address +
        "\n" +
        coin2.address
    );
    // ToDo reserves
    if (coin1.address && coin2.address) {
      getReserves(coin1.address, coin2.address, factory, signer, account).then(
        (data) => setReserves(data)
      );
      console.log("fetched");
    }
  }, [coin1.address, coin2.address, account, factory, router, signer]);

  // This hook is called when either of the state variables `field1Value` `coin1.address` or `coin2.address` change.
  // It attempts to calculate and set the state variable `field2Value`
  // This means that if the user types a new value into the conversion box or the conversion rate changes,
  // the value in the output box will change.
  useEffect(() => {
    if (isNaN(parseFloat(field1Value))) {
      setField2Value("");
    } else if (parseFloat(field1Value) && coin1.address && coin2.address) {
      const fullRoute = checkRoute(coin1["address"], coin2["address"]);
      console.log(fullRoute);
      if (fullRoute.length == 2) {
        getAmountOut(coin1.address, coin2.address, field1Value, router, signer)
          .then((data) => {
            setField2Value(Number(data[0]).toFixed(7));
            setPriceImpact(Number(data[1]).toFixed(2));
            setTokenFee(Number(data[2]).toFixed(7));
            //setPairFee(data[3].toFixed(2));
          })
          .catch((e) => {
            console.log(e);
            setField2Value("NA");
          });
      } else if (fullRoute.length > 2) {
        for (let i = 0; i < fullRoute.length; i++) {
          getAmountsOut(fullRoute, field1Value, router, signer)
            .then((data) => {
              setField2Value(Number(data[0]).toFixed(7));
              setPriceImpact(Number(data[1]).toFixed(2));
              setTokenFee(Number(data[2]).toFixed(7));
              //setPairFee(data[3].toFixed(2));
            })
            .catch((e) => {
              console.log(e);
              setField2Value("NA");
            });
        }
      }
    } else {
      setField2Value("");
    }
  }, [field1Value, coin1.address, coin2.address, router, signer]);

  // This hook creates a timeout that will run every ~10 seconds, it's role is to check if the user's balance has
  // updated has changed. This allows them to see when a transaction completes by looking at the balance output.
  useEffect(() => {
    const coinTimeout = setTimeout(() => {
      console.log("Checking balances...");

      if (coin1.address && coin2.address && account) {
        getReserves(
          coin1.address,
          coin2.address,
          factory,
          signer,
          account
        ).then((data) => setReserves(data));
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
    }, 4000);

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
          console.log("Weth: ", wethAddress);
          setWeth(getWeth(wethAddress, signer));
          // Set the value of the weth address in the default coins array
          const coins = COINS.get(chainId);
          setCoins(coins);
        });
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
            symbol: "BTC",
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
            symbol: "ETH",
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
    <div className="px-2 md:mt-14">
      <WrongNetwork open={wrongNetworkOpen} />
      <div className="max-w-md mx-auto bg-blue-100 bg-gradient-to-bl from-blue-300 to-blue-100 dark:bg-slate-800 dark:bg-gradient-to-tr dark:from-transparent dark:to-transparent rounded-3xl p-3 shadow-lg">
        <h3 className="text-xl font-bold p-3 dark:text-gray-400 font-display text-center">
          Swap
        </h3>

        {/* Dialog Windows */}
        <CoinDialog
          open={dialog1Open}
          onClose={onToken1Selected}
          coins={coins}
          signer={signer}
        />
        <CoinDialog
          open={dialog2Open}
          onClose={onToken2Selected}
          coins={coins}
          signer={signer}
        />

        {/* Coin Swapper */}
        <div>
          <div>
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
          </div>

          {/* Field switcher */}
          <div className="flex justify-center mt-1 mb-6">
            <div
              onClick={switchFields}
              className="rotate-90 p-3 bg-gradient-to-br from-blue-500 to-blue-300 rounded-full transition-all hover:scale-105 text-lg cursor-pointer"
            >
              <AiOutlineSwap />
            </div>
          </div>

          <div className="-mt-5">
            {/* Second coin input */}
            <CoinField
              activeField={false}
              value={field2Value}
              onClick={() => setDialog2Open(true)}
              symbol={coin2.symbol !== undefined ? coin2.symbol : "Select"}
              maxValue={coin2.balance}
            />
          </div>

          {coin1.symbol && coin2.symbol && (
            <>
              {field1Value && (
                <section className="mt-4 dark:text-gray-300">
                  {/* Price per token */}
                  <div className="grid grid-cols-2">
                    <div>
                      <div className="text-sm">
                        {coin1.symbol} per 1 {coin2.symbol}
                      </div>
                      <div className="font-bold">
                        {Number(field1Value / field2Value).toPrecision(7)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm">
                        {coin2.symbol} per 1 {coin1.symbol}
                      </div>
                      <div className="font-bold">
                        {Number(field2Value / field1Value).toPrecision(7)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="">
                      <h4 className="font-bold">Price Impact</h4>
                      <div
                        className={`${
                          Number(priceImpact) < 5
                            ? "text-green-500"
                            : Number(priceImpact) > 10
                            ? "text-red-500"
                            : "text-orange-500"
                        }`}
                      >
                        {FormattedPriceImpact(Number(priceImpact)) + "%"}
                      </div>
                    </div>

                    <div>
                      {/* Price per token */}
                      <h4 className="font-bold">Fee (Paid To Stakers)</h4>
                      <div>{Number(tokenFee) + " " + coin1.symbol}</div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          <div className="mt-5">
            <LoadingButton
              loading={loading}
              valid={isButtonEnabled()}
              success={false}
              fail={false}
              onClick={swap}
            >
              Swap
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinSwapper;
