process.env.NODE_ENV = 'test';

const ApiRequest = require('../models/api_request');
const dispatcher = require('../models/api_request_dispatcher');
const sinon = require('sinon');
const assert = require("assert");
const server = require('../stubs').HttpServer;
const network = require('../stubs').network;
const stubData = require("./stub_data");
const baseURL = "https://www.munrobagger.scot/";
const token = "JsonWebToken";


describe("API Dispatcher", function() {

  var apiRequest;

  describe ("Queue", function() {
    const munros = stubData.jsonMunros();
    const forecasts = stubData.jsonForecasts();
    const user = JSON.stringify({ id: 11, email: 'email@email.com' });
    const callback = sinon.spy();

    before(function() {
      server.initialize();
      network.online = false;
    });

    it("Enqueues three Requests", function () {
      const user_params = { user: { email: 'email@email.com', password: 'password' } };

      server.respondWith("GET", baseURL + "munros", [200, munros]);
      server.respondWith("GET", baseURL + "forecasts", [200, forecasts]);
      server.respondWith("POST", baseURL + "users", [201, user]);

      new ApiRequest().makeGetRequest(baseURL + "munros", null, false, callback);
      new ApiRequest().makeGetRequest(baseURL + "forecasts", null, false, callback);
      new ApiRequest().makePostRequest(baseURL + "users", user_params, null, false, callback);

      assert.strictEqual(dispatcher._queue.length, 3);
      assert.strictEqual(server.requests.length, 0);
    });

    it("Empties the queue", function () {
      network.online = true;
      dispatcher._online();

      assert.strictEqual(dispatcher._queue.length, 0);
      assert.strictEqual(server.requests.length, 3);
    });

    it("Sends the right requests", function () {
      server.respond();

      assert.strictEqual(callback.callCount, 3);
      let call = callback.getCall(0);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
      call = callback.getCall(1);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(forecasts));
      call = callback.getCall(2);
      assert.strictEqual(call.args[0], 201);
      assert.deepStrictEqual(call.args[1], JSON.parse(user));
    });
  });
});
