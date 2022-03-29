import React, { useEffect } from "react";
import logo from "../assets/logo/variations/full-logo-01.png";
import { formatNumber } from "../helpers/numberFormatter";
import {
  getAccount,
  getProvider,
  getSigner,
  getNetwork,
  getAprFeed,
  getAprFeedStaking,
  getChef,
} from "../ethereumFunctions";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";

export default function Header() {
  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [aprFeed, setAprFeed] = React.useState(getAprFeed(
      "0x427dFbF4376aB621586fe0F218F5E28E1389ff7f",
      signer
  ));
  const [chef, setChef] = React.useState(getChef(
      "0xC02563f20Ba3e91E459299C3AC1f70724272D618",
      signer
  ));
  const [aprStaking, setAprStaking] = React.useState(getAprFeedStaking(
      "0x69701Bf555bfB3D8b65aD57C78Ebeca7F732002B",
      signer
  ));
  const [panicPrice, setPanicPrice] = React.useState(0);
  const [totalTvl, setTotalTvl] = React.useState(0);
  const [divApr, setDivApr] = React.useState(0);

  // This hook will run when the component first mounts, it can be useful to put logs to populate variables here
  useEffect(() => {
    getAccount().then((account) => {
      setAccount(account);
    });

    async function Network() {
      const chainId = await getNetwork(provider);
      setChainId(chainId);
    }

    Network();
  }, [provider]);

  useEffect(() => {
    const updateHeaderStats = async () => {
      const promises = [
        aprFeed.totalTvl()
            .then(setTotalTvl),
        aprFeed.panicDollarPrice()
            .then(setPanicPrice),
        aprStaking.getFtmApr()
            .then(setDivApr),
      ];
      await Promise.allSettled(promises);
    }
    updateHeaderStats();
  }, [aprFeed, aprStaking, chef]);

  return (
    <header
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        borderTop: "1px solid rgba(255, 255, 255, 0.5)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
      }}
      className="border-b sticky top-0 z-10 mb-10 p-2 md:p-5"
    >
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img
              src={logo}
              className="max-w-[100px] md:max-w-[130px]"
              alt="PanicSwap logo"
            />
          </Link>
          {/* Navigation */}
          <NavBar />
        </div>

        {/* Stats */}
        <section className="p-3 flex max-w-3xl">
          <HeaderItem
            label="TVL"
            value={"$" + formatNumber(totalTvl / 1e18, 2)}
          />
          <HeaderItem
            label="$PANIC price"
            value={"$" + formatNumber(panicPrice / 1e18, 3)}
          />
          <HeaderItem
            label="yvWFTM Dividends"
            value={formatNumber(divApr / 100, 2) + "%"}
          />
        </section>
      </div>
    </header>
  );
}

const HeaderItem = ({ label, value }) => {
  return (
    <div className="ml-2 lg:ml-4 rounded-lg">
      <div className="text-xs text-gray-500 leading-none">{label}</div>
      <div className="">{value}</div>
    </div>
  );
};
