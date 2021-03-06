"use strict"

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
const munros = stubData.jsonMunros();
const forecasts = stubData.jsonForecasts();
const user = JSON.stringify({ id: 11, email: 'email@email.com' });
const user_params = { user: { email: 'email@email.com', password: 'password' } };


describe("API Dispatcher", function() {

  var apiRequest;

  describe ("Queue without timeouts", function() {
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

      var call = callback.getCall(0);
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

  describe ("Queue with timeouts", function() {
    const callback = sinon.spy();
    let status = undefined;
    let response = undefined;

    before(function(done) {
      server.initialize();
      network.online = false;

      server.respondWith("GET", baseURL + "munros", [200, munros]);
      server.respondWith("GET", baseURL + "forecasts", [200, forecasts]);
      server.respondWith("POST", baseURL + "users", [201, user]);

      new ApiRequest().makeGetRequest(baseURL + "munros", null, false, callback);
      new ApiRequest().makePostRequest(baseURL + "users", user_params, null, true, function() {
        status = arguments[0];
        response = arguments[1];
        done();
      });
      new ApiRequest().makeGetRequest(baseURL + "forecasts", null, false, callback);
    });

    it("Expired one request after timeout", function () {
      assert.strictEqual(dispatcher._queue.length, 2);
      assert.strictEqual(server.requests.length, 0);
      assert.strictEqual(status, 600);
      assert.strictEqual(response, null);
    });

    it("Empties the queue", function () {
      network.online = true;
      dispatcher._online();

      assert.strictEqual(dispatcher._queue.length, 0);
      assert.strictEqual(server.requests.length, 2);
    });

    it("Sends the right requests", function () {
      server.respond();

      assert.strictEqual(callback.callCount, 2);

      let call = callback.getCall(0);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
      call = callback.getCall(1);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(forecasts));
    });
  });

  describe ("Queue with timeout and pause", function() {
    const callback = sinon.spy();

    before(function(done) {
      server.initialize();
      network.online = false;

      server.respondWith("GET", baseURL + "munros", [200, munros]);
      server.respondWith("GET", baseURL + "forecasts", [200, forecasts]);
      server.respondWith("POST", baseURL + "users", [201, user]);

      new ApiRequest().makeGetRequest(baseURL + "munros", null, false, callback);
      new ApiRequest().makePostRequest(baseURL + "users", user_params, null, true, callback);
      new ApiRequest().makeGetRequest(baseURL + "forecasts", null, false, callback);
      setTimeout(function(){
        dispatcher._onPause();
        setTimeout(function(){
          done()
        }, 100) // For test network timeout is 100ms
      }, 50)
    });

    it("Does not expire a request after timeout", function () {
      assert.strictEqual(dispatcher._queue.length, 3);
      assert.strictEqual(server.requests.length, 0);
      // Timeout would have forced a callback - check it hasn't happened
      assert.strictEqual(callback.callCount, 0);
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
      assert.strictEqual(call.args[0], 201);
      assert.deepStrictEqual(call.args[1], JSON.parse(user));
      call = callback.getCall(2);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(forecasts));
    });
  });

  describe ("Queue with timeout, pause & resume", function() {
    const callback = sinon.spy();
    let status = undefined;
    let response = undefined;

    before(function(done) {
      server.initialize();
      network.online = false;

      server.respondWith("GET", baseURL + "munros", [200, munros]);
      server.respondWith("GET", baseURL + "forecasts", [200, forecasts]);
      server.respondWith("POST", baseURL + "users", [201, user]);

      new ApiRequest().makePostRequest(baseURL + "users", user_params, null, true, function() {
        status = arguments[0];
        response = arguments[1];
        done();
      });
      new ApiRequest().makeGetRequest(baseURL + "munros", null, false, callback);
      new ApiRequest().makeGetRequest(baseURL + "forecasts", null, false, callback);
      setTimeout(function(){
        dispatcher._onPause();
        setTimeout(function(){
          dispatcher._onResume();
        }, 100) // For test network timeout is 100ms
      }, 50)
    });

    it("Expired one request after timeout", function () {
      assert.strictEqual(dispatcher._queue.length, 2);
      assert.strictEqual(server.requests.length, 0);
      assert.strictEqual(status, 600);
      assert.strictEqual(response, null);
    });

    it("Empties the queue", function () {
      network.online = true;
      dispatcher._online();

      assert.strictEqual(dispatcher._queue.length, 0);
      assert.strictEqual(server.requests.length, 2);
    });

    it("Sends the right requests", function () {
      server.respond();

      assert.strictEqual(callback.callCount, 2);

      let call = callback.getCall(0);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
      call = callback.getCall(1);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(forecasts));
    });
  });

  describe ("Message times out after sending", function() {
    const callback = sinon.spy();
    let status = undefined;
    let response = undefined;
    const request = new ApiRequest();

    before(function(done) {
      server.initialize();
      network.online = true;

      server.respondWith("GET", baseURL + "munros", [200, munros]);
      server.respondWith("GET", baseURL + "forecasts", [200, forecasts]);
      server.respondWith("POST", baseURL + "users", [201, user]);

      request._request.loseRequest = true; // a feature of the test stub
      request.makePostRequest(baseURL + "users", user_params, null, true, function() {
        status = arguments[0];
        response = arguments[1];
        done();
      });
      new ApiRequest().makeGetRequest(baseURL + "munros", null, false, callback);
      new ApiRequest().makeGetRequest(baseURL + "forecasts", null, false, callback);
    });

    it("All messages are sent", function () {
      assert.strictEqual(dispatcher._queue.length, 0);
    });

    it("One message is lost", function () {
      assert.strictEqual(server.requests.length, 2);
    });

    it("Returns network timeout error", function () {
      assert.strictEqual(request.retries, 0);
      assert.strictEqual(status, 600);
      assert.strictEqual(response, null);
    });

    it("Correct replies received", function () {
      server.respond();

      assert.strictEqual(callback.callCount, 2);

      let call = callback.getCall(0);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
      call = callback.getCall(1);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(forecasts));
    });
  });

  describe ("Message times out but is automatically resent", function() {
    const callback = sinon.spy();
    let status = undefined;
    let response = undefined;
    const request = new ApiRequest();

    before(function(done) {
      server.initialize();
      network.online = true;

      server.respondWith("GET", baseURL + "munros", [200, munros], true); // auto respond i.e. don't wait
      request._request.loseRequest = true; // a feature of the test stub - only loses first request
      request.makeGetRequest(baseURL + "munros", null, false, function() {
        status = arguments[0];
        response = arguments[1];
        done();
      });
    });

    it("Sends the message", function () {
      assert.strictEqual(dispatcher._queue.length, 0);
    });

    it("Resends the message", function () {
      assert.strictEqual(request.retries, 1);
    });

    it("Returns the correct data", function () {
      assert.strictEqual(status, 200);
      assert.deepStrictEqual(response, JSON.parse(munros));
    });
  });

  describe ("Message times out & network is offline so requeued", function() {
    const callback = sinon.spy();
    const request = new ApiRequest();

    before(function(done) {
      server.initialize();
      network.online = true;

      server.respondWith("GET", baseURL + "munros", [200, munros]);
      request._request.loseRequest = true; // a feature of the test stub - will only lose the first request
      request.makeGetRequest(baseURL + "munros", null, false, callback);
      setTimeout(function(){
        network.online = false;
        setTimeout(function(){
          // wait for request to complete
          done();
        }, 100) // For test network timeout is 100ms
      }, 50)
    });

    it("Sent the message", function () {
      assert.strictEqual(request._tries, 1);
    });

    it("Requeues the message", function () {
      assert.strictEqual(dispatcher._queue.length, 1);
    });

    it("Empties the queue", function () {
      network.online = true;
      dispatcher._online();

      assert.strictEqual(dispatcher._queue.length, 0);
      assert.strictEqual(server.requests.length, 1);
    });

    it("Returns the correct data", function () {
      server.respond();

      assert.strictEqual(callback.callCount, 1);

      let call = callback.getCall(0);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
    });
  });

  describe ("Messages time out & network is offline so requeued in the original order", function() {
    const callback = sinon.spy();
    const request1 = new ApiRequest();
    const request2 = new ApiRequest();
    const request3 = new ApiRequest();
    let id1 = 0;
    let id2 = 0;
    let id3 = 0;

    before(function(done) {
      server.initialize();
      network.online = true;

      server.respondWith("GET", baseURL + "munros", [200, munros]);

      request1._request.loseRequest = true; // a feature of the test stub - will only lose the first request
      request1.makeGetRequest(baseURL + "munros", null, false, callback);
      id1 = request1.id;
      request2._request.loseRequest = true;
      request2.makeGetRequest(baseURL + "munros", null, false, callback);
      id2 = request2.id;
      setTimeout(function(){
        network.online = false;
        request3.makeGetRequest(baseURL + "munros", null, false, callback);
        id3 = request3.id;
        setTimeout(function(){
          // wait for sent requests to timeout
          done();
        }, 100) // For test network timeout is 100ms
      }, 50)
    });

    it("Sent the messages", function () {
      assert.strictEqual(request1._tries, 1);
      assert.strictEqual(request2._tries, 1);
      assert.strictEqual(request3._tries, 0);
    });

    it("Requeues the message", function () {
      assert.strictEqual(dispatcher._queue.length, 3);
    });

    it("Messages are in the right order", function () {
      assert.strictEqual(dispatcher._queue[0].id, id1);
      assert.strictEqual(dispatcher._queue[1].id, id2);
      assert.strictEqual(dispatcher._queue[2].id, id3);
    });

    it("Empties the queue", function () {
      network.online = true;
      dispatcher._online();

      assert.strictEqual(dispatcher._queue.length, 0);
      assert.strictEqual(server.requests.length, 3);
    });

    it("Returns the correct data", function () {
      server.respond();

      assert.strictEqual(callback.callCount, 3);

      let call = callback.getCall(0);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
      call = callback.getCall(1);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
      call = callback.getCall(2);
      assert.strictEqual(call.args[0], 200);
      assert.deepStrictEqual(call.args[1], JSON.parse(munros));
    });
  });
});
