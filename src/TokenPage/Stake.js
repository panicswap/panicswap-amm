import React, { useEffect } from "react";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import { CircularProgress } from "@material-ui/core";
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 dark:text-white">
        <div className="w-full">
          {/* Wallet Balance */}
          <div className="bg-lightGray mb-3 w-full md: dark:bg-slate-800 dark:text-white rounded-xl">
            {/* @todo */}
            {/* @todo --> need to iterate with myArray.map()  */}
            {/* @todo */}
            {/* Panic staked amount */}
            <div className="flex justify-between px-3 pb-2 pt-4 bg-lightGray dark:bg-slate-800 rounded-t-xl">
              <h2 className="text text-lg ml-1 font-display">Asset</h2>
              <h2 className="text text-lg ml-auto font-display">Balance</h2>
              <h2 className="text text-lg ml-8 mr-1 font-display">APR</h2>
            </div>
            <div className="flex justify-between -my-1 px-3 py-2 bg-lightGray dark:bg-slate-800 dark:text-gray-400">
              <div className="flex flex-row">
                <img
                  src="assets/token/PANIC.svg"
                  className="flex w-[35px] ml-1 mr-1 rounded-full"
                />
                <div>
                  <h5 className="text ml-1">PANIC</h5>
                  <div className="flex flex-row ml-1">
                    <div>
                      <button
                        className="py-1 px-2 text-xs bg-blue-500 hover:bg-blue-600 rounded-md mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white cursor-pointer text-white font-bold"
                        disabled={false || !true}
                        type="submit"
                        onClick={() => {
                          stakePan(panicBalance, false);
                        }}
                      >
                        Stake All
                      </button>
                      {false && <CircularProgress size={24} />}
                    </div>
                    <div>
                      <button
                        className="py-1 px-2 text-xs bg-blue-500 hover:bg-blue-600 rounded-md dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white cursor-pointer text-white font-bold"
                        disabled={false || !true}
                        type="submit"
                        onClick={() => {
                          stakePan(panicBalance, true);
                        }}
                      >
                        Lock All
                      </button>
                      {false && <CircularProgress size={24} />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center">
                <h5 className="text flex justify-end text-right">
                  {Number(panicBalance).toFixed(2)}
                </h5>
                <div className="w-20">
                  <h5 className="text flex mr-1 justify-end text-right">0%</h5>
                </div>
              </div>
            </div>
            <div className="flex justify-between px-3 py-2 bg-lightGray dark:bg-slate-800 dark:text-gray-400">
              <div className="flex flex-row">
                <img
                  src="assets/token/PANIC.svg"
                  className="flex w-[35px] ml-1 mr-1 rounded-full"
                />
                <div>
                  <h5 className="text ml-1">Staked PANIC</h5>
                  <div className="flex flex-row ml-1">
                    <div>
                      <button
                        className="py-1 px-2 text-xs bg-blue-500 hover:bg-blue-600 rounded-md dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white cursor-pointer text-white font-bold"
                        disabled={false || !true}
                        type="submit"
                        onClick={() => {
                          withdrawUnlocked();
                        }}
                      >
                        Unstake All
                      </button>
                      {false && <CircularProgress size={24} />}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center">
                <h5 className="text flex justify-end text-right">
                  {Number(unlockedBalance).toFixed(2)}
                </h5>
                <div className="w-20">
                  <h5 className="text flex justify-end mr-1 text-right">
                    {yvwftmApr.toFixed(2) + "%"}
                  </h5>
                </div>
              </div>
            </div>

            <div className="flex justify-between px-3 py-2 bg-lightGray dark:bg-slate-800 dark:text-gray-400">
              <div className="flex flex-row">
                <img
                  src="assets/token/PANIC.svg"
                  className="flex w-[35px] ml-1 mr-1 rounded-full"
                />
                <div>
                  <h5 className="text ml-1">Vested PANIC</h5>
                  <div className="flex flex-row ml-1">
                    <div>
                      <button
                        className="py-1 px-2 text-xs bg-blue-500 hover:bg-blue-600 rounded-md dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white cursor-pointer text-white font-bold"
                        disabled={false || !true}
                        type="submit"
                        onClick={() => {
                          exit();
                        }}
                      >
                        Exit Vesting (-50%)
                      </button>
                      {false && <CircularProgress size={24} />}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center">
                <h5 className="text flex justify-end text-right">
                  {Number(vestedBalance).toFixed(2)}
                </h5>
                <div className="w-20">
                  <h5 className="text flex justify-end mr-1 text-right">
                    {yvwftmApr.toFixed(2) + "%"}
                  </h5>
                </div>
              </div>
            </div>
            <div className="flex justify-between px-3 pt-2 pb-4 bg-lightGray dark:bg-slate-800 dark:text-gray-400 rounded-b-xl">
              <div className="flex flex-row">
                <img
                  src="assets/token/PANIC.svg"
                  className="flex w-[35px] ml-1 mr-1 rounded-full"
                />
                <h5 className="text ml-1">Locked PANIC</h5>
              </div>
              <div className="flex flex-row items-center">
                <h5 className="text flex justify-end text-right">
                  {Number(lockedBalance).toFixed(2)}
                </h5>
                <div className="w-20">
                  <h5 className="text flex justify-end mr-1 text-right">
                    {(yvwftmApr + panicApr).toFixed(2) + "%"}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="w-full md: bg-lightGray dark:bg-slate-800 p-3 rounded-xl mb-3">
            <div className="flex flex-row">
              <h4 className="text-xl font-display mb-3 p-1 w-8/12">Rewards</h4>
              <div className="ml-auto p-1">
                <button
                  className="px-2 py-1 text-md bg-blue-500 hover:bg-blue-600 w-28 rounded-md dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white cursor-pointer text-white font-bold transition-colors"
                  disabled={false || !true}
                  type="submit"
                  onClick={() => {
                    getReward();
                  }}
                >
                  Claim
                </button>
                {false && <CircularProgress size={24} />}
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <div className="ml-1">
                <h4 className="font-display">PANIC</h4>
                <div className="dark:text-gray-300">{panicApr + "%"} APR</div>
              </div>
              <div className="flex items-center">
                <div>{Number(panicRewards2).toFixed(2)}</div>
                <img
                  src="assets/token/PANIC.svg"
                  className="flex w-[23px] ml-2 mr-1 rounded-full"
                ></img>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="ml-1">
                <div className="font-display">yvWFTM</div>
                <div className="dark:text-gray-300">{yvwftmApr + "%"} APR</div>
              </div>
              <div className="flex items-center">
                <div>{Number(yvWFTMRewards).toFixed(2)}</div>
                <img
                  src="assets/token/yvWFTM.svg"
                  className="flex w-[23px] ml-2 mr-1 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Stake */}
          <div className="w-full md: bg-lightGray dark:bg-slate-800 p-4 rounded-xl flex flex-col">
            <div className="flex-grow">
              <h4 className="font-display text-lg">Stake Panic</h4>
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

        {/*Tokenomics Explanation */}
        <div className="w-full col-start-1 md:col-start-auto">
          <div className="w-full bg-lightGray dark:bg-slate-800 p-4 rounded-xl flex flex-col mb-3">
            <div className="flex-grow">
              <h4 className="font-display text-lg">Tokenomics</h4>
              <h5 className="text-md font-display mt-3 mb-1 dark:text-blue-300">
                Staked PANIC
              </h5>
              <p className="dark:text-gray-400">
                Earns fees generated by the PanicSwap protocol.
              </p>
              <p className="dark:text-gray-400">
                Fees are collected from users paying fees to make a swap and
                converted to yvWFTM, a yield-bearing version of wrapped FTM.
              </p>
              <p className="dark:text-gray-400">
                Earned yvWFTM is available to stakers without any lock-up.
              </p>
              <h5 className="text-md font-display mt-3 mb-1 dark:text-blue-300">
                Vested PANIC
              </h5>
              <p className="dark:text-gray-400">
                Earned by{" "}
                <a href="/farms" className="text-blue-300">
                  farming
                </a>{" "}
                PANIC. Earns staking rewards.
              </p>
              <p className="dark:text-gray-400">
                PANIC is vested for 2 years. A user can choose to cancel this
                vesting period and claim tokens immediately for a 50% fee that
                is paid to users who lock PANIC.
              </p>
              <h5 className="text-md font-display mt-3 mb-1 dark:text-blue-300">
                Staked & Locked PANIC
              </h5>
              <p className="dark:text-gray-400">
                Earns staking rewards and aforementioned penalty fees caused by
                farmers exiting their vested positions early.
              </p>
              <p className="dark:text-gray-400">
                Locked PANIC is subject to a mandatory 2 years lock and cannot
                be unlocked early. You will continue to earn fees after the
                locks expire if you do not withdraw.
              </p>
            </div>
          </div>

          {/* Stake & lock */}
          <div>
            <div className="w-full md: bg-lightGray dark:bg-slate-800 p-4 rounded-xl">
              <h4 className="font-display text-lg">Stake & Lock Panic</h4>
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
        </div>
      </section>
    </div>
  );
}
