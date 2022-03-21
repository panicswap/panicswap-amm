import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FarmItems } from "./FarmItems";
import { formatNumber } from "../helpers/numberFormatter";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import { useSnackbar } from "notistack";
import { ethers } from "ethers";
import {
  getAccount,
  getFactory,
  getProvider,
  getRouter,
  getSigner,
  getNetwork,
  getWeth,
  getChef,
  getAprFeed,
} from "../ethereumFunctions";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import COINS from "../constants/coins";
import * as chains from "../constants/chains";


function FarmList(props) {
  const { enqueueSnackbar } = useSnackbar();

  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(getAccount());
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [weth, setWeth] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);
  const [chef, setChef] = React.useState(getChef("0xC02563f20Ba3e91E459299C3AC1f70724272D618", signer));
  const [aprFeed, setAprFeed] = React.useState(getAprFeed("0x427dFbF4376aB621586fe0F218F5E28E1389ff7f", signer));
  const [aprMap, setAprMap] = React.useState([]);
  const [lpAddressMap, setLpAddressMap] = React.useState([]);
  const [userStakedLPs, setUserStakedLPs] = React.useState([]);
  const [userHeldLPs, setUserHeldLPs] = React.useState([]);
  const [tvlMap, setTvlMap] = React.useState([]);
  const [totalSupplyMap, setTotalSupplyMap] = React.useState([]);
  const [yfiMap, setYfiMap] = React.useState([]);
  const [poolLength, setPoolLength] = React.useState(0);

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen, setwrongNetworkOpen] = React.useState(false);
  const [pendingPanic, setPendingPanic] = React.useState("");
  const [coins, setCoins] = React.useState([]);

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  // Sum all values in a list
  function add(accumulator, a) {
    return accumulator + a;
  }

  // This hook will run when the component first mounts, it can be useful to put logic to populate variables here
  useEffect(() => {
    async function Network() {
      chef.poolLength().then(setPoolLength)
      const chainId = await getNetwork(provider).then((chainId) => {
        setChainId(chainId);
        return chainId;
      });
      if (chains.networks.includes(chainId)) {
        setwrongNetworkOpen(false);
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
        // Get the factory address from the router
        await router.factory().then((factory_address) => {
          setFactory(getFactory(factory_address, signer));
        });
      } else {
        setwrongNetworkOpen(true);
      }
    }

    Network();
  }, [chef, provider, signer]);
  

  useEffect(() => {
    const updatePanicRewards = async () => {
      try {
        const reward = await chef.totalClaimableReward(account);
        setPendingPanic(ethers.utils.formatUnits(reward));
      } catch(error) {
        console.error("error getting chef.totalClaimableReward", {error});
      }
    }
    updatePanicRewards();
    const updateIntervalHandle = setInterval(() => updatePanicRewards(), 15000);
    return () => clearInterval(updateIntervalHandle);
  }, [setPendingPanic, account, chef]);
  
  useEffect(() => {
    const updateFarmStats = async () => {
      const aprPromises = [];
      const tvlPromises = [];
      const tokenInfoPromises = [];
      const userInfoPromises = [];

      fetch('https://api.yearn.finance/v1/chains/250/vaults/all')
      .then(response => response.json())
      .then((data) =>{
        let newYfiMap = {};
        newYfiMap["renBTC"] = 0;
        newYfiMap["XFTM"] = 0;
        newYfiMap["PANIC"] = 0;
        newYfiMap["fBEETS"] = 60;
        newYfiMap["BELUGA"] = 0;
        //TODO fBEETS
        for(let i = 0; i < data.length; i++){
          newYfiMap[data[i]["display_name"]] = Number(data[i]["apy"]["points"]["week_ago"])*100
        }
        setYfiMap(newYfiMap);
      });

      for (let i = 1; i < poolLength; ++i) {
        tokenInfoPromises.push(chef.poolInfo(i));
        aprPromises.push(aprFeed.yvApr(i));
        tvlPromises.push(aprFeed.lpValueDollarChef(i));
        userInfoPromises.push(chef.userInfo(i, account));
      }
      await Promise.all([
        Promise.allSettled(tokenInfoPromises).then((results) => {
          const newTokenInfoMap = []
          const tokenHeldPromises = [];
          const totalSupplyPromises = [];
          results.forEach((result, index) => {
            const { value: v, status } = result;
            if (status === "fulfilled") {
              newTokenInfoMap[index] = v["lpToken"];
              const LpToken = getWeth(ethers.utils.getAddress(v["lpToken"]), signer);
              tokenHeldPromises[index] = LpToken.balanceOf(account);
              totalSupplyPromises[index] = LpToken.totalSupply();
            }
          })
          setLpAddressMap(newTokenInfoMap);
          Promise.allSettled(tokenHeldPromises).then((results) => {
            const newTokenHeldMap = [];
            results.forEach((result, index) => {
              const { value: v, status } = result;
              if (status === "fulfilled") {
                newTokenHeldMap[index] = (Number(v)/1e18).toFixed(8);
              }
            })
            setUserHeldLPs(newTokenHeldMap);
          })
          Promise.allSettled(totalSupplyPromises).then((results) => {
            const newTotalSupplyMap = [];
            results.forEach((result, index) => {
              const { value: v, status } = result;
              if (status === "fulfilled") {
                newTotalSupplyMap[index] = (Number(v)/1e18).toFixed(8);
              }
            })
            setTotalSupplyMap(newTotalSupplyMap);
          })
        }),
        Promise.allSettled(userInfoPromises).then((results) => {
          const newStakedAmountMap = []
          results.forEach((result, index) => {
            const { value: v, status } = result;
            if (status === "fulfilled") {
              newStakedAmountMap[index] = (Number(v["amount"])/1e18).toFixed(8);
            }
          })
          setUserStakedLPs(newStakedAmountMap);
        }),
        Promise.allSettled(aprPromises).then((results) => {
          const newAprMap = []
          results.forEach((result, index) => {
            const { value: v, status } = result;
            if (status === "fulfilled") {
              newAprMap[index] = Number(v)/100
            }
          })
          setAprMap(newAprMap);
        }),
        Promise.allSettled(tvlPromises).then((results) => {
          const newTvlMap = []
          results.forEach((result, index) => {
            const { value: v, status } = result;
            if (status === "fulfilled") {
              newTvlMap[index] = (Number(v)/1e18).toFixed(0);
            }
          })
          setTvlMap(newTvlMap);
        })
      ]);
    }
    updateFarmStats();
    const updateFarmInterval = setInterval(() => updateFarmStats(), 60000);
    return () => clearInterval(updateFarmInterval);
  }, [chef, aprFeed, setAprMap, setTvlMap, poolLength])

  async function claimAllRewards() {
    await chef;
    chef.claimAll();
  }

  const hasPendingRewards = () => {
    // @todo

    return false; // returns true if user has pending rewards
  };

  return (
    <div className="mx-2">
      <WrongNetwork open={wrongNetworkOpen} />

      {/* Rewards */}
      <section className="border-2 border-blue-200 m-2 mx-auto max-w-4xl p-3 rounded-2xl bg-gradient-to-bl from-blue-300 to-blue-100">
        <div className="flex justify-between">
          <div>
            <h3 className="text-3xl font-bold">Rewards</h3>
            <p className="text-base leading-none">
              Collect <strong>$PANIC</strong> rewards earned by farming
            </p>
          </div>

          <div>
            <LoadingButton
              loading={loading}
              valid={true}
              success={false}
              fail={false}
              onClick={() => {
                claimAllRewards();
              }}
            >
              <AccountBalanceIcon />
              Collect Rewards
            </LoadingButton>
          </div>
        </div>
        {/* {formatBalance(coin1.balance, coin1.symbol)} */}

        <div className="mt-2 flex items-center">
          <img
            src="assets/token/PANIC.svg"
            className="max-w-[50px] border-3 border-blue-400 rounded-full"
            alt="PANIC logo"
          />
          <div className="ml-2">
            <div className="flex">
              <div className="text-4xl font-bold">
                {formatNumber(pendingPanic, 3)}
              </div>
              <div className="text-sm self-end ml-1">PANIC</div>
            </div>
          </div>
        </div>
      </section>

      {/* Farms */}
      <section className="border-2 border-blue-200 m-3 mx-auto max-w-4xl py-3 px-3 rounded-2xl bg-gradient-to-bl from-blue-300 to-blue-100">
        <div className="mb-4">
          <h3 className="text-3xl font-bold">Farms</h3>
          <p>Stake LP tokens to earn</p>
        </div>

        <div>
          {FarmItems.map((item, index) => {
            return (
              <div className="p-1 sm:p-2 mt-2 hover:bg-blue-200 transition-colors rounded-xl" key={item.title}>
                <div className="flex justify-between">
                  {/* Logos */}
                  <div className="flex items-center w-3/4">
                    <img
                      className="max-w-[25px] sm:max-w-[33px]"
                      src={"/assets/token/" + item.symbol1 + ".svg"}
                    ></img>
                    <img
                      className="max-w-[25px] sm:max-w-[33px] relative left-[-9px]"
                      src={"/assets/token/" + item.symbol2 + ".svg"}
                    ></img>

                    {/* Title */}
                    <div className="md:text-lg font-bold">{item.title}</div>
                  </div>

                  <div>
                    <Link
                      to={item.url}
                      className="inline-block px-4 py-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg hover:no-underline text-white transition-all"
                    >
                      Select
                    </Link>
                  </div>
                </div>

                <div className="mt-1 md:ml-[7px] grid grid-cols-[1fr_2fr_2fr_1fr_1fr] gap-2 w-full max-w-sm">
                <div className="">
                    <div className="text-sm">APR</div>
                    <div className="md:text-md">
                      {(aprMap[item.poolid-1] + ( yfiMap[item.symbol1] + yfiMap[item.symbol2])/2).toFixed(2) + "%" }
                    </div>
                  </div>
                  <div className="">
                    <div className="text-sm">Balance</div>
                    <div className="md:text-md">
                      { userHeldLPs[item.poolid-1] }
                      <span className="md:text-xs">
                        &nbsp;(${isNaN((tvlMap[item.poolid-1]*userHeldLPs[item.poolid-1]/totalSupplyMap[item.poolid-1])) ? 0 : (tvlMap[item.poolid-1]*userHeldLPs[item.poolid-1]/totalSupplyMap[item.poolid-1]).toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <div className="">
                    <div className="text-sm">Staked</div>
                    <div className="md:text-md">
                      { userStakedLPs[item.poolid-1] }
                      <span className="md:text-xs">
                        &nbsp;(${isNaN((tvlMap[item.poolid-1]*userStakedLPs[item.poolid-1]/totalSupplyMap[item.poolid-1])) ? 0 : (tvlMap[item.poolid-1]*userStakedLPs[item.poolid-1]/totalSupplyMap[item.poolid-1]).toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">TVL</div>
                    <div className="md:text-md">
                      {"$"+tvlMap[item.poolid-1]}
                    </div>
                  </div>
                  <div className="">
                    <div className="text-sm">Multiplier</div>
                    <div className="md:text-md">
                      {"x" + item.boost}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default FarmList;
