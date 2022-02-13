import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch
} from "@material-ui/core";
import Rewards from "./Rewards";
import Stake from "./Stake";


const styles = (theme) => ({
  rewardsContainer: {
    [theme.breakpoints.down('sm')]: {
      order: 2,
    },
  },
  stakeContainer: {
    [theme.breakpoints.down('sm')]: {
      order: 1,
    },
  }
});

const useStyles = makeStyles(styles);

export default function StakePage() {
  const classes = useStyles();

  return (
    <div>
      <Container>
        <Grid container direction="row" justifyContent="center">
          <Grid item xs={12} md={6} className={classes.rewardsContainer}>
            <Rewards />
          </Grid>
          <Grid item xs={12} md={6}  className={classes.stakeContainer}>
            <Stake />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
