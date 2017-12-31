# Crypto Tracker using AWS Lambda service
Track prices of cryptocurrencies on various exchanges using AWS Lambda service

This is a simple script to keep track of specified cryptocurrency prices in various exchanges. It will retrive the last done price of the specified ticker on the exchange and check against the DB for previous (if any) record of this ticker/exchange match.
If a certain percentage threshold is met, email will be triggered.

## Setup

### Dynamo DB
Create a Dynamo DB table and set name of Table in `config.tableDB` of config.js

### Set API credentials
Enter the API credentials for the exchanges in `config.<exchange>ApiKey` and `config.<exchange>ApiSecret` of config.js.

### Set the threshold before triggering action
The threshold is in percentage and can be set in `config.percentageThreshold` of config.js.

### Email address
Set the notification email address in `config.emailAddress` of config.js.

### Set the ticker to be tracked
The ticker differs from each exchange and can be set in the respective `config.<exchange>Ticker' of config.js.

### Dependencies

For Binance API,
```
npm install node-binance-api
```
For Bittrex API,
```
npm install node-bittrex-api
```

### Deploy this to AWS Lambda
Zip these up, go to Lambda, and upload the zip.

### Set up Cloudwatch Rule to run the Lambda on a schedule
Go to Cloudwatch, and run the service as often as you want.

## Further possible enhancements
1. You can choose to dynamically set the ticker and exchange through Cloudwatch input and sends to Lambda for consumption.
2. Do more than just email! Perform trades, notify via SMS/SNS, etc
