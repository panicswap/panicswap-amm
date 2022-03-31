import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch,
} from "@material-ui/core";
import Rewards from "./Rewards";
import Stake from "./Stake";

const styles = (theme) => ({
  rewardsContainer: {
    [theme.breakpoints.down("sm")]: {
      order: 2,
    },
  },
  stakeContainer: {
    [theme.breakpoints.down("sm")]: {
      order: 1,
    },
  },
});

const useStyles = makeStyles(styles);

export default function StakePage() {
  const classes = useStyles();

  return (
    <div className="max-w-screen-lg p-2 mx-auto">
      <Stake />
      <Rewards />
    </div>
  );
}
