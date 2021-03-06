import * as chains from "./chains";

// If you add coins for a new network, make sure Weth address (for the router you are using) is the first entry

const FANTOMCoins = [
  {
    name: "Fantom",
    abbr: "FTM",
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  },
  {
    name: "Wrapped Fantom",
    abbr: "WFTM",
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
  },
  {
    name: "PanicSwap's Native Token",
    abbr: "PANIC",
    address: "0xA882CeAC81B22FC2bEF8E1A82e823e3E9603310B",
  },
  {
    name: "PANIC locked on Beluga",
    abbr: "bePANIC",
    address: "0x263C3A87e7a3201e23bC9B3BC20cc48326F453F6",
  },
  {
    name: "Ethereum",
    abbr: "ETH",
    address: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
  },
  {
    name: "Bitcoin",
    abbr: "BTC",
    address: "0x321162Cd933E2Be498Cd2267a90534A804051b11",
  },
  {
    name: "renproject.io BTC",
    abbr: "renBTC",
    address: "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501",
  },
  {
    name: "DAI",
    abbr: "DAI",
    address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
  },
  {
    name: "Circle USD",
    abbr: "USDC",
    address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
  },
  {
    name: "Binance Coin",
    abbr: "BNB",
    address: "0xD67de0e0a0Fd7b15dC8348Bb9BE742F3c5850454",
  },
  {
    name: "Beluga",
    abbr: "BELUGA",
    address: "0x4a13a2cf881f5378def61e430139ed26d843df9a",
  },
  {
    name: "Hundred.finance native token",
    abbr: "HND",
    address: "0x10010078a54396F62c96dF8532dc2B4847d47ED3",
  },
  {
    name: "Hundred.finance locked on beluga.fi",
    abbr: "beHND",
    address: "0x35b9b18db4a712655d796e058c6241f015b308b2",
  },
  {
    name: "Fresh Beets",
    abbr: "fBEETS",
    address: "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1",
  },
  {
    name: "Beluga locked Fresh Beets",
    abbr: "beBEETS",
    address: "0xd46a5acf776a84fFe7fA7815d62D203638052fF4",
  },
  {
    name: "SpookySwap's Native Token",
    abbr: "BOO",
    address: "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE",
  },
  {
    name: "Yearn Finance's Native Token",
    abbr: "YFI",
    address: "0x29b0Da86e484E1C0029B56e817912d778aC0EC69",
  },
  {
    name: "Solidly's Native Token",
    abbr: "SOLID",
    address: "0x888EF71766ca594DED1F0FA3AE64eD2941740A20",
  },
  {
    name: "SOLID locked on oxdao.fi",
    abbr: "oxSOLID",
    address: "0xDA0053F0bEfCbcaC208A3f867BB243716734D809",
  },
  {
    name: "Elite",
    abbr: "ELITE",
    address: "0xf43Cc235E686d7BC513F53Fbffb61F760c3a1882",
  },
];

const AUTONITYCoins = [
  {
    name: "Auton",
    abbr: "AUT",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Newton",
    abbr: "NEW",
    address: "0xBd770416a3345F91E4B34576cb804a576fa48EB1",
  },
  {
    name: "Token A",
    abbr: "TA",
    address: "0xD5073808CbA7d24500aa8f659B339b87945958a6",
  },
  {
    name: "Token B",
    abbr: "TB",
    address: "0x908B8e60d149529d757F4aEd9320F246724f2b99",
  },
  {
    name: "Token C",
    abbr: "TC",
    address: "0x03c7D835CceE5d741b3f3D144eBfC5327925ECf9",
  },
  {
    name: "Token D",
    abbr: "TD",
    address: "0x90636A8bb3AD4C2168EE20CF5E6183D827Da2E91",
  },
];

const DEVNETCoins = [
  {
    name: "Auton",
    abbr: "AUT",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Newton",
    abbr: "NEW",
    address: "0xBd770416a3345F91E4B34576cb804a576fa48EB1",
  },
  {
    name: "Token A",
    abbr: "TA",
    address: "0xD5073808CbA7d24500aa8f659B339b87945958a6",
  },
  {
    name: "Token B",
    abbr: "TB",
    address: "0x908B8e60d149529d757F4aEd9320F246724f2b99",
  },
];

const PARASTATECoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Token A",
    abbr: "TA",
    address: "0x4EDFE8706Cefab9DCd52630adFFd00E9b93FF116",
  },
  {
    name: "Token B",
    abbr: "TB",
    address: "0x4489D87C8440B19f11d63FA2246f943F492F3F5F",
  },

  {
    name: "Token C",
    abbr: "TC",
    address: "0x1d29BD2ACedBff15A59e946a4DE26d5257447727",
  },
  {
    name: "Token D",
    abbr: "TD",
    address: "0xc108a13D00371520EbBeCc7DF5C8610C71F4FfbA",
  },
];

const MAINNETCoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
];

const ROPSTENCoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0xad6d458402f60fd3bd25163575031acdce07538d",
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0x6ee856ae55b6e1a249f04cd3b947141bc146273c",
  },
];

const KOVANCoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // // Weth address is fetched from the router
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0xf3e0d7bf58c5d455d31ef1c2d5375904df525105",
  },
];

const RINKEBYCoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0x95b58a6bff3d14b7db2f5cb5f0ad413dc2940658",
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0x3b00ef435fa4fcff5c209a37d1f3dcff37c705ad",
  },
];

const G??RLICoins = [
  {
    name: "Ether",
    abbr: "ETH",
    address: "", // Weth address is fetched from the router
  },
  {
    name: "Dai",
    abbr: "DAI",
    address: "0x73967c6a0904aa032c103b4104747e88c566b1a2",
  },
  {
    name: "Tether USD",
    abbr: "USDT",
    address: "0x509ee0d083ddf8ac028f2a56731412edd63223b9",
  },
];

const COINS = new Map();
COINS.set(chains.ChainId.MAINNET, MAINNETCoins);
COINS.set(chains.ChainId.FANTOM, FANTOMCoins);
COINS.set(chains.ChainId.ROPSTEN, ROPSTENCoins);
COINS.set(chains.ChainId.RINKEBY, RINKEBYCoins);
COINS.set(chains.ChainId.G??RLI, G??RLICoins);
COINS.set(chains.ChainId.KOVAN, KOVANCoins);
COINS.set(chains.ChainId.AUTONITY, AUTONITYCoins);
COINS.set(chains.ChainId.DEVNET, DEVNETCoins);
COINS.set(chains.ChainId.PARASTATE, PARASTATECoins);
export default COINS;
