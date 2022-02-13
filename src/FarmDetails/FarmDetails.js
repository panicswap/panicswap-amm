import React, { useEffect } from "react";
import {
  useParams
} from "react-router-dom";
import {
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import { useSnackbar } from "notistack";
import LoopIcon from "@material-ui/icons/Loop";
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
import * as chains from "../constants/chains";
import CoinAmountInterface from "../CoinSwapper/CoinAmountInterface";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
  },
  fullWidth: {
    width: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing(1),
  },
  hr: {
    width: "100%",
  },
  balance: {
    marginBottom: theme.spacing(2),
    overflow: "wrap",
    textAlign: "left",
    width: "100%",
  },
  btnContainer: {
    padding: theme.spacing(2.5),
    paddingTop: theme.spacing(8.5),
  }
});

const useStyles = makeStyles(styles);




function FarmDetails(props) {
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

  const [lpDetails, setLpDetails] = React.useState({
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
      return true; // returns true if user has balance to deposit
    },
    withdraw: () => {
      // @todo 
      return true; // returns true if user has balance to withdraw
    }
  }


  return (
    <div>

      <WrongNetwork
        open={wrongNetworkOpen}
      />

      <Container maxWidth="md">
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            Farm: {farmId}
          </Typography>

          {/* Deposit */}
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinAmountInterface
                activeField={true}
                value={field1Value}
                onClick={() => setDialog1Open(true)}
                onChange={handleChange.field1}
                symbol={lpDetails.symbol}
                userCanChoose={false}
                maxValue={null}
              />
              <Typography variant="h6" className={classes.balance}>
                Your wallet balance: xxx
              </Typography>
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



          {/* Withdraw */}
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinAmountInterface
                activeField={true}
                value={field2Value}
                onClick={() => setDialog2Open(true)}
                onChange={handleChange.field2}
                symbol={lpDetails.symbol}
                userCanChoose={false}
                maxValue={null}
              />
              <Typography variant="h6" className={classes.balance}>
                Your staked balance: xxx
              </Typography>
            </Grid>
            <Grid item xs={4} className={classes.btnContainer}>
              <LoadingButton
                loading={loading}
                valid={hasBalance.withdraw()}
                success={false}
                fail={false}
                onClick={() => { }}
              >
                Withdraw
              </LoadingButton>
            </Grid>
          </Grid>
        </Paper>
      </Container>


    </div>
  );
}

export default FarmDetails;
