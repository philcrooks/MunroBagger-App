process.env.NODE_ENV = 'test';

const MountainsView = require("../views/mountains_view");
const Mountains = require("../models/mountains");
const stubData = require("./stub_data");
const sinon = require("sinon");
const assert = require("assert");

describe("MountainsView", function(){

  var mouintainsView;
  var modelStub;

  before(function(){
  	mountainsView = new MountainsView();
  	modelStub = sinon.stub(mountainsView._mountainsModel, "_fetchFromNetwork");
  	modelStub.withArgs("munros").yields(stubData.munros);
  	modelStub.withArgs("forecasts").yields(stubData.forecasts);
  	mountainsView.all(function(){});
  })

  after(function(){
  	modelStub.restore();
  })

  it ( 'Has mountains', function() {
  	assert.strictEqual(mountainsView.mountains.length, 5);
  })

})
