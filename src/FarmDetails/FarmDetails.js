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
  getChef,
  swapTokens,
  getReserves,
  getPoolInfo,
  getUserInfo,
} from "../ethereumFunctions";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import COINS from "../constants/coins";
import CoinField from "../CoinSwapper/CoinField";
import * as chains from "../constants/chains";

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
    padding: theme.spacing(2),
    paddingBottom: 0,
    overflow: "wrap",
    textAlign: "left",
    width: "100%",
  },
  btnContainer: {
    padding: theme.spacing(2.5),
  }
});

const useStyles = makeStyles(styles);




function FarmDetails(props) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { farmId } = useParams();

  const [provider, setProvider] = React.useState(getProvider());
  const [signer, setSigner] = React.useState(getSigner(provider));

  // The following are populated in a react hook
  const [account, setAccount] = React.useState(undefined);
  const [chainId, setChainId] = React.useState(undefined);
  const [router, setRouter] = React.useState(undefined);
  const [weth, setWeth] = React.useState(undefined);
  const [factory, setFactory] = React.useState(undefined);
  const [chef, setChef] = React.useState(undefined);

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

  const [balanceWallet, setBalanceWallet] = React.useState(0);
  const [balanceStaked, setBalanceStaked] = React.useState(0);




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

    // getBalanceAndSymbol(account, coin2.address, provider, signer, weth.address, coins).then(



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
        const chef = await getChef("0x668675832FdD9601E8804c694B0E2073B676cEfF", signer);
        setRouter(router);
        setChef(chef);
        //getUserInfo(farmId,chef,signer);
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
    if(chef){
      const uInfo = await chef.userInfo(farmId,account);
      setBalanceStaked(String(uInfo["amount"]/1e18));
  
      const pInfo = await chef.poolInfo(farmId);
      const lpt = pInfo["lpToken"];
      console.log(lpt);
      const lptC = getWeth(lpt, signer);
      const balWal = await lptC.balanceOf(account);
      setBalanceWallet(String(balWal/1e18));
    }
  }, [chef]);

  

  

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
          <Typography variant="h6" className={classes.balance}>
            Your wallet balance: <span>{balanceWallet}</span>
          </Typography>
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinField
                activeField={true}
                value={field1Value}
                onClick={() => setDialog1Open(true)}
                onChange={handleChange.field1}
                symbol={lpDetails.symbol}
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



          {/* Withdraw */}
          <Typography variant="h6" className={classes.balance}>
            Your staked balance: <span>{balanceStaked}</span>
          </Typography>
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={8}>
              <CoinField
                activeField={true}
                value={field2Value}
                onClick={() => setDialog2Open(true)}
                onChange={handleChange.field2}
                symbol={lpDetails.symbol}
                userCanChoose={false}
              />
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
