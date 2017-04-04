process.env.NODE_ENV = 'test';

const MountainsView = require("../views/mountains_view");
const Mountains = require("../models/mountains");
const UserMountain = require("../models/user_mountain");
const localStorage = require("../stubs").localStorage;
const stubData = require("./stub_data");
const sinon = require("sinon");
const assert = require("assert");

describe("MountainsView", function(){

  var mountainsView;
  var modelStub;
  var user;

  before(function(){
    localStorage.clear();
  	mountainsView = new MountainsView();
    const stub_forecasts = stubData.forecasts();
    stub_forecasts[0].data.dataDate = "2017-02-05T17:00:00Z";
    stub_forecasts[1].data.dataDate = "2017-02-05T21:00:00Z";
    stub_forecasts[2].data.dataDate = "2017-02-06T01:00:00Z";
    stub_forecasts[3].data.dataDate = "2017-02-06T05:00:00Z";
    stub_forecasts[4].data.dataDate = "2017-02-06T09:00:00Z";
  	modelStub = sinon.stub(mountainsView._mountainsModel, "_fetchFromNetwork");
  	modelStub.withArgs("munros").yields(stubData.munros());
  	modelStub.withArgs("forecasts?time=2017-02-05T18%3A19%3A27.710Z")
  		.onFirstCall().yields(null, 304)
  		.onSecondCall().yields(stub_forecasts.slice(0, 3), 200)
  		.onThirdCall().yields(stub_forecasts, 200);
  	user = {
  		baggedList: [
  			new UserMountain({id:  4, munro_id: 1, climbed_on: null}),
	  		new UserMountain({id:  9, munro_id: 3, climbed_on: null}),
	  		new UserMountain({id: 16, munro_id: 5, climbed_on: null})
  		]
  	}
  	mountainsView.all(function(){});
  })

  after(function(){
  	modelStub.restore();
  })

  it ( 'Has mountains', function() {
  	assert.strictEqual(mountainsView.mountains.length, 5);
  })

  it ( 'Has the right mountains', function() {
  	assert.strictEqual(mountainsView.mountains[0].id, 1);
  	assert.strictEqual(mountainsView.mountains[1].id, 2);
  	assert.strictEqual(mountainsView.mountains[2].id, 3);
  	assert.strictEqual(mountainsView.mountains[3].id, 4);
  	assert.strictEqual(mountainsView.mountains[4].id, 5);
  })

  it ( 'Has regions', function() {
    assert.strictEqual(mountainsView.regions.length, 4);   
  })

  it ( 'Creates forecastDates.max', function() {
    assert.strictEqual(mountainsView.forecastDates.max, "2017-02-05T17:00:00Z");
  })

  it ( 'Creates forecastDates.min', function() {
    assert.strictEqual(mountainsView.forecastDates.min, "2017-02-05T17:00:00Z");
  })

  it ( 'Creates forecastDates.baseDate', function() {
    assert.strictEqual(mountainsView.forecastDates.baseDate.getTime(), new Date("2017-02-05Z").getTime());
  })

  it ( 'Creates forecastDates.updatedBy', function() {
    assert.strictEqual(mountainsView.forecastDates.updatedBy.getTime(), new Date("2017-02-05T18:19:27.710Z").getTime());
  })

  it ( 'Calculates forecastDates.aligned', function() {
    assert.strictEqual(mountainsView.forecastDates.aligned, true);
  })

  it ( 'Saves user on login', function() {
  	mountainsView.userLogin(user);
  	assert.strictEqual(mountainsView._user, user);
  })

  it ( 'Saves user bagged list on login', function() {
  	assert.strictEqual(mountainsView.mountains[0]._status, user.baggedList[0]);
  	assert.strictEqual(mountainsView.mountains[1]._status, null);
  	assert.strictEqual(mountainsView.mountains[2]._status, user.baggedList[1]);
  	assert.strictEqual(mountainsView.mountains[3]._status, null);
  	assert.strictEqual(mountainsView.mountains[4]._status, user.baggedList[2]);  	
  })

  it ( 'Forgets user on logout', function() {
  	mountainsView.userLogout();
  	assert.strictEqual(mountainsView._user, null);
  })

  it ( 'Forgets user bagged list on logout', function() {
  	assert.strictEqual(mountainsView.mountains[0]._status, null);
  	assert.strictEqual(mountainsView.mountains[1]._status, null);
  	assert.strictEqual(mountainsView.mountains[2]._status, null);
  	assert.strictEqual(mountainsView.mountains[3]._status, null);
  	assert.strictEqual(mountainsView.mountains[4]._status, null);  	
  })

  describe( 'Forecasts', function() {

	  it ( 'Won\'t try to update forecasts if there are none', function() {
	  	mountainsView.updateForecasts(function(){});
	  	assert.strictEqual(mountainsView.mountains[0].detail.forecasts.dataDate, "2017-02-05T17:00:00Z");
	  })

	  it ( 'Won\'t try to update forecasts if there are too few', function() {
	  	mountainsView.updateForecasts(function(){});
	  	assert.strictEqual(mountainsView.mountains[0].detail.forecasts.dataDate, "2017-02-05T17:00:00Z");
	  })

	  it ( 'Will update forecasts', function() {
	  	mountainsView.updateForecasts(function(){});
	    assert.strictEqual(mountainsView.mountains[0].detail.forecasts.dataDate, "2017-02-05T17:00:00Z");
      assert.strictEqual(mountainsView.mountains[1].detail.forecasts.dataDate, "2017-02-05T21:00:00Z");
      assert.strictEqual(mountainsView.mountains[2].detail.forecasts.dataDate, "2017-02-06T01:00:00Z");
      assert.strictEqual(mountainsView.mountains[3].detail.forecasts.dataDate, "2017-02-06T05:00:00Z");
      assert.strictEqual(mountainsView.mountains[4].detail.forecasts.dataDate, "2017-02-06T09:00:00Z");
	  })

    it ( 'Creates forecastDates.max', function() {
      assert.strictEqual(mountainsView.forecastDates.max, "2017-02-06T09:00:00Z");
    })

    it ( 'Creates forecastDates.min', function() {
      assert.strictEqual(mountainsView.forecastDates.min, "2017-02-05T17:00:00Z");
    })

    it ( 'Creates forecastDates.baseDate', function() {
      assert.strictEqual(mountainsView.forecastDates.baseDate.getTime(), new Date("2017-02-06Z").getTime());
    })

    it ( 'Creates forecastDates.updatedBy', function() {
      assert.strictEqual(mountainsView.forecastDates.updatedBy.getTime(), new Date("2017-02-06T13:14:53.120Z").getTime());
    })

    it ( 'Calculates forecastDates.aligned', function() {
      assert.strictEqual(mountainsView.forecastDates.aligned, false);
    })
  })

})