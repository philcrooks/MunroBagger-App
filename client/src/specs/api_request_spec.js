process.env.NODE_ENV = 'test';

const sinon = require('sinon');
const assert = require("assert");
const ApiRequest = require('../models/api_request')
const stubData = require("./stub_data");
const baseURL = "https://www.munrobagger.scot/"
const token = "JsonWebToken";

describe("API Request", function() {

  var server;
  var apiRequest;

  describe("All Request Types", function() {

    beforeEach(function() {
      server = sinon.fakeServer.create();
      apiRequest = new ApiRequest();
    });

    afterEach(function () {
      server.restore();
    });

    it("Makes a GET Request", function () {
      const url = baseURL + "munros";
      const json = stubData.jsonMunros();

      server.respondWith("GET", url, [200, { "Content-Type": "application/json" }, json ]);

      var callback = sinon.spy();

      apiRequest.makeGetRequest(url, token, true, callback);

      server.respond(); // Process all requests so far
      console.log(server.requests); // Logs all requests so far

      assert.strictEqual(callback.calledOnce, true);
      assert.strictEqual(callback.calledWith([200, json]), true);

      expect(callbacks[1].calledOnce).toBeFalsy(); // Unknown URL /other received 404
    });
  });
});