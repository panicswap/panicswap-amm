import React from "react";
import SwitchButton from "./SwitchButton";
import LiquidityDeployer from "./LiquidityDeployer";
import LiquidityRemover from "./RemoveLiquidity";

function Liquidity() {
  const [deploy, setDeploy] = React.useState(true);

  const deploy_or_remove = (deploy) => {
    if (deploy === true) {
      return <LiquidityDeployer />;
    }
    return <LiquidityRemover />;
  };

  return (
    <div className="px-2">
      <div className="max-w-lg mx-auto bg-lightGray dark:from-transparent dark:to-transparent dark:bg-slate-800 dark:text-white p-3 rounded-3xl">
        <div className="flex mb-2 items-center">
          <>
            <h3 className="text-xl font-bold font-display p-3">Liquidity</h3>
          </>
          <div className="flex ml-auto">
            <SwitchButton setDeploy={setDeploy} />
          </div>
        </div>
        <div>{deploy_or_remove(deploy)}</div>
      </div>
    </div>
  );
}

export default Liquidity;
