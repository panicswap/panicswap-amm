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

  const { value, symbol, maxValue } = props;

  const [newValue, setNewValue] = React.useState(value);

  const set = (amount) => {
    if(amount){
      setNewValue(String(amount));
    }
  }

  const setMax = (e) => {
    e.preventDefault();
    if(symbol && symbol === "FTM"){
      set(maxValue - 2);
    } else {
      set(maxValue);
    }
  }

  const set50 = (e) => {
    e.preventDefault();
    set(maxValue/2);
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
            <Link href="#" onClick={set50}>
              50%
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" onClick={setMax}>
              Max
            </Link>
          </Grid>
        </Grid>
      </div>

      {/* CoinField */}
      <CoinField {...props} value={newValue} />
    </>
  );
}
