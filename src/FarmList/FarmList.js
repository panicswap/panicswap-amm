import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FarmItems } from "./FarmItems";
import {
  Container,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
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
  getChef,
} from "../ethereumFunctions";
import LoadingButton from "../Components/LoadingButton";
import WrongNetwork from "../Components/wrongNetwork";
import COINS from "../constants/coins";
import * as chains from "../constants/chains";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  hr: {
    width: "100%",
  },
  farmItem: {
    margin: theme.spacing(3),
    listStyle: "none",
  },
  balance: {
    textAlign: "right",
    padding: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.4),
  },
});

const useStyles = makeStyles(styles);

function FarmList(props) {
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
  const [chef, setChef] = React.useState(undefined);

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen, setwrongNetworkOpen] = React.useState(false);
  const [pendingPanic, setPendingPanic] = React.useState("");
  const [coins, setCoins] = React.useState([]);

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);


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
        const router = await getRouter(chains.routerAddress.get(chainId), signer);
        const chef = await getChef("0x668675832FdD9601E8804c694B0E2073B676cEfF", signer);
        setRouter(router);
        setChef(chef);
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
      const reward = await chef.totalClaimableReward(account);
      setPendingPanic(String(reward/1e18));
    }
  }, [chef]);

  async function claimAllRewards() {
    await chef;
    chef.claimAll();
  }

  const hasPendingRewards = () => {
    // @todo 
    
    return false; // returns true if user has pending rewards
  }

  return (
    <div>

      <WrongNetwork
        open={wrongNetworkOpen}
      />


      {/* Rewards */}
      <Container maxWidth="md">
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            Rewards
          </Typography>
          <Grid container direction="row" justifyContent="center">
            <Grid item xs={4}>
              <Typography variant="body1" className={classes.balance}>
                {/* {formatBalance(coin1.balance, coin1.symbol)} */}
                {pendingPanic} PANIC
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <LoadingButton
                loading={loading}
                valid={true}
                success={false}
                fail={false}
                onClick={()=>{claimAllRewards()}}
              >
                <AccountBalanceIcon className={classes.buttonIcon} />
                COLLECT YOUR REWARDS
              </LoadingButton>
            </Grid>
          </Grid>
        </Paper>
      </Container>



      {/* Farms */}
      <Container maxWidth="md">
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            Farms
          </Typography>

          <div className="FarmItems">
            <ul className={`farm-menu`}>
              {FarmItems.map((item, index) => {
                return (
                  <li key={index} className={classes.farmItem}>
                    <Link to={item.url}>
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Paper>
      </Container>


    </div>
  );
}

export default FarmList;
