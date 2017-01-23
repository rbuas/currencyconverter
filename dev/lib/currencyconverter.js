var fs = require("fs");
var path = require("path");
var math = require("mathjs");

module.exports = CurrencyConverter = {};


/**
 * Convert operation loaded from an input file
 * @param {String} filename local full filename
  * @return {Promise}
 */
CurrencyConverter.ConvertFromFile = function(filename) {
    var self = this;
    filename = filename && path.normalize(filename);
    if(!filename)
        return Promise.reject(new Error('Missing filename'));;

    var filecontent = fs.readFileSync(filename, 'utf8');
    if(!filecontent)
        return Promise.reject(new Error('Error on read file from ' + filename));

    return self.ParseInputText(filecontent);
}

/**
 * Parse a string to operation to make and to load exchanges rates
 * @param {String} inputText string to parse
 * @return {Promise}
 */
CurrencyConverter.ParseInputText = function(inputText) {
    var self = this;
    if(!inputText)
        return Promise.reject(new Error('Error on read input text'));

    return new Promise(function(resolve, reject) {
        var text = inputText;
        var textLines = text.split("\n");
        if(!textLines || !textLines.length)
            return reject(new Error('Error empty lines'));

        var convCmd = textLines.length > 1 && textLines[0].trim();
        if(!convCmd)
            return reject(new Error('Error no convertion command line.'));

        var commandArgs = convCmd.split(";");
        if(!commandArgs || commandArgs.length != 3)
            return reject(new Error('Error bad formatted command line, params count : ' + (commandArgs.length || 0) + '.'));

        var cFrom = commandArgs[0].trim();
        var value = Number(commandArgs[1].trim());
        var cTo = commandArgs[2].trim();
        var exchanges = {}; //TODO : get lines DD;DA;T => {[DD]:{[DA]:T}}
        for(var i = 2; i < textLines.length; ++i) {
            var line = textLines[i].trim();
            if(!line)
                return reject(new Error('Error bad formatted exchange line :  ' + (line || "") + '.'));

            var lineArgs = line.split(";");
            if(!lineArgs || lineArgs.length != 3)
                return reject(new Error('Error bad formatted exchange line :  ' + (line || "") + '.'));

            var cf = lineArgs[0].trim();
            var ct = lineArgs[1].trim();
            var cv = Number(lineArgs[2].trim());
            if(!cf || !ct || cv === undefined || cv === null)
                return reject(new Error('Error bad formatted exchange line :  ' + (line || "") + '.'));

            exchanges[cf] = exchanges[cf] || {};
            exchanges[cf][ct] = cv;
        }
        var converted = self.Convert(value, cFrom, cTo, exchanges);
        return resolve(converted);
    });
}

/**
 * Convert a value from fromCurrency to toCurrency
 * @param {Number} value  Value to Convert
 * @param {String} fromCurrency The starting currency
 * @param {String} toCurrency The ending currency
 * @param {Object} exchanges Formatted as {[DD]:{DA:T}}
 * @return {Promise}
 */
CurrencyConverter.Convert = function(value, fromCurrency, toCurrency, exchanges, precision) {
    var self = this;
    if(!value)
        return;

    var rate = self.GetExchangeRate(fromCurrency, toCurrency, exchanges, precision);
    if(rate === undefined || rate === null)
        return;

    return math.round(value * rate, 0);
}

/**
 * Get a exchange rate to convert a value from fromCurrency to toCurrency
 * @param {String} fromCurrency The starting currency
 * @param {String} toCurrency The ending currency
 * @param {Object} exchanges Formatted as {[DD]:{DA:T}}
 * @return {Promise}
 */
CurrencyConverter.GetExchangeRate = function(fromCurrency, toCurrency, exchanges, precision) {
    var self = this;
    if(!fromCurrency || !toCurrency || !exchanges)
        return;

    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();
    precision = precision === undefined || precision === null ? 4 : precision;
    if(fromCurrency == toCurrency)
        return 1.0;


    var rate = exchanges && exchanges[fromCurrency] && exchanges[fromCurrency][toCurrency];
    if(rate === undefined || rate === null) {
        var inverse = exchanges && exchanges[toCurrency] && exchanges[toCurrency][fromCurrency];
        if(inverse) rate = math.round(1 / inverse, precision);
    }
    return rate && math.round(rate, precision);
}