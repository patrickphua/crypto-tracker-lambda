var config = require('./config');
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();
    
exports.handler = function (event, context, callback) {
	// track ticker on bittrex
	if (config.enableBittrex) {
		main(config.BITTREX_NAME, config.bittrexTicker);
	}

	// track ticker on binance
	if (config.enableBinance) {
		main(config.BIANACE_NAME, config.binanceTicker);
	}
};

function main(exchange, ticker) {
	// get last done price on DynamoDB
    var getDBLastDonePromise = docClient.get({TableName:config.tableDB, Key:{"market":exchange+"-"+ticker}}).promise();

	// get last done price on exchange
	var getExchangeLastDonePrice;
    if (exchange === config.BITTREX_NAME) {
    	getExchangeLastDonePrice = new Promise(function(resolve) {
    		config.bittrex.getticker({market:ticker}, function(tickerResult) {
    			resolve(tickerResult.result.Last);
			});
    	});
    } else if (exchange === config.BIANACE_NAME) {
    	getExchangeLastDonePrice = new Promise(function(resolve) {
			config.binance.prices(function(tickerResult) {
				resolve(tickerResult[ticker]);
			});
		});
    }

	Promise.all([getDBLastDonePromise, getExchangeLastDonePrice]).then(values => {
		var lastDoneDB = 0;
		if (values[0].Item === undefined) {
			console.log("No existing entry in DB; will create new entry.");
		} else {
			lastDoneDB = values[0].Item.last_done_price;
		}
		var lastDoneExchange = values[1];
		console.log("Last done on DB: ", lastDoneDB);
		console.log("Last done on Exchange: ", lastDoneExchange);

		// compare prices, if fall below threshold, do something
		if ((1-lastDoneExchange/lastDoneDB) > config.percentageThreshold/100) {

			// do awesome things here
			var percentageDropped = Math.round(((1-(lastDoneExchange/lastDoneDB)) * 100) * 100) / 100;
			console.log("ALERT - Price fell by ", percentageDropped, "%");

			// send email
			sendEmail(lastDoneDB, lastDoneExchange, ticker, percentageDropped);
		}

		// update last done on DB
		updateDBLastDone(exchange, ticker, lastDoneExchange);

	}).catch(function(err) {
		console.log(err);
	});
}

function sendEmail(lastDoneDB, lastDoneExchange, ticker, percentageDropped) {
	var ses = new AWS.SES({
	    apiVersion: "2010-12-01"
	});

	var htmlData = "<b>" + ticker + " price fell by " + percentageDropped + "%</b>" 
		+ "<p>Previous: $" + lastDoneDB + "<br />Now: $" + lastDoneExchange;

	var eparam = {
	    Destination: {
	        ToAddresses: config.emaillAddresses
	    },
	    Message: {
	        Body: {
	            Html: {
	                Data: htmlData
	            }
	        },
	        Subject: {
	            Data: ticker + " price fell by " + percentageDropped + "%"
	        }
	    },
	    Source: config.sourceEmailAddress,
	    ReplyToAddresses: [config.sourceEmailAddress],
	    ReturnPath: config.returnEmailAddress
	};
	ses.sendEmail(eparam, function (err, data) {
	    if (err) console.log(err);
	    else console.log(data);
	});
}

function updateDBLastDone(exchange, ticker, lastDoneExchange) {
	var params = {
		TableName:config.tableDB,
		Key:{
	    	"market": exchange+"-"+ticker
		},
		UpdateExpression: "set last_done_price = :r",
		ExpressionAttributeValues:{
	    	":r":lastDoneExchange
		},
		ReturnValues:"UPDATED_NEW"
	};
	docClient.update(params, function(err, data) {
		if (err) console.error("Unable to update last done price. Error JSON:", JSON.stringify(err, null, 2));
		else console.log("Successfully update DB");
	});
}