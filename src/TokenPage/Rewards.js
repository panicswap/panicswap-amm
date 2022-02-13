import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch
} from "@material-ui/core";


const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(3),
  },
});

const useStyles = makeStyles(styles);

export default function Rewards() {
  const classes = useStyles();

  return (
    <div>
      <Container>
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            PANIC Rewards
          </Typography>
          
          <section>
            <Typography variant="h6" className={classes.title}>
              For Farmers:
            </Typography>
              <ul>
                <li>
                  PANIC rewards are subject to a 2 year vesting period, but can also be claimed early at a 50% penalty.
                </li>
                <li>
                  Exiting before the end of the vesting period always incurs a 50% penalty no matter how early or late you choose to exit.
                </li>
                <li>
                  The 50% penalty is distributed continuously to PANIC lockers rewarding long-term holders.
                </li>
              </ul>
            </section>


            <section>
            <Typography variant="h6" className={classes.title}>
              For PANIC lockers:
            </Typography>
              <ul>
                <li>
                  Lock dates are grouped by the week. Any lock between Monday to Sunday is grouped in the same week group, and will release at the same time 2 years later.
                </li>
                <li>
                  Locked PANIC is subject to a mandatory 2 years lock, and cannot be unlocked early.
                </li>
                <li>
                  PANIC rewars from locking PANIC can be claimed anytime with no penalty.
                </li>
              </ul>
            </section>

        </Paper>
      </Container>
    </div>
  );
}

