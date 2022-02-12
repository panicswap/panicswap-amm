import React from "react";
import "./App.css";
import { ethers } from "ethers";
import NarBar from "./NavBar/NavBar";
import CoinSwapper from "./CoinSwapper/CoinSwapper";
import FarmList from "./FarmList/FarmList";
import FarmDetails from "./FarmDetails/FarmDetails";
import TokenPage from "./TokenPage/TokenPage";
import { Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Liquidity from "./Liquidity/Liquidity";
import ConnectWalletPage from "./Components/connectWalletPage";
import { createTheme, ThemeProvider } from "@material-ui/core";
import Footer from "./Components/Footer";


const theme = createTheme({
  palette: {
    primary: {
      main: "#ff0000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9e9e9e",
      contrastText: "#ffffff",
    },
  },
});

function App() {
  // Check if wallet is here:
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return (
      <div className="App">
        <SnackbarProvider maxSnack={3}>
          <ThemeProvider theme={theme}>
            <NarBar />
            <Route
              exact
              path="/"
              component={CoinSwapper}
            />
            <Route
              exact
              path="/liquidity"
              component={Liquidity}
            />
            <Route
              exact
              path="/farms"
              component={FarmList}
            />
            <Route
              exact
              path="/farms/:farmId"
              component={FarmDetails}
            />
            <Route
              exact
              path="/stake"
              component={TokenPage}
            />

            <Footer />
          </ThemeProvider>
        </SnackbarProvider>
      </div>
    );
  } catch (err) {
    return (
      <div className="App">
        <SnackbarProvider maxSnack={3}>
          <ThemeProvider theme={theme}>
            <ConnectWalletPage />
            <Footer />
          </ThemeProvider>
        </SnackbarProvider>
      </div>
    );
  }
}

export default App;
