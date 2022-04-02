import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
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
import COINS from "../constants/coins";
import CoinAmountInterface from "../CoinSwapper/CoinAmountInterface";
import LoadingButton from "../Components/LoadingButton";
import * as chains from "../constants/chains";

export default function Stake() {
  const { enqueueSnackbar } = useSnackbar();

  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [stakingEps, setStakingEps] = React.useState(
    getEpsStaking("0x536b88CC4Aa42450aaB021738bf22D63DDC7303e", signer)
  );
  const [weth, setWeth] = React.useState(undefined);
  const [panic, setPanic] = React.useState(
    getWeth("0xA882CeAC81B22FC2bEF8E1A82e823e3E9603310B", signer)
  );
  const [aprStaking, setAprStaking] = React.useState(
    getAprFeedStaking("0x69701Bf555bfB3D8b65aD57C78Ebeca7F732002B", signer)
  );
  const [factory, setFactory] = React.useState(undefined);
  const [vestedBalance, setVestedBalance] = React.useState(0);
  const [panicApr, setPanicApr] = React.useState(0);
  const [yvwftmApr, setYvwftmApr] = React.useState(0);
  const [lockedBalance, setLockedBalance] = React.useState("0");
  const [unlockedBalance, setUnlockedBalance] = React.useState("0");
  const [panicRewards, setPanicRewards] = React.useState("0");
  const [panicRewards2, setPanicRewards2] = React.useState("0");
  const [yvWFTMRewards, setYvWFTMRewards] = React.useState("0");

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen, setwrongNetworkOpen] = React.useState(false);

  const [tokenDetails, setTokenDetails] = React.useState({
    address: undefined,
    symbol: "PANIC",
    balance: undefined,
    decimals: 18,
  });

  const [panicBalance, setPanicBalance] = React.useState("0");
  const [panicWeiBalance, setPanicWeiBalance] = React.useState("0");

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
    }

    Network();
  }, [provider, signer]);

  useEffect(() => {
    const updateStakingStats = async () => {
      const promises = [
        stakingEps
          .unlockedBalance(account)
          .then((unlockedBal) =>
            setUnlockedBalance(ethers.utils.formatUnits(unlockedBal))
          ),
        stakingEps
          .withdrawableBalance(account)
          .then(({ 1: vestedBalance }) =>
            setVestedBalance(ethers.utils.formatUnits(vestedBalance) * 2)
          ),
        stakingEps
          .claimableRewards(account)
          .then(({ 1: { 0: panicEarnedFinal } }) =>
            setPanicRewards(ethers.utils.formatUnits(panicEarnedFinal))
          ),
        stakingEps
          .claimableRewards(account)
          .then(([{ 1: panicEarned }, { 1: yvWFTMEarned }]) => {
            setPanicRewards2(ethers.utils.formatUnits(panicEarned));
            setYvWFTMRewards(ethers.utils.formatUnits(yvWFTMEarned));
          }),
        aprStaking
          .getPanicApr()
          .then((panicApr) => setPanicApr(panicApr / 100)),
        aprStaking
          .getFtmApr()
          .then((yvWFTMApr) => setYvwftmApr(yvWFTMApr / 100)),
        stakingEps
          .lockedBalances(account)
          .then(({ 0: panicLockedTotal }) =>
            setLockedBalance(ethers.utils.formatUnits(panicLockedTotal))
          ),
        panic.balanceOf(account).then((bal) => {
          setPanicWeiBalance(bal);
          setPanicBalance(ethers.utils.formatUnits(bal));
        }),
      ];
      await Promise.allSettled(promises);
    };
    updateStakingStats();
  }, [account, panic, stakingEps]);

  async function stakePan(bal, lockrnt) {
    const amountIn = ethers.utils.parseUnits(bal, 18);
    const allo = await panic.allowance(
      account,
      "0x536b88CC4Aa42450aaB021738bf22D63DDC7303e"
    );
    if (Number(allo) < Number(amountIn)) {
      await panic.approve(
        "0x536b88CC4Aa42450aaB021738bf22D63DDC7303e",
        "99999999999999999999999999"
      );
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      await delay(5000);
    }
    await stakingEps.stake(amountIn, lockrnt);
  }
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

  const hasBalance = {
    deposit: () => {
      // @todo
      return false; // returns true if user has balance to deposit
    },
  };

  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 dark:text-white mt-5">
        <div>
          <div className="bg-lightGray mb-3 border-2 border-darkGray dark:border-0 dark:bg-slate-800 dark:text-white p-4 rounded-xl">
            <h4 className="font-display text-lg mr-auto">Balance</h4>
            {/* @todo */}
            {/* @todo --> need to iterate with myArray.map()  */}
            {/* @todo */}
            {/* Panic staked amount */}
            <div className="p-3 bg-white rounded-xl mt-1">
              <div className="flex flex-none">
                <div className="w-1/2 text-left">PANIC</div>
                <div className="w-1/2 text-right">TBA</div>
              </div>
              <div className="flex flex-none">
                <div className="w-1/2 text-left">Staked PANIC</div>
                <div className="w-1/2 text-right">
                  {Number(unlockedBalance).toFixed(2)}
                </div>
              </div>
              <div className="flex flex-none">
                <div className="w-1/2 text-left">Vested PANIC</div>
                <div className="w-1/2 text-right">
                  {Number(vestedBalance).toFixed(2)}
                </div>
              </div>
              <div className="flex flex-none">
                <div className="w-1/2 text-left">Locked PANIC</div>
                <div className="w-1/2 text-right">
                  {Number(lockedBalance).toFixed(2)}
                </div>
              </div>
              <div className="flex flex-none">
                <div className="w-1/2 text-left">bePANIC</div>
                <div className="w-1/2 text-right">TBA</div>
              </div>
            </div>
          </div>
          <div className="bg-lightGray border-2 border-darkGray dark:border-0 dark:bg-slate-800 p-4 rounded-xl flex flex-col">
            <div className="flex-grow">
              <h4 className="font-display text-lg">Stake Panic</h4>
              <p className="dark:text-gray-400 mt-2 mb-10">
                Stake PANIC and earn platform fees in yvWFTM without lock-up.
              </p>
            </div>
            <div className="">
              <CoinAmountInterface
                activeField={true}
                value={field1Value}
                onClick={() => setDialog1Open(true)}
                onChange={handleChange.field1}
                symbol={tokenDetails.symbol}
                userCanChoose={false}
                maxValue={panicBalance}
                decimals={tokenDetails.decimals}
                maxWeiValue={panicWeiBalance}
              />
              <div className="mt-5">
                <LoadingButton
                  loading={loading}
                  valid={true}
                  success={false}
                  fail={false}
                  onClick={() => {
                    stakePan(field1Value, false);
                  }}
                >
                  Deposit
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>

        {/* Stake & lock */}
        <div>
          <div className="bg-lightGray border-2 border-darkGray dark:border-0 dark:bg-slate-800 p-4 rounded-xl">
            <h4 className="font-display text-lg">Stake & Lock Panic</h4>
            <div className="dark:text-gray-400 mt-2 mb-5">
              <p>
                Stake and lock PANIC, earn platform fees in yvWFTM + penalty
                fees in unlocked PANIC.
              </p>
              <p>
                PANIC deposited and locked is subject to a 2 year lock. You will
                continue to earn fees after the locks expire if you do not
                withdraw.
              </p>
            </div>

            <CoinAmountInterface
              activeField={true}
              value={field2Value}
              onClick={() => setDialog2Open(true)}
              onChange={handleChange.field2}
              symbol={tokenDetails.symbol}
              userCanChoose={false}
              decimals={tokenDetails.decimals}
              maxValue={panicBalance}
              maxWeiValue={panicWeiBalance}
            />
            <div className="mt-5">
              <LoadingButton
                loading={loading}
                valid={true}
                success={false}
                fail={false}
                onClick={() => {
                  stakePan(field2Value, true);
                }}
              >
                Lock
              </LoadingButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
