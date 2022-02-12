import React, { useEffect } from "react";
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
} from "../ethereumFunctions";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import COINS from "../constants/coins";
import CoinField from "../CoinSwapper/CoinField";
import * as chains from "../constants/chains";


const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  balance: {
    paddingTop: theme.spacing(3),
  },
  btnContainer: {
    padding: theme.spacing(2.5),
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
  const [weth, setWeth] = React.useState(undefined);
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
        const router = await getRouter(chains.routerAddress.get(chainId), signer)
        setRouter(router);
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

  const { farmId } = useParams();

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
        <Typography variant="h5">
            Stake Panic
          </Typography>

          <Typography variant="h6" className={classes.balance}>
            Wallet balance: xxx PANIC
          </Typography>
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinField
                activeField={true}
                value={field1Value}
                onClick={() => setDialog1Open(true)}
                onChange={handleChange.field1}
                symbol={tokenDetails.symbol}
                userCanChoose={false}
              />
            </Grid>
            <Grid item xs={4} className={classes.btnContainer}>
              <LoadingButton
                loading={loading}
                valid={hasBalance.deposit()}
                success={false}
                fail={false}
                onClick={() => { }}
              >
                Deposit
              </LoadingButton>
            </Grid>
          </Grid>
        </Paper>


        {/* Stake & lock */}
        <Paper className={classes.paperContainer}>
          <Typography variant="h5">
            Stake & Lock Panic
          </Typography>

          <Typography variant="subtitle1">

            Lock Period: 2 years. <br />

            Panic deposited and locked is subject to a 2 year lock and will continue to earn fees after the locks expire if you do not withdraw.
          </Typography>

          <Typography variant="h6" className={classes.balance}>
            Wallet balance: xxx PANIC
          </Typography>
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinField
                activeField={true}
                value={field2Value}
                onClick={() => setDialog2Open(true)}
                onChange={handleChange.field2}
                symbol={tokenDetails.symbol}
                userCanChoose={false}
              />
            </Grid>
            <Grid item xs={4} className={classes.btnContainer}>
              <LoadingButton
                loading={loading}
                valid={hasBalance.deposit()}
                success={false}
                fail={false}
                onClick={() => { }}
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
