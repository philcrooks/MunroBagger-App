const User = require("../models/user");
const UserMountain = require("../models/user_mountain");
const LocalStorage = require('node-localstorage').LocalStorage;
const assert = require("assert");
const sinon = require("sinon");

process.env.NODE_ENV = 'test';
const email = "email@email.com";
const password = "password";
const token = "JsonWebToken";
const localStorage = new LocalStorage('./scratch');

describe("User", function(){

  var user;

  before(function() {
  	user = new User();
  	user._clearData();
  })

  it ( 'Has no security token when first created', function() {
  	assert.strictEqual(user.hasToken, false);
  })

  it ( 'Has no bagged mountains when first created', function() {
  	assert.strictEqual(user.baggedList.length, 0);
  })

  describe( "Register", function(){

	  it ( 'Returns API request object', function() {
	  	const stub = sinon.stub(user, "_requestRegister");
	  	const stub_return = { content: null };
	  	stub.returns(stub_return);
	  	const returned = user.register(email, password, function() {});
	  	stub.restore();
	  	assert.strictEqual(returned, stub_return);
	  })

	  it ( 'Creates correct parameters', function() {
	  	const stub = sinon.stub(user, "_requestRegister");
	  	user.register(email, password, function() {});
  		stub.restore();
  		const call = stub.getCall(0);
			assert.strictEqual(call.args[0], "users")
			assert.deepStrictEqual(call.args[1], { user: {email: email, password: password } });
	  })

	  it ( 'Reports errors', function() {
	  	const stub = sinon.stub(user, "_requestRegister");
	  	stub.yields(422, {});
	  	user.register(email, password, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, false);
				assert.deepStrictEqual(message, {status: 422, message: "That email address is already registered."});
	  	});
	  })

	  it ( 'Reports success', function() {
	  	const stub = sinon.stub(user, "_requestRegister");
	  	stub.yields(201, {});
	  	user.register(email, password, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, true);
				assert.deepStrictEqual(message, null);
	  	});
	  })

	})

	describe( "Login", function(){

	  it ( 'Returns API request object', function() {
	  	const stub = sinon.stub(user, "_requestLogin");
	  	const stub_return = { content: null };
	  	stub.returns(stub_return);
	  	const returned = user.login(email, password, function() {});
	  	stub.restore();
	  	assert.strictEqual(returned, stub_return);
	  })

	  it ( 'Creates correct parameters', function() {
	  	const stub = sinon.stub(user, "_requestLogin");
	  	user.login(email, password, function() {});
  		stub.restore();
  		const call = stub.getCall(0);
			assert.strictEqual(call.args[0], "sessions")
			assert.deepStrictEqual(call.args[1], { session: {email: email, password: password } });
	  })

	  it ( 'Reports errors', function() {
	  	const stub = sinon.stub(user, "_requestLogin");
	  	stub.yields(401, {errors: ['Invalid Username/Password']});
	  	user.login(email, password, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, false);
				assert.deepStrictEqual(message, {status: 401, message: "Unrecognised email address or password. Have you registered?"});
				assert.strictEqual(user.hasToken, false); 
	  	});
	  })

	  it ( 'Reports success', function() {
	  	const stub = sinon.stub(user, "_requestLogin");
	  	stub.yields(201, {auth_token: token, user: {id: 1, email: email}});
	  	user.login(email, password, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, true);
				assert.deepStrictEqual(message, null);
	  	});
	  })

	  it ( 'Creates security token', function() {
	  	// Must follow successful login
			assert.strictEqual(user.hasToken, true);
			assert.strictEqual(user._jwtoken, token);
	  })

	  it ( 'Saves security token', function() {
      assert.strictEqual(localStorage.getItem("auth_token"), token);
	  })
	})

	describe( "Logout", function(){

	  it ( 'Returns API request object', function() {
	  	const stub = sinon.stub(user, "_requestLogout");
	  	const stub_return = { content: null };
	  	stub.returns(stub_return);
	  	const returned = user.logout(function() {});
	  	stub.restore();
	  	assert.strictEqual(returned, stub_return);
	  })

	  it ( 'Creates correct parameters', function() {
	  	const stub = sinon.stub(user, "_requestLogout");
	  	user.logout(function() {});
  		stub.restore();
  		const call = stub.getCall(0);
			assert.strictEqual(call.args[0], "sessions")
	  })

	  it ( 'Reports success', function() {
	  	user._jwtoken = token;
	  	user._mountains = [ "mountains" ];
	  	const stub = sinon.stub(user, "_requestLogout");
	  	stub.yields(204, {});
	  	user.logout(function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, true);
				assert.deepStrictEqual(message, null);
	  	});
	  })

	  it ( 'Removes security token', function() {
	  	// Must follow successful logout
			assert.strictEqual(user.hasToken, false);
	  })

	  it ( 'Removes list of bagged mountains', function() {
	  	// Must follow successful logout
			assert.strictEqual(user.baggedList.length, 0);
	  })
	})

  describe( "Reset Password", function(){

	  it ( 'Returns API request object', function() {
	  	const stub = sinon.stub(user, "_requestResetPassword");
	  	const stub_return = { content: null };
	  	stub.returns(stub_return);
	  	const returned = user.resetPassword(email, function() {});
	  	stub.restore();
	  	assert.strictEqual(returned, stub_return);
	  })

	  it ( 'Creates correct parameters', function() {
	  	const stub = sinon.stub(user, "_requestResetPassword");
	  	user.resetPassword(email, function() {});
  		stub.restore();
  		const call = stub.getCall(0);
			assert.strictEqual(call.args[0], "users/reset")
			assert.deepStrictEqual(call.args[1], { user: { email: email } });
	  })

	  it ( 'Reports errors', function() {
	  	const stub = sinon.stub(user, "_requestResetPassword");
	  	stub.yields(404, {});
	  	user.resetPassword(email, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, false);
				assert.deepStrictEqual(message, {status: 404, message: "That email address is not registered."});
	  	});
	  })

	  it ( 'Reports success', function() {
	  	const stub = sinon.stub(user, "_requestResetPassword");
	  	stub.yields(204, {});
	  	user.resetPassword(email, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, true);
				assert.deepStrictEqual(message, null);
	  	});
	  })

	})

  describe( "Change Password", function(){

	  it ( 'Returns API request object', function() {
	  	const stub = sinon.stub(user, "_requestChangePassword");
	  	const stub_return = { content: null };
	  	stub.returns(stub_return);
	  	const returned = user.changePassword(password, function() {});
	  	stub.restore();
	  	assert.strictEqual(returned, stub_return);
	  })

	  it ( 'Creates correct parameters', function() {
	  	const stub = sinon.stub(user, "_requestChangePassword");
	  	user.changePassword(password, function() {});
  		stub.restore();
  		const call = stub.getCall(0);
			assert.strictEqual(call.args[0], "users/update")
			assert.deepStrictEqual(call.args[1], { user: { password: password } });
	  })

	  it ( 'Reports errors', function() {
	  	const stub = sinon.stub(user, "_requestChangePassword");
	  	stub.yields(401, {});
	  	user.changePassword(password, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, false);
				assert.deepStrictEqual(message, {status: 401, message: "Not logged in."});
	  	});
	  })

	  it ( 'Reports success', function() {
	  	const stub = sinon.stub(user, "_requestChangePassword");
	  	stub.yields(200, {});
	  	user.changePassword(password, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, true);
				assert.deepStrictEqual(message, null);
	  	});
	  })

	})

	describe( "Get Info", function(){

	  it ( 'Returns API request object', function() {
	  	const stub = sinon.stub(user, "_requestGetInfo");
	  	const stub_return = { content: null };
	  	stub.returns(stub_return);
	  	const returned = user.getInfo(true, function() {});
	  	stub.restore();
	  	assert.strictEqual(returned, stub_return);
	  })

	  it ( 'Creates correct parameters', function() {
	  	const stub = sinon.stub(user, "_requestGetInfo");
	  	user.getInfo(true, function() {});
  		stub.restore();
  		const call = stub.getCall(0);
  		assert.strictEqual(call.args[0], true)
			assert.strictEqual(call.args[1], "bagged_munros")
	  })

	  it ( 'Reports errors', function() {
	  	const stub = sinon.stub(user, "_requestGetInfo");
	  	stub.yields(401, {});
	  	user.getInfo(true, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, false);
				assert.deepStrictEqual(message, {status: 401, message: "Not logged in."});
	  	});
	  })

	  it ( 'Reports success', function() {
		  const stub = sinon.stub(user, "_requestGetInfo");
	  	stub.yields(200, [
	  		{id:  4, munro_id: 1, climbed_on: null},
	  		{id:  9, munro_id: 3, climbed_on: null},
	  		{id: 16, munro_id: 5, climbed_on: null}
	  	]);
	  	user.getInfo(true, function(success, message) {
	  		stub.restore();
	  		assert.strictEqual(success, true);
				assert.deepStrictEqual(message, null);
	  	});
	  })

	  it ( 'Creates bagged mountain list', function() {
	  	assert.strictEqual(user.baggedList.length, 3);
	  })

	  it ( 'Puts the right entries on the bagged list', function() {
	  	assert.strictEqual(user.baggedList[0].id, 1);
	  	assert.strictEqual(user.baggedList[1].id, 3);
	  	assert.strictEqual(user.baggedList[2].id, 5);
	  })

	})

	describe( "Save UserMountain", function(){

	 	describe( "Save Newly Bagged Mountain", function() {

	 		var userMountain;

	 		before(function() {
	  		userMountain = new UserMountain({ munro_id: 3, climbed_on: null});
	  		userMountain.bagged = true;
	  	})

		  it ( 'Returns API request object', function() {
		  	const stub = sinon.stub(user, "_requestSaveBagged");
		  	const stub_return = { content: null };
		  	stub.returns(stub_return);
		  	const returned = user.saveUserMountain(userMountain, function() {});
		  	stub.restore();
		  	assert.strictEqual(returned, stub_return);
		  })

		  it ( 'Creates correct parameters', function() {
		  	const stub = sinon.stub(user, "_requestSaveBagged");
		  	user.saveUserMountain(userMountain, function() {});
	  		stub.restore();
	  		const call = stub.getCall(0);
				assert.strictEqual(call.args[0], "bagged_munros")
  			assert.deepStrictEqual(call.args[1], { bagged: { munro_id: 3, climbed_on: null } })
		  })

		  it ( 'Reports errors', function() {
		  	const stub = sinon.stub(user, "_requestSaveBagged");
		  	stub.yields(401, {});
		  	user.saveUserMountain(userMountain, function(success, message) {
		  		stub.restore();
		  		assert.strictEqual(success, false);
					assert.deepStrictEqual(message, {status: 401, message: "Not logged in."});
		  	});
		  })

		  it ( 'Reports success', function() {
		  	const stub = sinon.stub(user, "_requestSaveBagged");
		  	stub.yields(201, {id: 23, munro_id: 3, climbed_on: null});
		  	user.saveUserMountain(userMountain, function(success, message) {
		  		stub.restore();
		  		assert.strictEqual(success, true);
					assert.deepStrictEqual(message, null);
		  	});
		  })

	 	})

	 	describe( "Save Changed Mountain", function() {

	 		var userMountain;

	 		before(function() {
	  		userMountain = new UserMountain({ id: 34, munro_id: 5, climbed_on: null });
	  		userMountain.bagged = true;
	  	})

		  it ( 'Returns API request object', function() {
		  	const stub = sinon.stub(user, "_requestUpdateBagged");
		  	const stub_return = { content: null };
		  	stub.returns(stub_return);
		  	const returned = user.saveUserMountain(userMountain, function() {});
		  	stub.restore();
		  	assert.strictEqual(returned, stub_return);
		  })

		  it ( 'Creates correct parameters', function() {
		  	const stub = sinon.stub(user, "_requestUpdateBagged");
		  	user.saveUserMountain(userMountain, function() {});
	  		stub.restore();
	  		const call = stub.getCall(0);
				assert.strictEqual(call.args[0], "bagged_munros/34")
  			assert.deepStrictEqual(call.args[1], { bagged: { munro_id: 5, climbed_on: null } })
		  })

		  it ( 'Reports errors', function() {
		  	const stub = sinon.stub(user, "_requestUpdateBagged");
		  	stub.yields(401, {});
		  	user.saveUserMountain(userMountain, function(success, message) {
		  		stub.restore();
		  		assert.strictEqual(success, false);
					assert.deepStrictEqual(message, {status: 401, message: "Not logged in."});
		  	});
		  })

		  it ( 'Reports success', function() {
		  	const stub = sinon.stub(user, "_requestUpdateBagged");
		  	stub.yields(201, {id: 34, munro_id: 5, climbed_on: null});
		  	user.saveUserMountain(userMountain, function(success, message) {
		  		stub.restore();
		  		assert.strictEqual(success, true);
					assert.deepStrictEqual(message, null);
		  	});
		  })

	 	})

	 	describe( "Save UnBagged Mountain", function() {

	 		var userMountain;

	 		before(function() {
	  		userMountain = new UserMountain({ id: 34, munro_id: 5, climbed_on: null });
	  		userMountain.bagged = false;
	  	})

		  it ( 'Returns API request object', function() {
		  	const stub = sinon.stub(user, "_requestDeleteBagged");
		  	const stub_return = { content: null };
		  	stub.returns(stub_return);
		  	const returned = user.saveUserMountain(userMountain, function() {});
		  	stub.restore();
		  	assert.strictEqual(returned, stub_return);
		  })

		  it ( 'Creates correct parameters', function() {
		  	const stub = sinon.stub(user, "_requestDeleteBagged");
		  	user.saveUserMountain(userMountain, function() {});
	  		stub.restore();
	  		const call = stub.getCall(0);
				assert.strictEqual(call.args[0], "bagged_munros/34")
		  })

		  it ( 'Reports errors', function() {
		  	const stub = sinon.stub(user, "_requestDeleteBagged");
		  	stub.yields(401, {});
		  	user.saveUserMountain(userMountain, function(success, message) {
		  		stub.restore();
		  		assert.strictEqual(success, false);
					assert.deepStrictEqual(message, {status: 401, message: "Not logged in."});
		  	});
		  })

		  it ( 'Reports success', function() {
		  	const stub = sinon.stub(user, "_requestDeleteBagged");
		  	stub.yields(204, {});
		  	user.saveUserMountain(userMountain, function(success, message) {
		  		stub.restore();
		  		assert.strictEqual(success, true);
					assert.deepStrictEqual(message, null);
		  	});
		  })

	 	})
	})
})