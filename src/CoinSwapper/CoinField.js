import React from "react";
import { Fab, Grid, InputBase, makeStyles } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";
import * as COLORS from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    minHeight: "80px",
    backgroundColor: COLORS.grey[50],
    borderRadius: theme.spacing(2),
    borderColor: COLORS.grey[300],
    borderWidth: "1px",
    borderStyle: "solid",
    alignItems: "center",
    alignText: "center",
  },
  container_input: {
    padding: theme.spacing(1),
    minHeight: "80px",
    backgroundColor: COLORS.grey[50],
    borderRadius: theme.spacing(2),
    borderColor: COLORS.grey[300],
    borderWidth: "1px",
    borderStyle: "solid",
    marginLeft: "50%",
    textAlign: "right",
  },
  container_blank: {
    padding: theme.spacing(1),
    minHeight: "66px",
    borderRadius: theme.spacing(2),
  },
  grid: {
    height: "80px",
  },
  fab: {
    zIndex: "0",
    height: "50px",
  },
  input: {
    width: "100%",
  },
  inputBase: {
    textAlign: "right",
    fontSize: "28px",
    padding: "0px",
    height: "35px",
  },
  swapTokenIcon: {
    marginRight: "5px",
  },
  hr: {
    margin: 1,
  },
  iconButton: {
    borderRadius: "25px",
    background: "#e5e5e5",
    color: "#333333",
    height: "60px",
    paddingLeft: theme.spacing(1),
  },
  balanceText: {
    display: "grid",
    justifyContent: "left",
  },
  balanceNumber: {
    display: "grid",
    justifyContent: "right",
    color: "#6f6f6f",
    height: "20px",
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textAlign: "right",
  },
  swapBalance: {
    height: "30px",
    display: "grid",
    justifyContent: "right",
  },
  rightSideOfSwap: {
    maxHeight: "66px",
  },
  symbolName: {
    fontSize: "15px",
    height: "25px",
    display: "grid",
    justifyContent: "right",
    color: "#6f6f6f",
  },
}));

CoinField.propTypes = {
  onClick: PropTypes.func.isRequired,
  symbol: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  activeField: PropTypes.bool.isRequired,
};

// Ignore balance for unselected tokens
function checkIfSelect(str) {
  var string = str;
  if (string == "undefined") {
    return 0.0;
  } else {
    return str;
  }
}

export default function CoinField(props) {
  // This component is used to selecting a token and entering a value, the props are explained below:
  //      onClick - (string) => void - Called when the button is clicked
  //      symbol - string - The text displayed on the button
  //      value - string - The value of the text field
  //      onChange - (e) => void - Called when the text field changes
  //      activeField - boolean - Whether text can be entered into this field or not
  //      userCanChoose - boolean - Whether user can select coin or not

  const {
    onClick,
    symbol,
    value,
    onChange,
    activeField,
    userCanChoose,
    maxValue,
  } = props;

  return (
    <div className="flex items-center justify-between p-3 py-1 bg-white dark:bg-slate-700 rounded-xl">
      {/* Button */}
      <div onClick={onClick} className="cursor-pointer">
        <img
          src={"/assets/token/" + symbol + ".svg"}
          className="shadow-lg rounded-full w-[60px]"
        />
      </div>

      <div className="flex flex-col items-end">
        {/* Balance */}
        <div className="dark:text-gray-400">
          {"Balance: " + checkIfSelect(maxValue !== undefined ? maxValue : 0.0)}
        </div>

        {/* Input */}
        <input
          className="bg-transparent font-mono text-right text-3xl outline-none placeholder:text-black w-full dark:text-white dark:placeholder:text-gray-400"
          min="0"
          type="number"
          value={value}
          onChange={onChange}
          placeholder="0.0"
          disabled={!activeField}
        />

        {/* Symbol */}
        <div className="text-xs dark:text-gray-400 dark:bg-slate-800 px-1 rounded-md">
          {symbol !== "Select" && <>{symbol}</>}
        </div>
      </div>
    </div>
  );
}
