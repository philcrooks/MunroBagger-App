process.env.NODE_ENV = 'test';

const Mountains = require("../models/mountains");
const stubData = require("./stub_data");
const sinon = require("sinon");
const assert = require("assert");

describe("Mountains", function(){

  var mountains;

  before(function(){
    mountains = new Mountains();
  })

  it ( 'Contains no mountains when first initialised', function() {
  	assert.strictEqual(mountains._mountains, null)
  });

  it ( 'Has no update interval when first initialised', function() {
  	assert.strictEqual(isNaN(mountains._nextUpdate), true)
  });

  it ( 'Fetches mountains when none in localStorage', function() {
  	// stub out the call to the Internet
  	let stub = sinon.stub(mountains, "_fetchFromNetwork");
  	stub.withArgs("munros").yields(stubData.munros);
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
  	let nextUpdate = mountains.nextUpdate;
  	let stub = sinon.stub(mountains, "_fetchFromNetwork");
  	stub.withArgs("forecasts").yields(stubData.forecasts.slice(0, 3));
  	mountains.all(function() {});
  	mountains._fetchFromNetwork.restore();
  	assert.strictEqual(mountains._nextUpdate, nextUpdate);
  	assert.strictEqual(mountains._getTimestamp(mountains._mountains), new Date("2017-02-05T18:19:27.710Z").getTime());
  	assert.strictEqual(mountains.updateInterval, 0);
  	assert.strictEqual(stub.callCount, 1);
  })

  it ( 'Fetches new forecasts when current forecasts out of date', function() {
  	let nextUpdate = mountains.nextUpdate;
  	let timeNow = new Date().toISOString();
  	let stub_forecasts = stubData.forecasts;
  	for (let i = 0; i < stub_forecasts.length; i++) {
  		stub_forecasts[i].updated_at = timeNow;
  	}
  	let stub = sinon.stub(mountains, "_fetchFromNetwork");
  	stub.withArgs("forecasts").yields(stub_forecasts);
  	mountains.all(function() {});
  	mountains._fetchFromNetwork.restore();
  	assert.notStrictEqual(mountains._nextUpdate, nextUpdate);
  	assert.strictEqual(mountains._getTimestamp(mountains._mountains), new Date(timeNow).getTime());
  	assert.strictEqual(stub.callCount, 1);
  })

  it ( 'Calculates non-zero update interval when update in future', function() {
  	 assert.strictEqual(mountains.updateInterval > 0, true);
  })

  it ( 'Won\'t update forecasts when up to date', function() {
  	let stub = sinon.stub(mountains, "_fetchFromNetwork");
  	stub.withArgs("forecasts").yields(stubData.forecasts);
  	mountains.all(function() {});
  	mountains._fetchFromNetwork.restore();
  	assert.strictEqual(stub.callCount, 0);
  })
})