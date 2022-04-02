import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
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
  getBalanceAndSymbol,
  getWeth,
  getChef,
  swapTokens,
  getReserves,
  getPoolInfo,
  getUserInfo,
} from "../ethereumFunctions";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import COINS from "../constants/coins";
import * as chains from "../constants/chains";
import CoinAmountInterface from "../Liquidity/CoinAmountInterface";
import { ethers } from "ethers";
import { FarmItems } from "../FarmList/FarmItems";

function FarmDetails(props) {
  const { enqueueSnackbar } = useSnackbar();
  const { farmId } = useParams();

  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [weth, setWeth] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);
  const [chef, setChef] = React.useState(
    getChef("0xC02563f20Ba3e91E459299C3AC1f70724272D618", signer)
  );

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen, setwrongNetworkOpen] = React.useState(false);

  const [lpDetails, setLpDetails] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
    decimals: 18,
  });

  const [coins, setCoins] = React.useState([]);

  // Stores the current value of their respective text box
  const [field1Value, setField1Value] = React.useState("");
  const [field2Value, setField2Value] = React.useState("");

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  const [balanceWallet, setBalanceWallet] = React.useState("0");
  const [balanceWeiWallet, setBalanceWeiWallet] = React.useState(0);
  const [balanceStaked, setBalanceStaked] = React.useState("0");
  const [balanceWeiStaked, setBalanceWeiStaked] = React.useState(0);

  // These functions take an HTML event, pull the data out and puts it into a state variable.
  const handleChange = {
    field1: (e) => {
      setField1Value(e.target.value);
    },
    field2: (e) => {
      setField2Value(e.target.value);
    },
  };

  // This hook will run when the component first mounts, it can be useful to put logic to populate variables here
  useEffect(() => {
    getAccount().then((account) => {
      setAccount(account);
    });

    // getBalanceAndSymbol(account, coin2.address, provider, signer, weth.address, coins).then(

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
        //getUserInfo(farmId,chef,signer);
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
    }

    Network();
  }, [provider, signer]);

  useEffect(() => {
    const updateBalance = async () => {
      if (chef) {
        const uInfo = await chef.userInfo(farmId, account);
        setBalanceWeiStaked(uInfo["amount"]);
        setBalanceStaked(ethers.utils.formatUnits(uInfo["amount"]));
        const pInfo = await chef.poolInfo(farmId);
        const lpt = pInfo["lpToken"];
        console.log(lpt);
        const lptC = getWeth(lpt, signer);
        const balWal = await lptC.balanceOf(account);
        setBalanceWeiWallet(balWal);
        setBalanceWallet(ethers.utils.formatUnits(balWal));
      }
    };
    updateBalance();
  }, [chef, account, farmId, signer]);

  async function deposit(amount) {
    await chef;

    const amountIn = ethers.utils.parseUnits(amount, 18);

    const pInfo = await chef.poolInfo(farmId);
    const lpt = pInfo["lpToken"];
    console.log(lpt);
    const lptC = getWeth(lpt, signer);
    console.log("approving", amountIn);

    const allowance = await lptC.allowance(
      account,
      "0xC02563f20Ba3e91E459299C3AC1f70724272D618"
    );
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    console.log("allowance", allowance);
    if (allowance < amountIn) {
      await lptC.approve(
        "0xC02563f20Ba3e91E459299C3AC1f70724272D618",
        "99999999999999999999999999999"
      );
      await delay(5000);
    }
    await chef.deposit(farmId, amountIn);
  }

  async function withdraw(amount) {
    await chef;

    const amountIn = ethers.utils.parseUnits(amount, 18);

    await chef.withdraw(farmId, amountIn);
  }

  const hasBalance = {
    deposit: () => {
      // @todo
      return true; // returns true if user has balance to deposit
    },
    withdraw: () => {
      // @todo
      return true; // returns true if user has balance to withdraw
    },
  };

  return (
    <div className="px-2">
      <WrongNetwork open={wrongNetworkOpen} />
      <div className="max-w-md mx-auto bg-lightGray dark:from-transparent dark:to-transparent dark:bg-slate-800 dark:text-white rounded-3xl p-3 shadow-lg">
        <div className="flex p-2 justify-left">
          {/* Title */}
          <div className="md:text-lg font-bold font-display">
            {FarmItems[farmId >= 11 ? farmId - 2 : farmId - 1].title}
          </div>
        </div>

        {/* Deposit */}
        <div className="mb-4">
          <div>
            <CoinAmountInterface
              value={field1Value}
              maxValue={balanceWallet}
              maxWeiValue={balanceWeiWallet}
              onChange={handleChange.field1}
              decimals={lpDetails.decimals}
              symbol1={
                FarmItems[farmId >= 11 ? farmId - 2 : farmId - 1].symbol1
              }
              symbol2={
                FarmItems[farmId >= 11 ? farmId - 2 : farmId - 1].symbol2
              }
            />
          </div>
          <div className="py-1">
            <LoadingButton
              loading={loading}
              valid={hasBalance.deposit()}
              success={false}
              fail={false}
              onClick={() => {
                deposit(field1Value);
              }}
            >
              Stake
            </LoadingButton>
          </div>
        </div>
        {/* Withdraw */}
        <div>
          <div>
            <CoinAmountInterface
              value={field2Value}
              maxValue={balanceStaked}
              maxWeiValue={balanceWeiStaked}
              onChange={handleChange.field2}
              decimals={lpDetails.decimals}
              symbol1={
                FarmItems[farmId >= 11 ? farmId - 2 : farmId - 1].symbol1
              }
              symbol2={
                FarmItems[farmId >= 11 ? farmId - 2 : farmId - 1].symbol2
              }
            />
          </div>
          <div className="py-1">
            <LoadingButton
              loading={loading}
              valid={hasBalance.withdraw()}
              success={false}
              fail={false}
              onClick={() => {
                withdraw(field2Value);
              }}
            >
              Unstake
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmDetails;
