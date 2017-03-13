"use strict"

process.env.NODE_ENV = 'test';

const Mountains = require("../models/mountains");
const localStorage = require("../stubs").localStorage;
const stubData = require("./stub_data");
const sinon = require("sinon");
const assert = require("assert");

describe("Mountains", function(){

  var mountains;
  var timeNow;

  before(function(){
    localStorage.clear();
    mountains = new Mountains();
  })

  it ( 'Contains no mountains when first initialised', function() {
  	assert.strictEqual(mountains._mountains, null)
  });

  it ( 'Has no update interval when first initialised', function() {
    assert.strictEqual(isNaN(mountains._lastUpdate), true)
  	assert.strictEqual(isNaN(mountains._nextUpdate), true)
  });

  it ( 'Fetches mountains when none in localStorage', function() {
  	// stub out the call to the Internet
  	const stub = sinon.stub(mountains, "_fetchFromNetwork");
  	stub.withArgs("munros").yields(stubData.munros());
  	mountains.all(function() {});
  	mountains._fetchFromNetwork.restore();
		assert.strictEqual(mountains._mountains.length, 5);
		assert.strictEqual(isNaN(mountains._nextUpdate), false);
		assert.strictEqual(mountains._mountains[0].smcId, "M240");
		assert.strictEqual(mountains._mountains[1].smcId, "M144");
		assert.strictEqual(mountains._mountains[2].smcId, "M251");
		assert.strictEqual(mountains._mountains[3].smcId, "M033");
		assert.strictEqual(mountains._mountains[4].smcId, "M274");
		assert.strictEqual(stub.callCount, 1);
  })

  it ( 'Calculates zero update interval when update overdue', function() {
  	 assert.strictEqual(mountains.updateInterval, 0);
  })

  it ( 'Won\'t update forecasts when mismatch with mountains', function() {
  	const nextUpdate = mountains.nextUpdate;
  	const stub = sinon.stub(mountains, "_fetchFromNetwork");
  	stub.withArgs("forecasts?time=2017-02-05T18%3A19%3A27.710Z").yields(stubData.forecasts().slice(0, 3), 200);
  	mountains.all(function() {});
  	mountains._fetchFromNetwork.restore();
  	assert.strictEqual(mountains._nextUpdate, nextUpdate);
  	assert.strictEqual(mountains._lastUpdate, new Date("2017-02-05T18:19:27.710Z").getTime());
    // UpdateInterval put into the future by last test
    assert.strictEqual(mountains.updateInterval, 0);
  	assert.strictEqual(stub.callCount, 1);
  })

  it ( 'Handles a 304 response with no forecasts', function() {
    const nextUpdate = mountains.nextUpdate;
    let stub = sinon.stub(mountains, "_fetchFromNetwork");
    stub.withArgs("forecasts?time=2017-02-05T18%3A19%3A27.710Z").yields(null, 304);
    mountains.all(function() {});
    mountains._fetchFromNetwork.restore();
    // Forecasts will not be updated but the update time will be pushed out by an hour (approximately)
    assert.notStrictEqual(mountains._nextUpdate, nextUpdate);
    assert.notStrictEqual(mountains.updateInterval, 0);
    assert.strictEqual(mountains._lastUpdate, new Date("2017-02-05T18:19:27.710Z").getTime());
    assert.strictEqual(stub.callCount, 1);
  })

  it ( 'Fetches new forecasts when current forecasts out of date', function() {
    // Reset the time for update
  	const nextUpdate = mountains._nextUpdate = Date.now();
  	timeNow = new Date().toISOString();
  	const stub_forecasts = stubData.forecasts();
  	for (let i = 0; i < stub_forecasts.length; i++) {
  		stub_forecasts[i].updated_at = timeNow;
  	}
  	let stub = sinon.stub(mountains, "_fetchFromNetwork");
  	stub.withArgs("forecasts?time=2017-02-05T18%3A19%3A27.710Z").yields(stub_forecasts, 200);
  	mountains.all(function() {});
  	mountains._fetchFromNetwork.restore();
  	assert.notStrictEqual(mountains._nextUpdate, nextUpdate);
  	assert.strictEqual(mountains._lastUpdate, new Date(timeNow).getTime());
  	assert.strictEqual(stub.callCount, 1);
  })

  it ( 'Calculates non-zero update interval when update in future', function() {
  	 assert.strictEqual(mountains.updateInterval > 0, true);
  })

  it ( 'Won\'t update forecasts when up to date', function() {
  	const stub = sinon.stub(mountains, "_fetchFromNetwork");
    const requestString = "forecasts?time=" + encodeURIComponent(new Date(timeNow).toISOString());
  	stub.withArgs(requestString).yields(stubData.forecasts(), 200);
  	mountains.all(function() {});
  	mountains._fetchFromNetwork.restore();
  	assert.strictEqual(stub.callCount, 0);
  })
})