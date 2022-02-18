import React from "react";
import { Grid, makeStyles, Link } from "@material-ui/core";
import CoinField from "./CoinField";

const useStyles = makeStyles((theme) => ({
  controls: {
    marginTop: theme.spacing(3),
    paddingRight: theme.spacing(1),
    fontWeight: "bold",
  },
}));



export default function CoinAmountInterface(props) {
  // Requires all props required by <CoinField>, plus the following:
  //    maxValue - the max value that an input can have (eg. wallet balance for a specific token)
  // 
  //    note: all other props are forwarded to the child component <CoinField>
  // 


  const classes = useStyles();

  const { value, maxValue, onChange, symbol } = props;


  const updateAmount = (e, percentage = 100) => {
    e.preventDefault();
    let amount;
    
    if(percentage && maxValue && symbol === "FTM") {
      if(maxValue < 1){
        amount = 0;
      }
      else {
        amount = (maxValue - 1) * percentage / 100
      }
    } else if(maxValue) {
      amount = maxValue * percentage / 100;
    } else {
      amount = 0;
    }
    console.log("MAX CLICKED", amount);
    const mockEvent = { target: {value: String(amount)} }
    onChange(mockEvent)
  }


  return (
    <>
      {/* Controls */}
      <div className={classes.controls}>
        <Grid
            container
            direction="row"
            justifyContent="flex-end"
            spacing={2}
        >
            <Grid item>
            <Link href="#" onClick={(e) => {updateAmount(e, 25)}}>
              25%
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" onClick={(e) => {updateAmount(e, 50)}}>
              50%
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" onClick={(e) => {updateAmount(e, 75)}}>
              75%
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" onClick={(e) => {updateAmount(e, 100)}}>
              100%
            </Link>
          </Grid>
        </Grid>
      </div>
      {/* CoinField */}
      <CoinField {...props}  />
    </>
  );
}
