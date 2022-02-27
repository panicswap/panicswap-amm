import React from "react";
import { Grid, makeStyles, Link } from "@material-ui/core";
import CoinField from "./CoinField";
import { BigNumber, ethers } from "ethers";

const useStyles = makeStyles((theme) => ({
  controls: {
    marginTop: theme.spacing(3),
    paddingRight: theme.spacing(1),
    fontWeight: "bold",
  },
  percentages: {
    marginLeft: "10px",
  },
}));

export default function CoinAmountInterface(props) {
  // Requires all props required by <CoinField>, plus the following:
  //    maxValue - the max value that an input can have (eg. wallet balance for a specific token)
  //
  //    note: all other props are forwarded to the child component <CoinField>
  //

  const { value, maxValue, onChange, symbol, maxWeiValue, decimals } = props;

  const updateAmount = (e, percentage = 100) => {
    e.preventDefault();
    console.log("starting");
    let amount;

    if (percentage && maxValue && symbol === "FTM") {
      if (maxValue < 1) {
        amount = 0;
      } else {
        const weiAm = maxWeiValue.sub(1e18).mul(percentage).div(100);
        amount = ethers.utils.formatUnits(String(weiAm), decimals);
      }
    } else if (maxValue) {
      console.log("decimals ==", decimals);
      const weiAm = maxWeiValue.mul(percentage).div(100);
      amount = ethers.utils.formatUnits(String(weiAm), decimals);
    } else {
      amount = 0;
    }
    console.log("MAX CLICKED", amount);
    const mockEvent = { target: { value: String(amount) } };
    onChange(mockEvent);
  };

  return (
    <>
      {/* Controls */}
      <div className="flex gap-1 justify-end pr-2">
        <button
          className="leading-tight"
          onClick={(e) => {
            updateAmount(e, 25);
          }}
        >
          25%
        </button>
        <button
          className="leading-tight"
          onClick={(e) => {
            updateAmount(e, 50);
          }}
        >
          50%
        </button>
        <button
          className="leading-tight"
          onClick={(e) => {
            updateAmount(e, 75);
          }}
        >
          75%
        </button>
        <button
          className="leading-tight"
          onClick={(e) => {
            updateAmount(e, 100);
          }}
        >
          100%
        </button>
      </div>
      {/* CoinField */}
      <CoinField {...props} />
    </>
  );
}
