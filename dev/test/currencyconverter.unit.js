var expect = require("chai").expect;

global.ROOT_DIR = __dirname + "/..";

var CC = require(ROOT_DIR + "/lib/currencyconverter");

describe("unit.currencyconverter", function() {
    before(function(done) {
        done();
    });

    after(function(done) {
        done();
    });

    beforeEach(function(done) {
        done();
    });

    afterEach(function(done) {
        done();
    });

    describe("GetExchangeRate", function() {
        var cases = [
            {r:undefined},
            {f:"AUD", t:"CHF", r:undefined},
            {f:"AUD", t:"CHF", e:{}, r:undefined},
            {f:"AUD", t:"CHF", e:{AUD:{}}, r:undefined},
            {f:"CHF", t:"CHF", e:{}, r:1},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0}}, r:0},
            {f:"AUD", t:"CHf", e:{AUD:{CHF:0}}, r:0},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:1}}, r:1},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}}, r:0.9785},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}}, r:0.9785425, p:7},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}}, r:0.978543, p:6},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}}, r:0.97854, p:5},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}}, r:0.979, p:3},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}}, r:1.0, p:1},
            {f:"CHF", t:"AUD", e:{AUD:{CHF:0.9785425}}, r:1.02, p:2},
            {f:"CHF", t:"AUD", e:{AUD:{CHF:0.9785425}, CHF:{AUD:0.67346}}, r:0.6735},
            {f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}, CHF:{AUD:0.67346}}, r:0.9785},
        ];

        afterEach(function(done) {
            done();
        });

        beforeEach(function(done) {
            done();
        });

        cases.forEach(function(caseConfig, index) {
            it("case-" + index, function(done) {
                var cFrom = caseConfig.f;
                var cTo = caseConfig.t;
                var cEx = caseConfig.e;
                var cPrecision = caseConfig.p;
                var expectedResponse = caseConfig.r;

                var rate = CC.GetExchangeRate(cFrom, cTo, cEx, cPrecision);

                expect(rate).to.be.equal(expectedResponse);
                done();
            });
        });
        
    });


    describe("Convert", function() {
        var cases = [
            {v:1, r:undefined},
            {v:1, f:"AUD", t:"CHF", r:undefined},
            {v:1, f:"AUD", t:"CHF", e:{}, r:undefined},
            {v:1, f:"AUD", t:"CHF", e:{AUD:{}}, r:undefined},
            {v:1, f:"CHF", t:"CHF", e:{}, r:1},
            {v:5, f:"CHF", t:"CHF", e:{}, r:5},
            {v:5, f:"AUD", t:"CHF", e:{AUD:{CHF:0}}, r:0},
            {v:5, f:"AUD", t:"CHf", e:{AUD:{CHF:0}}, r:0},
            {v:5, f:"AUD", t:"CHF", e:{AUD:{CHF:1}}, r:5},
            {v:5.987654, f:"AUD", t:"CHF", e:{AUD:{CHF:1}}, r:6},
            {v:5.987654, f:"AUD", t:"CHF", e:{AUD:{CHF:1}}, r:6, p:7},
            {v:5, f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}}, r:5},
            {v:10, f:"AUD", t:"CHF", e:{AUD:{CHF:0.449432198}}, r:4, p:7},
            {v:10, f:"AUD", t:"CHF", e:{AUD:{CHF:0.449432198}}, r:5, p:2},
            {v:10, f:"AUD", t:"CHF", e:{AUD:{CHF:0.449432198}}, r:0, p:0},
            {v:10, f:"CHF", t:"AUD", e:{AUD:{CHF:0.9785425}, CHF:{AUD:0.67346}}, r:7},
            {v:10, f:"AUD", t:"CHF", e:{AUD:{CHF:0.9785425}, CHF:{AUD:0.67346}}, r:10},
        ];

        afterEach(function(done) {
            done();
        });

        beforeEach(function(done) {
            done();
        });

        cases.forEach(function(caseConfig, index) {
            it("case-" + index, function(done) {
                var cVal = caseConfig.v;
                var cFrom = caseConfig.f;
                var cTo = caseConfig.t;
                var cEx = caseConfig.e;
                var cPrecision = caseConfig.p;
                var expectedResponse = caseConfig.r;

                var converted = CC.Convert(cVal, cFrom, cTo, cEx, cPrecision);

                expect(converted).to.be.equal(expectedResponse);
                done();
            });
        });
        
    });

    describe("ConvertFromFile", function() {
        var cases = [
            {i:ROOT_DIR + "/test/inputtest.txt", r:undefined},
            {i:ROOT_DIR + "/test/inputtest.1.txt", r:663},
            {i:ROOT_DIR + "/test/inputtest.2.txt", r:456},
        ];

        afterEach(function(done) {
            done();
        });

        beforeEach(function(done) {
            done();
        });

        cases.forEach(function(caseConfig, index) {
            it("case-" + index, function(done) {
                var cFile = caseConfig.i;
                var expectedResponse = caseConfig.r;

                CC.ConvertFromFile(cFile)
                .then(function(converted, err) {
                    expect(converted).to.be.equal(expectedResponse);
                    done();
                });
            });
        });
        
    });
});