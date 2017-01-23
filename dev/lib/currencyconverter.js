var fs = require("fs");
var math = require("mathjs");

module.exports = CurrencyConverter = {};


/**
 * Load an input file from filename
 * @param {String} filename local full filename
  * @return {Promise}
 */
CurrencyConverter.LoadInputFile = function(filename) {
    //TODO
}

/**
 * Parse a string to operation to make and to load exchanges rates
 * @param {String} inputText string to parse
 * @return {Promise}
 */
CurrencyConverter.ParseInputText = function(inputText) {
    //TODO
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
