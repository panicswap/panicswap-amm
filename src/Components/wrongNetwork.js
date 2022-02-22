import React from "react";
import {
  Dialog,
  Grid,
  IconButton,
  makeStyles,
  Typography,
  withStyles,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";

const styles = (theme) => ({
  dialogContainer: {
    borderRadius: theme.spacing(2),
  },
  centerText: {
    textAlign: "center",
  },
  networkLink: {
    color: "#3DC6F5",
  }
});

const useStyles = makeStyles(styles);

export default function WrongNetwork(props) {

  const classes = useStyles();
  const {open} = props;
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      classes={{ paper: classes.dialogContainer }}
    >
      <MuiDialogTitle class={classes.centerText}>
        <b>Unsupported Network</b>
      </MuiDialogTitle>
      <Typography className={classes.centerText}>
       {"Please connect to the "}
      <a href="https://docs.fantom.foundation/tutorials/set-up-metamask" className={classes.networkLink}>
        Fantom Mainnet
      </a>
        {" network."}
      </Typography>
    </Dialog>
  );
}
