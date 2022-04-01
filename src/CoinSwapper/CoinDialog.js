import React from "react";
import { motion } from "framer-motion";
import { makeStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import CoinButton from "./CoinButton";
import { doesTokenExist } from "../ethereumFunctions";
import PropTypes from "prop-types";

const styles = (theme) => ({
  dialogContainer: {
    borderRadius: theme.spacing(2),
  },
  titleSection: {
    padding: theme.spacing(2),
  },
  titleText: {
    alignSelf: "center",
  },
  hr: {
    margin: 0,
  },
  address: {
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingBottom: theme.spacing(2),
  },
  coinList: {
    height: "300px",
    overflowY: "scroll",
  },
  coinContainer: {
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    paddingTop: theme.spacing(2),
    marginTop: theme.spacing(2),
    overflow: "hidden",
  },
});

const useStyles = makeStyles(styles);

// This is a modified version of MaterialUI's DialogTitle component, I've added a close button in the top right corner
const DialogTitle = (props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <header className="flex justify-between items-center p-4">
      <h3 className="font-display text-lg">{children}</h3>

      {onClose ? (
        <div
          onClick={onClose}
          className="hover:bg-gray-900 p-1 rounded-full transition-colors cursor-pointer"
        >
          <CloseIcon />
        </div>
      ) : null}
    </header>
  );
};

CoinDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  coins: PropTypes.array.isRequired,
};

export default function CoinDialog(props) {
  // The CoinDialog component will display a dialog window on top of the page, allowing a user to select a coin
  // from a list (list can be found in 'src/constants/coins.js') or enter an address into a search field. Any entered
  // addresses will first be validated to make sure they exist.
  // When the dialog closes, it will call the `onClose` prop with 1 argument which will either be undefined (if the
  // user closes the dialog without selecting anything), or will be a string containing the address of a coin.

  const classes = useStyles();
  const { onClose, open, coins, signer, ...others } = props;

  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState("");

  // Called when the user tries to input a custom address, this function will validate the address and will either
  // then close the dialog and return the validated address, or will display an error.
  const submit = () => {
    if (doesTokenExist(address, signer)) {
      exit(address);
    } else {
      setError("This address is not valid");
    }
  };

  // Resets any fields in the dialog (in case it's opened in the future) and calls the `onClose` prop
  const exit = (value) => {
    setError("");
    setAddress("");
    onClose(value);
  };

  return (
    open && (
      <div
        onClick={(e) => {
          if (e.target.classList.contains("overlay")) {
            exit([undefined, undefined]);
          }
        }}
        className="overlay fixed top-0 right-0 bottom-0 left-0 flex z-20 justify-center items-center bg-[#00000040]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          className="w-[95%] max-w-[500px] h-[85vh] dark:bg-[#131b2e] rounded-xl dark:text-white grid items-center"
        >
          <div>
            <DialogTitle onClose={() => exit([undefined, undefined])}>
              Select a token to swap
            </DialogTitle>

            <div className="m-2">
              <input
                className="p-3 w-full rounded-lg bg-transparent border-2 border-gray-600 focus:border-blue-500"
                disabled
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                variant="outlined"
                placeholder="Paste Address"
                error={error !== ""}
                helperText={error}
              />
            </div>
          </div>

          {/* Maps all of the tokens in the constants file to buttons */}
          <div className="overflow-y-scroll self-start h-full p-3">
            {coins.map((coin, index) => (
              <CoinButton
                logo={coin.abbr}
                coinName={coin.name}
                coinAbbr={coin.abbr}
                onClick={() => exit([coin.address, coin.abbr])}
              />
            ))}
          </div>

          <div className="p-2">
            <button
              onClick={submit}
              className="mt-3 dark:bg-blue-600 w-full rounded-md p-3 font-bold "
            >
              Enter
            </button>
          </div>
        </motion.div>
      </div>
    )
  );
}
