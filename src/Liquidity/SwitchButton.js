import React from "react";
import { useTheme } from "@material-ui/styles";
import { makeStyles, ButtonGroup, Button } from "@material-ui/core";

const styles = (theme) => ({
  btnGroup: {
    fontWeight: "bold",
  },
});

const useStyles = makeStyles(styles);

export default function SwitchButton(props) {
  const { setDeploy } = props;
  const theme = useTheme();
  const classes = useStyles();

  const changeStyles = (K) => {
    if (K === true) {
      document.getElementById("add-button").className =
        "bg-blue-500 text-white dark:bg-slate-900 font-bold py-2 px-4 rounded-l-md";
      document.getElementById("remove-button").className =
        "bg-white hover:bg-blue-500 dark:hover:bg-slate-900 hover:text-white dark:text-slate-900 dark:hover:text-white text-slate-600 dark:bg-grey-800 font-bold py-2 px-4 rounded-r-md";
    } else {
      document.getElementById("add-button").className =
        "bg-white hover:bg-blue-500 hover:text-white dark:hover:bg-slate-900 dark:text-slate-900 dark:hover:text-white text-slate-600 dark:bg-grey-800 font-bold py-2 px-4 rounded-l-md";
      document.getElementById("remove-button").className =
        "bg-blue-500 text-white dark:bg-slate-900 font-bold py-2 px-4 rounded-r-md";
    }
  };

  return (
    <div>
      <button
        id="add-button"
        className="bg-blue-500 ext-white font-bold dark:bg-slate-900 text-white py-2 px-4 rounded-l-md"
        onClick={() => {
          setDeploy(true);
          changeStyles(true);
        }}
      >
        Deploy
      </button>

      <button
        id="remove-button"
        className="bg-white hover:bg-blue-500 dark:hover:bg-slate-900 dark:text-slate-900 dark:hover:text-white hover:text-white text-black dark:bg-grey-800 font-bold py-2 px-4 rounded-r-md"
        onClick={() => {
          setDeploy(false);
          changeStyles(false);
        }}
      >
        Remove
      </button>
    </div>
  );
}
