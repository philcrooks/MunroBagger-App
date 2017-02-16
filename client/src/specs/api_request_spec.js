process.env.NODE_ENV = 'test';

const sinon = require('sinon');
const assert = require("assert");
const ApiRequest = require('../models/api_request');
const server = require('../stubs').HttpServer;
const stubData = require("./stub_data");
const baseURL = "https://www.munrobagger.scot/";
const token = "JsonWebToken";


describe("API Request", function() {

  var apiRequest;

  describe("All Request Types", function() {

    beforeEach(function() {
      server.initialize();
      apiRequest = new ApiRequest();
    });

    it("Create a GET Request", function () {
      const url = baseURL + "munros";

      apiRequest.makeGetRequest(url, token, true, function(){});

      assert.strictEqual(server.requests[0].verb, "GET");
      assert.strictEqual(server.requests[0].url, url);
      assert.strictEqual(server.requests[0].content, null);
      assert.deepStrictEqual(server.requests[0].headers, { Authorization: 'Bearer JsonWebToken' });
    });

    it("Make a GET Request", function () {
      const url = baseURL + "munros";
      const json = stubData.jsonMunros();
      const callback = sinon.spy();

      server.respondWith("GET", url, [200, json]);

      apiRequest.makeGetRequest(url, token, true, callback);

      server.respond(); // Process all requests so far

      assert.strictEqual(callback.callCount, 1);
      const call = callback.getCall(0);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(json));
    });
  });
});
