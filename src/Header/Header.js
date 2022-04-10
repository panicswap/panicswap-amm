import React, { useEffect, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import logo from "../assets/logo/logo.svg";
import {
  getAccount,
  getProvider,
  getSigner,
  getNetwork,
  getAprFeed,
  getAprFeedStaking,
  getChef,
  getGeneralProvider
} from "../ethereumFunctions";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";
import DarkmodeToggle from "./DarkmodeToggle";
import HeaderStats from "./HeaderStats";

export default function Header() {
  const [provider, setProvider] = React.useState(getGeneralProvider());

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [aprFeed, setAprFeed] = React.useState(
    getAprFeed("0xAC6F885e2fcb2Fe105C9EC6C048759873142F60E", provider)
  );
  const [chef, setChef] = React.useState(
    getChef("0xC02563f20Ba3e91E459299C3AC1f70724272D618", provider)
  );
  const [aprStaking, setAprStaking] = React.useState(
    getAprFeedStaking("0x69701Bf555bfB3D8b65aD57C78Ebeca7F732002B", provider)
  );
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
        aprFeed.totalTvl().then(setTotalTvl),
        aprFeed.panicDollarPrice().then(setPanicPrice),
        aprStaking.getFtmApr().then(setDivApr),
      ];
      await Promise.allSettled(promises);
    };
    updateHeaderStats();
  }, [aprFeed, aprStaking, chef]);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 mb-10 p-1 md:p-2 bg-white dark:bg-slate-900">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between md:pl-5">
        <div className="flex md:flex-row items-center justify-between p-2">
          {/* Logo */}
          <Link to="/">
            <img
              src={logo}
              className="w-[35px] md:w-[40px] mr-5"
              alt="PanicSwap logo"
            />
          </Link>

          {/* Navigation */}
          <div
            className="text-3xl dark:text-white cursor-pointer md:hidden relative z-30"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <IoClose /> : <AiOutlineMenu />}
          </div>

          <NavBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        </div>

        {/* Stats */}
        <div className="items-center hidden md:flex">
          <HeaderStats
            totalTvl={totalTvl}
            panicPrice={panicPrice}
            divApr={divApr}
          />

          {/* Darkmode toggle */}
          <div className="ml-3 hidden md:block">
            <DarkmodeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
