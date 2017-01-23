global.ROOT_DIR = __dirname;

var CC = require(ROOT_DIR + "/lib/currencyconverter.js");

var args = process && process.argv && process.argv.slice(2);
var fileinput = args && args.length > 0 && args[0];
if(!fileinput) {
    console.log("ERROR : missing input file name.");
    return;
}

CC.ConvertFromFile(fileinput).then(function(converted, err){
    console.log(converted);
    if(err) console.log(err);
});