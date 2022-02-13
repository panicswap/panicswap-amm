import React from "react";
import { useTheme } from '@material-ui/styles';
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
      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = theme.palette.primary.main;
      add_button.style.color = theme.palette.primary.contrastText;

      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = theme.palette.secondary.main;
      remove_button.style.color = theme.palette.secondary.contrastText;
    } else {
      let remove_button = document.getElementById("remove-button");
      remove_button.style.backgroundColor = theme.palette.primary.main;
      remove_button.style.color = theme.palette.primary.contrastText;

      let add_button = document.getElementById("add-button");
      add_button.style.backgroundColor = theme.palette.secondary.main;
      add_button.style.color = theme.palette.secondary.contrastText;
    }
  };

  return (
    <div>
      <ButtonGroup size="large" variant="contained">
        <Button
          id="add-button"
          className={classes.btnGroup}
          color="primary"
          text="white"
          onClick={() => {
            setDeploy(true);
            changeStyles(true);
          }}
        >
          Deploy Liquidity
        </Button>

        <Button
          id="remove-button"
          className={classes.btnGroup}
          color="secondary"
          text="white"
          onClick={() => {
            setDeploy(false);
            changeStyles(false);
          }}
        >
          Remove Liquidity
        </Button>
      </ButtonGroup>
    </div>
  );
}
