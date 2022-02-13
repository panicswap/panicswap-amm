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

  const { value, maxValue } = props;

  const [newValue, setNewValue] = React.useState(value);

  const set = (event, amount) => {
    event.preventDefault();
    if(amount){
      setNewValue(String(amount));
    }
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
            <Link href="#" onClick={(event) => set(event, maxValue/2)}>
              50%
            </Link>
          </Grid>
          <Grid item>
            <Link href="#" onClick={(event) => set(event, maxValue)}>
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
