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
 * @param {Number} precision Decimals
 * @param {Boolen} onlyDirectPaths True to block the call only to direct path
 * @return {Promise}
 */
CurrencyConverter.Convert = function(value, fromCurrency, toCurrency, exchanges, precision, onlyDirectPaths) {
    var self = this;
    if(!value)
        return;

    var rate = self.GetExchangeRate(fromCurrency, toCurrency, exchanges, precision, onlyDirectPaths);
    if(!isValid(rate))
        return;

    return math.round(value * rate, 0);
}

/**
 * Get a exchange rate to convert a value from fromCurrency to toCurrency
 * @param {String} fromCurrency The starting currency
 * @param {String} toCurrency The ending currency
 * @param {Object} exchanges Formatted as {[DD]:{DA:T}}
 * @param {Number} precision Decimals
 * @param {Boolen} onlyDirectPaths True to block the call only to direct path
 * @return {Promise}
 */
CurrencyConverter.GetExchangeRate = function(fromCurrency, toCurrency, exchanges, precision, onlyDirectPaths) {
    var self = this;
    if(!fromCurrency || !toCurrency || !exchanges)
        return;

    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();
    precision = precision === undefined || precision === null ? 4 : precision;
    if(fromCurrency == toCurrency)
        return 1.0;

    var rate = exchanges && exchanges[fromCurrency] && exchanges[fromCurrency][toCurrency];
    if(!isValid(rate)) {
        var inverse = exchanges && exchanges[toCurrency] && exchanges[toCurrency][fromCurrency];
        if(inverse) rate = math.round(1 / inverse, precision);
    }

    if(!isValid(rate) && !onlyDirectPaths) {
        rate = calculateRateByPath(fromCurrency, toCurrency, exchanges, precision);
    }

    return rate && math.round(rate, precision);
}



// PRIVATE FUNCTIONS

function calculateRateByPath (cFrom, cTo, exchanges, precision) {
    var biExchanges = buildBidirectionalExchanges(exchanges, precision);

    var paths = findPathTo(cTo, biExchanges, cFrom);
    var shortedPath = getShortestPath(paths);
    if(!shortedPath)
        return;
    
    var rate = 1;
    var last;
    shortedPath.forEach(function(current, index) {
        if(last) {
            var rateCurrent = CurrencyConverter.GetExchangeRate(last, current, biExchanges, precision);
            if(isValid(rateCurrent)) {
                rate = rate * rateCurrent;
            }
        }
        last = current;
    });
    return rate;
}

function buildBidirectionalExchanges (exchanges, precision) {
    if(!exchanges)
        return;

    var keysFrom = Object.getOwnPropertyNames(exchanges);
    keysFrom.forEach(function(cf, cfIndex) {
        var tab = exchanges[cf];
        if(!tab) return;

        var keysTo = Object.getOwnPropertyNames(tab);
        keysTo.forEach(function(ct, ctIndex) {
            var inverse = exchanges[cf] && exchanges[cf][ct];
            if(!isValid(inverse))
                return;

            var value = (inverse == 0) ? inverse : math.round(1 / inverse, precision);

            exchanges[ct] = exchanges[ct] || {};
            if(exchanges[ct][cf] == undefined || exchanges[ct][cf] == null) exchanges[ct][cf] = value;
        });
    });
    return exchanges;
}

function listNexts (target, exchanges) {
    if(!exchanges || !exchanges[target])
        return;

    return Object.getOwnPropertyNames(exchanges[target]);
}

function findPathTo (cTo, biExchanges, cCurrent, cPath, accPaths) {
    accPaths = accPaths || [];
    cPath = cPath && cPath.slice(0) || [];
    if(!cTo || !biExchanges || !cCurrent)
        return accPaths;

    // if current is already in the path so you get a close cicle, so this is not a good path to keep
    if(cPath.indexOf(cCurrent) >= 0)
        return accPaths;

    // if current is the target, so you get your path :-)
    if(cTo == cCurrent) {
        cPath.push(cTo);
        accPaths.push(cPath);
        return accPaths;
    }

    // otherwise, you have to get the road to continue
    var nexties = listNexts(cCurrent, biExchanges);

    // if there isn't a path to go, so this is another path to forget
    if(!nexties || !nexties.length)
        return accPaths;

    cPath.push(cCurrent);
    nexties.forEach(function(cItem, index) {
        findPathTo(cTo, biExchanges, cItem, cPath, accPaths);
    });
    return accPaths;
}

function getShortestPath (paths) {
    if(!paths || !paths.length)
        return;

    var shortedPath;
    paths.forEach(function(cPath, index) {
        if(!cPath || !cPath.length)
            return;

        shortedPath = !shortedPath || shortedPath.length > cPath.length ? cPath : shortedPath;
    });
    return shortedPath;
}

function isValid (val) {
    return val === undefined || val === null ? false : true;
}