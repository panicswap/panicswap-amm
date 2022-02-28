import React from "react";
import {
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
  Switch,
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
    <div className="px-2">
      <div className="max-w-lg mx-auto bg-blue-100 bg-gradient-to-bl from-blue-300 to-blue-100 p-3 rounded-3xl">
        <div className="flex justify-center">
          <SwitchButton setDeploy={setDeploy} />
        </div>
        <div>{deploy_or_remove(deploy)}</div>
      </div>
    </div>
  );
}

export default Liquidity;
