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
            Rewards
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}

