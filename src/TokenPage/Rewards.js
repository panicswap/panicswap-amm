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
import {ethers} from 'ethers';
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
  getEpsStaking
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
    borderBottom: "3px solid #ccc"
  }
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
  const [stakingEps, setStakingEps] = React.useState(undefined);
  const [weth, setWeth] = React.useState(undefined);
  const [panic, setPanic] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);
  const [vestedBalance, setVestedBalance] = React.useState(0);
  const [unlockedBalance, setUnlockedBalance] = React.useState(0);
  const [panicRewards, setPanicRewards] = React.useState(0);
  const [yvWFTMRewards, setYvWFTMRewards] = React.useState(0);

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
        console.log('chainID: ', chainId);
        // Get the router using the chainID
        const router = await getRouter(chains.routerAddress.get(chainId), signer);
        const stakingEps = await getEpsStaking("0x536b88CC4Aa42450aaB021738bf22D63DDC7303e",signer);
        setRouter(router);
        setStakingEps(stakingEps);
        setPanic(getWeth("0xA882CeAC81B22FC2bEF8E1A82e823e3E9603310B",signer));
        // Get Weth address from router
        await router.weth().then((wethAddress) => {
          console.log('Weth: ', wethAddress);
          setWeth(getWeth(wethAddress, signer));
          // Set the value of the weth address in the default coins array
          const coins = COINS.get(chainId);
          coins[0].address = wethAddress;
          setCoins(coins);
        });
        // Get the factory address from the router
        await router.factory().then((factory_address) => {
          setFactory(getFactory(factory_address, signer));
        })
      } else {
        console.log('Wrong network mate.');
        setwrongNetworkOpen(true);
      }
    }

    Network()

  }, []);

  useEffect( async() => {
    if(stakingEps){
      const [ unlockedBal, { 1: penaltyData }, [{ 1: panicEarned}, { 1: yvWFTMEarned}]] = await Promise.all([
        stakingEps.unlockedBalance(account),
        stakingEps.withdrawableBalance(account),
        stakingEps.claimableRewards(account)
      ])
      setVestedBalance(ethers.utils.formatUnits(penaltyData)*2);
      setUnlockedBalance(ethers.utils.formatUnits(unlockedBal));
      setPanicRewards(ethers.utils.formatUnits(panicEarned));
      setYvWFTMRewards(ethers.utils.formatUnits(yvWFTMEarned));
    }
  }, [panic]);

  
  async function exit(){
    await stakingEps;
    await stakingEps.exit();
  }
  
  async function getReward(){
    await stakingEps;
    await stakingEps.getReward();
  }
  
  async function withdrawUnlocked(){
    await stakingEps;
    const amount = await stakingEps.unlockedBalance(account);
    //await panic.approve("0x536b88CC4Aa42450aaB021738bf22D63DDC7303e","999999999999999999999999");
    await stakingEps.withdraw(amount);
  }

  return (
    <div>


<Container>
        <Paper className={classes.paperContainer}>
          <section>
            <Typography variant="h6" className={classes.title}>
              Liquidity Providers
            </Typography>
            <ul>
              <li>
                PANIC rewards are subject to a 2 year vesting period, but can also be claimed early at a 50% penalty.
              </li>
              <li>
                Exiting before the end of the vesting period always incurs a 50% penalty no matter how early or late you choose to exit.
              </li>
              <li>
                The 50% penalty is distributed continuously to PANIC lockers rewarding the long-term holders.
              </li>
            </ul>
          </section>


          <section>
            <Typography variant="h6" className={classes.title}>
              For PANIC lockers:
            </Typography>
            <ul>
              <li>
                Lock dates are grouped by the week. Any lock between Monday to Sunday is grouped in the same week group, and will release at the same time 2 years later.
              </li>
              <li>
                Locked PANIC is subject to a mandatory 2 years lock and cannot be unlocked early.
              </li>
              <li>
                PANIC rewards from locking PANIC can be claimed anytime with no penalty.
              </li>
            </ul>
          </section>



          <TableContainer>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell align="center">Amount</TableCell>
                  <TableCell align="center">Claim</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

                {/* Unlocked PANIC */}
                <TableRow>
                  <TableCell component="th" scope="row">
                    Staked PANIC
                  </TableCell>
                  <TableCell align="center">{unlockedBalance}</TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { withdrawUnlocked() }}
                    >
                      Unstake
                    </LoadingButton>
                  </TableCell>
                </TableRow>


                {/* PANIC Stake and Lock Rewards */}
                <TableRow>
                  <TableCell component="th" scope="row">
                      PANIC Rewards
                  </TableCell>
                  <TableCell align="center">
                    {Number(panicRewards).toFixed(2) + " PANIC"}
                    <hr/>
                    {Number(yvWFTMRewards).toFixed(2)} yvWFTM
                  </TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { getReward() }}
                    >
                      Claim
                    </LoadingButton>
                  </TableCell>
                </TableRow>
                {/* Claim all above */}
                <TableRow className={classes.rowClaimAll} >
                  <TableCell component="th" scope="row">
                    Exit vesting
                  </TableCell>
                  <TableCell align="center">{vestedBalance/2}</TableCell>
                  <TableCell align="center">
                    <LoadingButton
                      loading={false}
                      valid={true}
                      success={false}
                      fail={false}
                      onClick={() => { exit() }}
                    >
                      Exit
                    </LoadingButton>
                  </TableCell>
                </TableRow>
              </TableBody >
            </Table >
          </TableContainer >


        </Paper >


      </Container >

    </div >
  );
}

