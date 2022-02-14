import React, { useEffect } from "react";
import { ethers } from "ethers";
import {
  useParams
} from "react-router-dom";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch
} from "@material-ui/core";
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
  getEpsStaking
} from "../ethereumFunctions";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
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
  btnContainer: {
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(5),
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
  const [stakingEps, setStakingEps] = React.useState(undefined);
  const [weth, setWeth] = React.useState(undefined);
  const [panic, setPanic] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);

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
      const chainId = await getNetwork(provider).then((chainId) => {
        setChainId(chainId);
        return chainId;
      });
      if (chains.networks.includes(chainId)) {
        setwrongNetworkOpen(false);
        console.log('chainID: ', chainId);
        // Get the router using the chainID
        const router = await getRouter(chains.routerAddress.get(chainId), signer);
        const stakingEps = await getEpsStaking("0x066Da5249e1312E95d63F7A54CB039aE36510A6E",signer);
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
    if(panic){
      const bal = await panic.balanceOf(account);
      setPanicBalance(String(bal/1e18));
    }
  }, [panic]);

  async function stakePan(bal, lockrnt){
    await stakingEps;
    await panic;
    const amountIn = ethers.utils.parseUnits(bal, 18);
    await panic.approve("0x066Da5249e1312E95d63F7A54CB039aE36510A6E","999999999999999999999999");
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

        {/* Stake w/o locking */}
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            Stake Panic
          </Typography>

          <Typography variant="subtitle1">
              Stake PANIC and earn platform fees in WFTM without lock-up.
          </Typography>

          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinAmountInterface
                activeField={true}
                value={field1Value}
                onClick={() => setDialog1Open(true)}
                onChange={handleChange.field1}
                symbol={tokenDetails.symbol}
                userCanChoose={false}
              />
              <Typography variant="body1" className={classes.balance}>
                Wallet balance: {panicBalance} PANIC
              </Typography>
            </Grid>

            <Grid item xs={4} className={classes.btnContainer}>
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
              Stake and lock PANIC and earn platform fees in WFTM + penalty fees in unlocked PANIC.
            </p>

            <p>
              Panic deposited and locked is subject to a 2 year lock and will continue to earn fees after the locks expire if you do not withdraw.
            </p>
          </Typography>

          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinAmountInterface
                activeField={true}
                value={field2Value}
                onClick={() => setDialog2Open(true)}
                onChange={handleChange.field2}
                symbol={tokenDetails.symbol}
                userCanChoose={false}
              />
              <Typography variant="body1" className={classes.balance}>
                Wallet balance: {panicBalance} PANIC
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.btnContainer}>
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
