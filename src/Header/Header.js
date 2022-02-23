import React, { useEffect } from "react";
import logo from "../assets/logo/variations/full-logo-01.png";
import "./Header.css";
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
  getAprFeed,
  getAprFeedStaking,
  getChef
} from "../ethereumFunctions";
import * as chains from "../constants/chains";
import COINS from "../constants/coins";
import { ethers } from "ethers";

export default function Header() {
  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [aprFeed, setAprFeed] = React.useState(undefined);
  const [chef, setChef] = React.useState(undefined);
  const [aprStaking, setAprStaking] = React.useState(undefined);
  const [panicPrice, setPanicPrice] = React.useState(0);
  const [totalTvl, setTotalTvl] = React.useState(0);
  const [totalPairs, setTotalPairs] = React.useState(0);
  const [divApr, setDivApr] = React.useState(0);

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
        const aprFeed = await getAprFeed("0x427dFbF4376aB621586fe0F218F5E28E1389ff7f", signer);
        const chef = await getChef("0xC02563f20Ba3e91E459299C3AC1f70724272D618", signer);
        const aprFeedStaking = await getAprFeedStaking("0x69701Bf555bfB3D8b65aD57C78Ebeca7F732002B",signer);

        setChef(chef);
        setAprStaking(aprFeedStaking);
        setAprFeed(aprFeed);
      }
    }

    Network()

  }, []);

  useEffect( async() => {
    if(aprFeed){
      const [totalTvl, panicPrice, totalPairs, divApr ] = await Promise.all([ 
        aprFeed.totalTvl(),
        aprFeed.panicDollarPrice(),
        chef.poolLength(),
        aprStaking.getFtmApr()
      ]);
      setTotalTvl(totalTvl);
      setPanicPrice(panicPrice);
      setTotalPairs(totalPairs);
      setDivApr(divApr);
    }
  }, [aprFeed]);

    return (
      <header id="header">
          <strong>
            TVL: ${Number(totalTvl/1e18).toFixed(2)} |
            $PANIC Price: ${Number(panicPrice/1e18).toFixed(2)} |
            Total Pairs: {Number(totalPairs)} |
            Dividends: {Number(divApr/100).toFixed(2)}%
          </strong>
          <hr/>
        <h1>
          <img src={logo} className="logo" alt="PanicSwap" />
        </h1>
      </header>
    );
  }

