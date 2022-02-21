import React from "react";
import "./App.css";
import { ethers } from "ethers";
import Header from "./Header/Header";
import NavBar from "./NavBar/NavBar";
import CoinSwapper from "./CoinSwapper/CoinSwapper";
import FarmList from "./FarmList/FarmList";
import FarmDetails from "./FarmDetails/FarmDetails";
import TokenPage from "./TokenPage/TokenPage";
import Migration from "./Migration/Migration";
import { Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Liquidity from "./Liquidity/Liquidity";
import ConnectWalletPage from "./Components/connectWalletPage";
import { createTheme, ThemeProvider } from "@material-ui/core";
import Footer from "./Components/Footer";


const theme = createTheme({
  palette: {
    primary: {
      main: "#3cc6f4",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f2f2f2",
      contrastText: "#555",
    },
  },
  shadows: [
    "none",
    "0px 3px 10px -1px rgb(0 0 0 / 20%)",
    ...Array(23).fill('none')
  ],
  overrides: {
    MuiPaper: {
      root: {
        padding: "2rem"
      },
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
            <Header />
            <NavBar />
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
            <Route
              exact
              path="/migration"
              component={Migration}
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
            <Header />
            <ConnectWalletPage />
            <Footer />
          </ThemeProvider>
        </SnackbarProvider>
      </div>
    );
  }
}

export default App;
