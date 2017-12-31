var config = {};

// threshold before triggering action (in percentage)
config.percentageThreshold = "3";

// DynamoDB config
config.tableDB = "crypto-tracking";

// bittrex setup
config.enableBittrex = true;
config.BITTREX_NAME = "bittrex";
config.bittrexTicker = "USDT-ETH";
config.bittrexApiKey = "enter Bittrex API key";
config.bittrexApisecret = "enter Bittrex API secret";
config.bittrex = require("node-bittrex-api");
config.bittrex.options({
    "apikey" : config.bittrexApiKey,
    "apisecret" : config.bittrexApisecret
});

// binance setup
config.enableBinance = true;
config.BIANACE_NAME = "binance";
config.binanceTicker = "ETHUSDT";
config.binanceApiKey = "enter Binance API key";
config.binanceApiSecret = "enter Binance API secret";
config.binance = require('node-binance-api');
config.binance.options({
  "APIKEY": config.binanceApiKey,
  "APISECRET": config.binanceApiSecret
});

// email address config
config.sourceEmailAddress = "Crypto Tracking <youremail@email.com>";
config.emaillAddresses = ["youremail@email.com"];
config.returnEmailAddress = "youremail@email.com";

module.exports = config;