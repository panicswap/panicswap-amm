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

const usdNumberFormat = new Intl.NumberFormat("us-EN", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const percentNumberFormat = new Intl.NumberFormat("us-EN", {
  style: "percent",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function FarmList(props) {
  const { enqueueSnackbar } = useSnackbar();

  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [weth, setWeth] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);
  const [chef, setChef] = React.useState(undefined);
  const [aprFeed, setAprFeed] = React.useState(undefined);
  const [aprMap, setAprMap] = React.useState([]);
  const [tvlMap, setTvlMap] = React.useState([]);

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
        const aprFeed = await getAprFeed(
          "0x427dFbF4376aB621586fe0F218F5E28E1389ff7f",
          signer
        );
        const router = await getRouter(
          chains.routerAddress.get(chainId),
          signer
        );
        const chef = await getChef(
          "0xC02563f20Ba3e91E459299C3AC1f70724272D618",
          signer
        );
        setAprFeed(aprFeed);
        setRouter(router);
        setChef(chef);
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
  }, []);

  useEffect(async () => {
    if (chef) {
      const reward = await chef.totalClaimableReward(account);
      setPendingPanic(ethers.utils.formatUnits(reward));
      const poolLength = await chef.poolLength();
      const aprPromises = [];
      const tvlPromises = [];
      for (let i = 1; i < poolLength; ++i) {
        aprPromises.push(aprFeed.yvApr(i));
        tvlPromises.push(aprFeed.lpValueDollarChef(i));
      }
      await Promise.all([
        Promise.all(aprPromises).then((results) =>
          setAprMap(
            results
              .map((v) => (v && v > 0 ? v / 10000 : v))
              .map(percentNumberFormat.format)
          )
        ),
        Promise.all(tvlPromises).then((results) =>
          setTvlMap(
            results
              .map((v) => (v && v > 0 ? v / 1e18 : v))
              .map(usdNumberFormat.format)
          )
        ),
      ]);
    }
  }, [chef]);

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
      <section className="border-2 border-blue-200 m-2 mx-auto max-w-2xl p-3 rounded-2xl bg-gradient-to-bl from-blue-300 to-blue-100">
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
      <section className="border-2 border-blue-200 m-3 mx-auto max-w-2xl py-3 px-3 rounded-2xl bg-gradient-to-bl from-blue-300 to-blue-100">
        <div className="mb-4">
          <h3 className="text-3xl font-bold">Farms</h3>
          <p>Stake your liquidity provider tokens (LPs) and earn $PANIC</p>
        </div>

        <div>
          {FarmItems.map((item, index) => {
            return (
              <div className="p-1 sm:p-2 mt-2 hover:bg-blue-200 transition-colors rounded-xl">
                <div className="flex justify-between">
                  {/* Logos */}
                  <div className="flex items-center w-3/4">
                    <img
                      className="max-w-[30px] sm:max-w-[40px]"
                      src={"/assets/token/" + item.symbol1 + ".svg"}
                    ></img>
                    <img
                      className="max-w-[30px] sm:max-w-[40px] relative left-[-8px]"
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
                      Deposit
                    </Link>
                  </div>
                </div>

                <div className="mt-1 md:ml-[80px] grid grid-cols-[1fr_2fr_1fr] gap-2 w-full max-w-sm">
                  <div className="">
                    <div className="text-sm">Farm APR</div>
                    <div className="md:text-lg font-bold md:font-normal">
                      {aprMap[index]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">Total Value Staked</div>
                    <div className="md:text-lg font-bold md:font-normal">
                      {tvlMap[index]}
                    </div>
                  </div>
                  <div className="">
                    <div className="text-sm">Multiplier</div>
                    <div className="md:text-lg font-bold md:font-normal">
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
