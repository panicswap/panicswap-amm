import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch
} from "@material-ui/core";

import SwitchButton from "./SwitchButton";
import LiquidityDeployer from "./LiquidityDeployer";
import LiquidityRemover from "./RemoveLiquidity";

const styles = (theme) => ({
  paperContainer: {
    borderRadius: theme.spacing(2),
    maxWidth: 700,
    margin: "auto",
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing(1),
    fontSize: 20,
  },
});

const useStyles = makeStyles(styles);

function Liquidity() {
  const classes = useStyles();

  const [deploy, setDeploy] = React.useState(true);

  const deploy_or_remove = (deploy) => {
    if (deploy === true) {
      return <LiquidityDeployer />;
    }
    return <LiquidityRemover />;
  };

  return (
    <div>
      <Container>
        <Paper className={classes.paperContainer}>
          <Typography variant="h5" className={classes.title}>
            <SwitchButton setDeploy={setDeploy} />
          </Typography>
          {deploy_or_remove(deploy)}
        </Paper>
      </Container>

    </div>
  );
}

export default Liquidity;
