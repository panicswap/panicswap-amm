import React from "react";
import { ButtonBase, Grid, makeStyles, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import * as COLORS from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  button: {
    width: "100%",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    "&:hover, &$focusVisible": {
      backgroundColor: COLORS.grey[200],
    },
  },
  coinName: {
    opacity: 0.6,
  },
  coinLogo: {
    width: "40px",
  },
  tokenName: {
    alignItems: "start",
  }
}));

CoinButton.propTypes = {
  coinName: PropTypes.string.isRequired,
  coinAbbr: PropTypes.string.isRequired,
  coinAddress: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function CoinButton(props) {
  const { coinName, coinAbbr, coinAddress, onClick, ...other } = props;
  const classes = useStyles();

  return (
    <ButtonBase focusRipple className={classes.button} onClick={onClick}>
      <Grid container direction="column" xs={2}>
        <Typography variant="h6">
            <img src={'/assets/token/'+ props.logo + ".svg"} className={classes.coinLogo}/>
        </Typography>
      </Grid>
      <Grid container direction="column" xs={6} className={classes.tokenName}>
        <Typography variant="h6">
          {coinAbbr}
        </Typography>
        <Typography variant="body2" className={classes.coinName}>
          {coinName}
        </Typography>
      </Grid>
      <Grid container direction="column" xs={4}>
      {/* TODO: Add user balance of the current token */}
      </Grid>
    </ButtonBase>
  );
}
