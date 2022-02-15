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
    
    if(percentage === 100 && maxValue){
      amount = (symbol && symbol === "FTM") ? maxValue - 2 : maxValue;
    } else if(maxValue) {
      amount = maxValue  * percentage / 100;
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
            <Link href="#" onClick={(e) => {updateAmount(e, 100)}}>
              Max
            </Link>
          </Grid>
        </Grid>
      </div>
      {/* CoinField */}
      <CoinField {...props}  />
    </>
  );
}
