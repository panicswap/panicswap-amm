import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";
import LoadingButton from "../Components/LoadingButton";
import React, { useEffect } from "react";
import { ethers } from "ethers";
import * as chains from "../constants/chains";
import COINS from "../constants/coins";

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
  swapTokens,
  getReserves,
  getEpsStaking,
  getAprFeedStaking,
} from "../ethereumFunctions";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  rowClaimAll: {
    backgroundColor: theme.palette.action.hover,
    borderBottom: "3px solid #ccc",
  },
  smallTokenIcon: {
    width: "20px",
    marginLeft: "5px",
    marginRight: "5px",
    marginBottom: "2px",
  },
});

const useStyles = makeStyles(styles);

export default function Rewards() {
  const classes = useStyles();
  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [stakingEps, setStakingEps] = React.useState(
    getEpsStaking("0x536b88CC4Aa42450aaB021738bf22D63DDC7303e", signer)
  );
  const [aprStaking, setAprStaking] = React.useState(
    getAprFeedStaking("0x69701Bf555bfB3D8b65aD57C78Ebeca7F732002B", signer)
  );
  const [weth, setWeth] = React.useState(undefined);
  const [panic, setPanic] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);
  const [vestedBalance, setVestedBalance] = React.useState(0);
  const [panicApr, setPanicApr] = React.useState(0);
  const [yvwftmApr, setYvwftmApr] = React.useState(0);
  const [unlockedBalance, setUnlockedBalance] = React.useState("0");
  const [panicRewards, setPanicRewards] = React.useState("0");
  const [yvWFTMRewards, setYvWFTMRewards] = React.useState("0");

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen, setwrongNetworkOpen] = React.useState(false);

  const [tokenDetails, setTokenDetails] = React.useState({
    address: undefined,
    symbol: undefined,
    balance: undefined,
  });

  const [panicBalance, setPanicBalance] = React.useState("0");

  const [coins, setCoins] = React.useState([]);

  // Stores the current value of their respective text box
  const [field1Value, setField1Value] = React.useState("");
  const [field2Value, setField2Value] = React.useState("");

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  // These functions take an HTML event, pull the data out and puts it into a state variable.
  const handleChange = {
    field1: (e) => {
      setField1Value(e.target.value);
    },
    field2: (e) => {
      setField2Value(e.target.value);
    },
  };

  // This hook will run when the component first mounts, it can be useful to put logs to populate variables here
  useEffect(() => {
    getAccount().then((account) => {
      setAccount(account);
    });

    async function Network() {
      const chainId = await getNetwork(provider);
      setChainId(chainId);
      if (chains.networks.includes(chainId)) {
        setwrongNetworkOpen(false);
        console.log("chainID: ", chainId);
        // Get the router using the chainID
        const router = await getRouter(
          chains.routerAddress.get(chainId),
          signer
        );
        setRouter(router);
        setPanic(getWeth("0xA882CeAC81B22FC2bEF8E1A82e823e3E9603310B", signer));
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
    const updateRewards = async () => {
      const promises = [
        stakingEps
          .unlockedBalance(account)
          .then((unlockedBal) =>
            setUnlockedBalance(ethers.utils.formatUnits(unlockedBal))
          ),
        stakingEps
          .withdrawableBalance(account)
          .then(({ 1: penaltyData }) =>
            setVestedBalance(ethers.utils.formatUnits(penaltyData) * 2)
          ),
        stakingEps
          .claimableRewards(account)
          .then(([{ 1: panicEarned }, { 1: yvWFTMEarned }]) => {
            setPanicRewards(ethers.utils.formatUnits(panicEarned));
            setYvWFTMRewards(ethers.utils.formatUnits(yvWFTMEarned));
          }),
        aprStaking
          .getPanicApr()
          .then((panicApr) => setPanicApr(panicApr / 100)),
        aprStaking
          .getFtmApr()
          .then((yvWFTMApr) => setYvwftmApr(yvWFTMApr / 100)),
      ];
      await Promise.allSettled(promises);
    };
    updateRewards();
  }, [account, panic, stakingEps, aprStaking]);

  async function exit() {
    await stakingEps;
    await stakingEps.exit();
  }

  async function getReward() {
    await stakingEps;
    await stakingEps.getReward();
  }

  async function withdrawUnlocked() {
    await stakingEps;
    const amount = await stakingEps.unlockedBalance(account);
    await stakingEps.withdraw(amount);
  }

  return (
    <div>
      <div className="grid grid-cols-2 mt-10 gap-5 p-2">
        <section className="dark:text-white">
          <h4 className="font-display text-lg">Liquidity Providers</h4>
          <div className="dark:text-gray-200">
            earning PANIC from LP + yvWFTM
          </div>
          <ul className="dark:text-gray-400">
            <li>
              PANIC rewards are subject to a 2 year vesting period, but can also
              be claimed early at a 50% penalty.
            </li>
            <li>
              Vested PANIC earns Dividends in the form of yvWFTM, which is
              accrued every block, and claimable at any time with no fees.
            </li>
            <li>
              Exiting before the end of the vesting period always incurs a 50%
              penalty on rewards only no matter how early or late you choose to
              exit. The penalty is distributed continuously to PANIC lockers
              rewarding the long-term holders.
            </li>
          </ul>
        </section>

        <section className="dark:text-white">
          <h4 className="font-display text-lg">For Lockers</h4>
          <div className="dark:text-gray-300">
            earning PANIC from penalties + yvWFTM
          </div>
          <ul className="dark:text-gray-400">
            <li>
              Locked PANIC is subject to a mandatory 2 years lock and cannot be
              unlocked early.
            </li>
            <li>
              PANIC rewards and Dividends in the form of yvWFTM can be claimed
              anytime with no penalty.
            </li>
            <li>
              Lock dates are grouped by the week. Any lock between Monday to
              Sunday is grouped in the same week group, and will release at the
              same time 2 years later.
            </li>
          </ul>
        </section>
      </div>

      <section className="grid grid-cols-3 gap-2 items-start  dark:text-white">
        {/* Unlocked PANIC */}
        <div className="bg-lightGray border-2 border-darkGray dark:bg-slate-800 p-3 rounded-xl">
          <h4 className="text-xl font-display mb-3 p-1">Staked PANIC</h4>
          <div className="dark:bg-slate-900 rounded-lg flex p-2 justify-end text-lg mb-2">
            <div>{Number(unlockedBalance).toFixed(6)}</div>

            <img
              src="assets/token/PANIC.svg"
              className={classes.smallTokenIcon}
            />
          </div>
          <div>
            <LoadingButton
              loading={false}
              valid={true}
              success={false}
              fail={false}
              onClick={() => {
                withdrawUnlocked();
              }}
            >
              Unstake
            </LoadingButton>
          </div>
        </div>

        {/* PANIC Stake and Lock Rewards */}
        <div className="bg-lightGray border-2 border-darkGray dark:bg-slate-800 p-3 rounded-xl">
          <h4 className="text-xl font-display mb-3 p-1">Rewards</h4>
          <div className="flex justify-between mb-2">
            <div>
              <h4 className="font-display">PANIC</h4>
              <div className="dark:text-gray-300">{panicApr + "%"} APR</div>
            </div>
            <div className="flex items-center">
              <div>{Number(panicRewards).toFixed(2)}</div>
              <img
                src="assets/token/PANIC.svg"
                className={classes.smallTokenIcon}
              ></img>
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <div className="font-display">yvWFTM</div>
              <div className="dark:text-gray-300">{yvwftmApr + "%"} APR</div>
            </div>
            <div className="flex items-center">
              <div>{Number(yvWFTMRewards).toFixed(2)}</div>
              <img
                src="assets/token/yvWFTM.svg"
                className={classes.smallTokenIcon}
              />
            </div>
          </div>
          <div className="mt-5">
            <LoadingButton
              loading={false}
              valid={true}
              success={false}
              fail={false}
              onClick={() => {
                getReward();
              }}
            >
              Claim
            </LoadingButton>
          </div>
        </div>

        {/* Claim all above */}
        <div className="bg-lightGray border-2 border-darkGray dark:bg-slate-800 p-3 rounded-xl">
          <h4 className="text-xl font-display mb-3 p-1">Exit vesting</h4>
          <div className="dark:bg-slate-900 rounded-lg flex p-2 justify-end text-lg mb-2">
            <div>{Number(vestedBalance / 2).toFixed(6)}</div>

            <img
              src="assets/token/PANIC.svg"
              className={classes.smallTokenIcon}
            />
          </div>
          <div>
            <LoadingButton
              loading={false}
              valid={true}
              success={false}
              fail={false}
              onClick={() => {
                exit();
              }}
            >
              Exit
            </LoadingButton>
          </div>
        </div>
      </section>
    </div>
  );
}
