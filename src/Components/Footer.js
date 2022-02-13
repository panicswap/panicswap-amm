import React from "react";
import {
    Grid,
    makeStyles, 
    Typography
  } from "@material-ui/core";

  const styles = (theme) => ({
    footer: {
      marginTop: theme.spacing(4),
      padding: theme.spacing(1),
      textAlign: "center",
    },
    title: {
        margin: theme.spacing(2),
        display: "block"
    }
  });

const useStyles = makeStyles(styles);

export default function Footer() {
    const classes = useStyles();

    return (
        <Grid
            container
            className={classes.footer}
            direction="row"
            justifyContent="center"
            alignItems="flex-end"
        >
            <p>
                <Typography variant="" className={classes.title}>
                    PanicSwap 💙
                </Typography>
                
                
                <a href="https://ftmscan.com/address/0x41abb76d39c4dcd885340f9b98c26b51250644cc">MasterChef Contract</a> |&nbsp;
                <a href="https://ftmscan.com/address/0xa341d77315e5e130ad386e034b4c9714cb149f4a">Spookyswap PANIC-WFTM</a> 

                <br /> <br />

                <a href="https://medium.com/@thepanicswap/">Medium</a> |&nbsp;
                <a href="https://t.me/panic_swap">Telegram</a> |&nbsp;
                <a href="https://discord.gg/xNpFVYxQcZ">Discord</a> |&nbsp;
                <a href="https://github.com/panicswap">GitHub</a> |&nbsp;
                <a href="https://twitter.com/panic_swap">Twitter</a>
            </p>
        </Grid>

    );
}