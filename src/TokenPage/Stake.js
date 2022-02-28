import React, { useEffect } from "react";
import { ethers } from "ethers";
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
  TableCell
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import {
  getAccount,
  getFactory,
  getProvider,
  getRouter,
  getSigner,
  getNetwork,
  getWeth,
  getEpsStaking
} from "../ethereumFunctions";
import LoadingButton from "../Components/LoadingButton";
import COINS from "../constants/coins";
import CoinAmountInterface from "../CoinSwapper/CoinAmountInterface";
import * as chains from "../constants/chains";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  balance: {
  },
  smallTokenIcon: {
    width: "20px",
    marginLeft: "5px",
    marginRight: "5px",
    marginBottom: "2px",
  },
  btnContainer: {
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(5),
  },
  buttonContainer: {
    padding: theme.spacing(2),
  }
});

const useStyles = makeStyles(styles);

export default function Stake() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();


  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [stakingEps, setStakingEps] = React.useState(getEpsStaking("0x536b88CC4Aa42450aaB021738bf22D63DDC7303e",signer));
  const [weth, setWeth] = React.useState(undefined);
  const [panic, setPanic] = React.useState(getWeth("0xA882CeAC81B22FC2bEF8E1A82e823e3E9603310B",signer));
  const [factory, setFactory] = React.useState(undefined);
  const [vestedBalance, setVestedBalance] = React.useState(0);
  const [lockedBalance, setLockedBalance] = React.useState("0");
  const [unlockedBalance, setUnlockedBalance] = React.useState("0");
  const [panicRewards, setPanicRewards] = React.useState("0");

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
        console.log('chainID: ', chainId);
        // Get the router using the chainID
        const router = await getRouter(chains.routerAddress.get(chainId), signer);
        setRouter(router);
        // Get Weth address from router
        await router.weth().then((wethAddress) => {
          console.log('Weth: ', wethAddress);
          setWeth(getWeth(wethAddress, signer));
          // Set the value of the weth address in the default coins array
          const coins = COINS.get(chainId);
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

  }, [provider, signer]);

  useEffect( () => {
    const updateStakingStats = async () => {
      const promises = [
        stakingEps.unlockedBalance(account)
            .then(unlockedBal => setUnlockedBalance(ethers.utils.formatUnits(unlockedBal))),
        stakingEps.withdrawableBalance(account)
            .then(({1: vestedBalance}) => setVestedBalance(ethers.utils.formatUnits(vestedBalance)*2)),
        stakingEps.claimableRewards(account)
            .then(({1: {0: panicEarnedFinal }}) => setPanicRewards(ethers.utils.formatUnits(panicEarnedFinal))),
        stakingEps.lockedBalances(account)
            .then(({0: panicLockedTotal}) => setLockedBalance(ethers.utils.formatUnits(panicLockedTotal))),
        panic.balanceOf(account)
            .then(bal => {
              setPanicWeiBalance(bal);
              setPanicBalance(ethers.utils.formatUnits(bal));
            })
      ];
      await Promise.allSettled(promises);
    }
    updateStakingStats();

  }, [account, panic, stakingEps]);

  async function stakePan(bal, lockrnt){
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const amountIn = ethers.utils.parseUnits(bal, 18);
    const allo = await panic.allowance(account,"0x536b88CC4Aa42450aaB021738bf22D63DDC7303e");
    if(Number(allo) < Number(amountIn)){
      await panic.approve("0x536b88CC4Aa42450aaB021738bf22D63DDC7303e","99999999999999999999999999");
      await delay(5000);
    }
    await stakingEps.stake(amountIn, lockrnt);
  }

  const hasBalance = {
    deposit: () => {
      // @todo 
      return false; // returns true if user has balance to deposit
    },
  }

  return (
    <div>
      <Container>
        <Paper className={classes.paperContainer}>

        <Typography variant="h5" className={classes.title}>
            Staked PANIC
          </Typography>

          <TableContainer>
            <Table className={classes.table} size="small" aria-label="simple table">

              <TableBody>

                {/* @todo */}
                {/* @todo --> need to iterate with myArray.map()  */}
                {/* @todo */}

                <TableRow>
                  <TableCell>
                    Staked & locked
                  </TableCell>
                  <TableCell>
                    {Number(lockedBalance).toFixed(2)}
                    <img src="assets/token/PANIC.svg" className={classes.smallTokenIcon}></img>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    Staked & vested
                  </TableCell>
                  <TableCell>
                    {Number(vestedBalance).toFixed(2)}
                    <img src="assets/token/PANIC.svg" className={classes.smallTokenIcon}></img>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    Staked & unlocked
                  </TableCell>
                  <TableCell>
                    {Number(unlockedBalance).toFixed(2)}
                    <img src="assets/token/PANIC.svg" className={classes.smallTokenIcon}></img>
                  </TableCell>
                </TableRow>

              </TableBody >
            </Table >
          </TableContainer >
        </Paper>
        {/* Stake w/o locking */}
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            Stake Panic
          </Typography>

          <Typography variant="subtitle1">
              Stake PANIC and earn platform fees in yvWFTM without lock-up.
          </Typography>

          <Grid container direction="row" justifyContent="center">
            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12} className={classes.buttonContainer}>
              <LoadingButton
                loading={loading}
                valid={true}
                success={false}
                fail={false}
                onClick={() => {stakePan(field1Value,false)}}
              >
                Deposit
              </LoadingButton>
            </Grid>
          </Grid>
        </Paper>


        {/* Stake & lock */}
        <Paper className={classes.paperContainer} >
          <Typography variant="h5" className={classes.title}>
            Stake & Lock Panic
          </Typography>

          <Typography variant="subtitle1">
            <p>
              Stake and lock PANIC, earn platform fees in yvWFTM + penalty fees in unlocked PANIC.
            </p>

            <p>
              PANIC deposited and locked is subject to a 2 year lock. You will continue to earn fees after the locks expire if you do not withdraw.
            </p>
          </Typography>

          <Grid container direction="row" justifyContent="center">
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12} className={classes.buttonContainer}>
              <LoadingButton
                loading={loading}
                valid={true}
                success={false}
                fail={false}
                onClick={() => {stakePan(field2Value,true)}}
              >
                Lock
              </LoadingButton>
            </Grid>
          </Grid>
        </Paper>

      </Container>
    </div>
  );
}
