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
    //TODO
}

/**
 * Get a exchange rate to convert a value from fromCurrency to toCurrency
 * @param {String} fromCurrency The starting currency
 * @param {String} toCurrency The ending currency
 * @param {Object} exchanges Formatted as {[DD]:{DA:T}}
 * @return {Promise}
 */
CurrencyConverter.GetExchangeRate = function(fromCurrency, toCurrency, exchanges) {
    //TODO
}
