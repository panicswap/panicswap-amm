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
import { ethers } from 'ethers';
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
  getAprFeed,
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
    textAlign: "left",
    marginLeft: theme.spacing(5),
    marginBottom: "0px",
  },
  hr: {
    width: "100%",
  },
  farmItem: {
    margin: theme.spacing(3),
    listStyle: "none",
  },
  balance: {
    textAlign: "center",
    padding: theme.spacing(1),
    paddingRight: theme.spacing(3),
  },
  buttonIcon: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.4),
    textDecoration: "none",
    '&:hover': {
      textDecoration:"underline",
    },
  },
  farmName: {
    fontSize: 20,
  },
  farmCell: {
   backgroundColor: "#f8f9fa",
   padding: "20px",
   borderRadius: "10px",
  },
  tokenLogo: {
    width: "30px",
    paddingRight: "5px",
    verticalAlign: "middle",
  },
  farmMenu: {
    padding: "0px",
    margin: "0px",
  },
  description: {
    fontSize: "15px",
    marginLeft: theme.spacing(5),
    marginBottom: theme.spacing(2),
  }
});

const useStyles = makeStyles(styles);

const usdNumberFormat = new Intl.NumberFormat('us-EN', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const percentNumberFormat = new Intl.NumberFormat('us-EN', { style: 'percent', maximumFractionDigits: 2, minimumFractionDigits: 2 });

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
  const [aprFeed, setAprFeed] = React.useState(undefined);
  const [aprMap, setAprMap] = React.useState([]);
  const [tvlMap, setTvlMap] = React.useState([]);

  // Stores a record of whether their respective dialog window is open
  const [dialog1Open, setDialog1Open] = React.useState(false);
  const [dialog2Open, setDialog2Open] = React.useState(false);
  const [wrongNetworkOpen, setwrongNetworkOpen] = React.useState(false);
  const [pendingPanic, setPendingPanic] = React.useState("");
  const [coins, setCoins] = React.useState([]);

  // Controls the loading button
  const [loading, setLoading] = React.useState(false);

  // Sum all values in a list
  function add(accumulator, a) {
    return accumulator + a;
  }

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
        const chef = await getChef("0xC02563f20Ba3e91E459299C3AC1f70724272D618", signer);
        const aprFeed = await getAprFeed("0xdD8C47d35248188eEA2d23037f3C80529Cf7b3ED", signer);
        setAprFeed(aprFeed);
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
      setPendingPanic(ethers.utils.formatUnits(reward));
      const poolLength = await chef.poolLength();
      const aprPromises = [];
      const tvlPromises = [];
      for(let i=1; i< poolLength; ++i){
        aprPromises.push(aprFeed.yvApr(i))
        tvlPromises.push(aprFeed.lpValueDollarChef(i))
      }
      await Promise.all([
          Promise.all(aprPromises).then(results => setAprMap(
              results
                  .map(v => v && v > 0 ? v / 10000 : v)
                  .map(percentNumberFormat.format)
              )
          ),
          Promise.all(tvlPromises).then(results => setTvlMap(
              results
                  .map(v => v && v > 0 ? v / 1e18 : v)
                  .map(usdNumberFormat.format)
              )
          )
      ]);
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
          <Typography variant="h6" className={classes.description}>
            Collect $PANIC rewards earned by farming
          </Typography>
          <Grid container direction="row" justifyContent="center" alignItems="center" xs={12}>
            <Grid container xs={12} justifyContent="center" alignItems="center" className={classes.farmCell}>
              <Grid item xs={6}>
                <Typography variant="body1" justifyContent="center" className={classes.balance}>
                    {/* {formatBalance(coin1.balance, coin1.symbol)} */}
                    <img src="assets/token/PANIC.svg" className={classes.tokenLogo}></img>
                    {Number(pendingPanic).toFixed(2)} PANIC
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <LoadingButton
                  loading={loading}
                  valid={true}
                  success={false}
                  fail={false}
                  onClick={()=>{claimAllRewards()}}
                >
                  <AccountBalanceIcon className={classes.buttonIcon} />
                  Collect Rewards
                </LoadingButton>
              </Grid>
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
          <Typography variant="h6" className={classes.description}>
            Stake your liquidity provider tokens (LPs) and earn $PANIC
          </Typography>

          <div className="FarmItems">
            <ul className={classes.farmMenu}>
      
      
            {FarmItems.map((item, index) => {
              
                return (
      
                  <li key={index} className={classes.farmItem}>
                    <Grid container className={classes.farmCell}>
                      <Grid container xs={12}>
                        <Grid item xs={8}>
                          <Typography className={classes.farmName}>
                            <img src={'/assets/token/'+ item.symbol1 + ".svg"} class={classes.tokenLogo}></img>
                            <img src={'/assets/token/'+ item.symbol2 + ".svg"} class={classes.tokenLogo}></img>
                            {item.title}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <a href={item.url} class={classes.IconButton}>
                            <LoadingButton
                              loading={loading}
                              valid={true}
                              success={false}
                              fail={false}>

                              Deposit
                            </LoadingButton>
                          </a>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography>
                          <b>Farm APR</b>
                          </Typography>
                          <Typography>{aprMap[index]}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography>
                          <b>Total Value Staked</b>
                          </Typography>
                          <Typography>{tvlMap[index]}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography>
                            <b>Multiplier</b>
                          </Typography>
                          <Typography>
                            {"x" + item.boost}
                          </Typography>
                        </Grid>
              
                      </Grid>
                    </Grid>
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
