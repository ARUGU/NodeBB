'use strict';

var async = require('async');
var db = require('../database');
var utils = require('../utils');
var validator = require('validator');
var plugins = require('../plugins');
var groups = require('../groups');
var meta = require('../meta');
var http = require('http');
// The following methods are used to create a rocket chat user account with the details given while registering to nodebb account
var rocketChat = {};

module.exports = function (User) {
	User.create = function (data, callback) {
		data.username = data.username.trim();
		data.userslug = utils.slugify(data.username);
		if (data.email !== undefined) {
			data.email = validator.escape(String(data.email).trim());
		}
		var timestamp = data.timestamp || Date.now();
		var userData;
		var userNameChanged = false;

<<<<<<< HEAD
		User.isDataValid(data, function (err) {
			if (err)  {
				return callback(err);
			}
			var timestamp = data.timestamp || Date.now();

			var userData = {
				'username': data.username,
				'userslug': data.userslug,
				'email': data.email || '',
				'joindate': timestamp,
				'lastonline': timestamp,
				'picture': '',
				'fullname': data.fullname || '',
				'location': '',
				'birthday': '',
				'website': '',
				'signature': '',
				'uploadedpicture': '',
				'profileviews': 0,
				'reputation': 0,
				'postcount': 0,
				'topiccount': 0,
				'lastposttime': 0,
				'banned': 0,
				'status': 'online',
				'phone': data.phone || '',
				'sendChatMessages' : true
			};

			async.parallel({
				renamedUsername: function (next) {
					renameUsername(userData, next);
				},
				userData: function (next) {
					plugins.fireHook('filter:user.create', {user: userData, data: data}, next);
				}
			}, function (err, results) {
				if (err) {
					return callback(err);
				}

				var userNameChanged = !!results.renamedUsername;
=======
		async.waterfall([
			function (next) {
				User.isDataValid(data, next);
			},
			function (next) {
				userData = {
					username: data.username,
					userslug: data.userslug,
					email: data.email || '',
					joindate: timestamp,
					lastonline: timestamp,
					picture: data.picture || '',
					fullname: data.fullname || '',
					location: data.location || '',
					birthday: data.birthday || '',
					website: '',
					signature: '',
					uploadedpicture: '',
					profileviews: 0,
					reputation: 0,
					postcount: 0,
					topiccount: 0,
					lastposttime: 0,
					banned: 0,
					status: 'online',
				};

				User.uniqueUsername(userData, next);
			},
			function (renamedUsername, next) {
				userNameChanged = !!renamedUsername;
>>>>>>> b6feb0aa57e9abaee35976e425446f81d97c567c

				if (userNameChanged) {
					userData.username = renamedUsername;
					userData.userslug = utils.slugify(renamedUsername);
				}
				plugins.fireHook('filter:user.create', { user: userData, data: data }, next);
			},
			function (results, next) {
				userData = results.user;
				db.incrObjectField('global', 'nextUid', next);
			},
			function (uid, next) {
				userData.uid = uid;
				db.setObject('user:' + uid, userData, next);
			},
			function (next) {
				async.parallel([
					function (next) {
						db.incrObjectField('global', 'userCount', next);
					},
					function (next) {
						db.sortedSetAdd('username:uid', userData.uid, userData.username, next);
					},
					function (next) {
<<<<<<< HEAD
						async.parallel([
							function (next) {
								db.incrObjectField('global', 'userCount', next);
							},
							function (next) {
								db.sortedSetAdd('username:uid', userData.uid, userData.username, next);
							},
							function (next) {
								db.sortedSetAdd('username:sorted', 0, userData.username.toLowerCase() + ':' + userData.uid, next);
							},
							function (next) {
								db.sortedSetAdd('userslug:uid', userData.uid, userData.userslug, next);
							},
							function (next) {
								var sets = ['users:joindate', 'users:online'];
								if (parseInt(userData.uid, 10) !== 1) {
									sets.push('users:notvalidated');
								}
								db.sortedSetsAdd(sets, timestamp, userData.uid, next);
							},
							function (next) {
								db.sortedSetsAdd(['users:postcount', 'users:reputation'], 0, userData.uid, next);
							},
							function (next) {
								groups.join('registered-users', userData.uid, next);
							},
							function (next) {
								User.notifications.sendWelcomeNotification(userData.uid, next);
							},
							function (next) {
								if (userData.email) {
									async.parallel([
										async.apply(db.sortedSetAdd, 'email:uid', userData.uid, userData.email.toLowerCase()),
										async.apply(db.sortedSetAdd, 'email:sorted', 0, userData.email.toLowerCase() + ':' + userData.uid)
									], next);

									if (parseInt(userData.uid, 10) !== 1 && parseInt(meta.config.requireEmailConfirmation, 10) === 1) {
										User.email.sendValidationEmail(userData.uid, userData.email);
									}
								} else {
									next();
								}
							},
							function(next) {
								if (userData.phone) {
									async.parallel([
										async.apply(db.sortedSetAdd, 'phone:uid', userData.uid, userData.phone),
										async.apply(db.sortedSetAdd, 'phone:sorted', 0, userData.phone + ':' + userData.uid)
									], next);

									// This is the place where we send an identification code to phone and validate it.
									// We dont have a code / service to do this for now. So, skipping it.
									/*if (parseInt(userData.uid, 10) !== 1 && parseInt(meta.config.requireEmailConfirmation, 10) === 1) {
										User.email.sendValidationEmail(userData.uid, userData.email);
									}*/
								} else {
									next();
								}
							},
							function(next) {
								if(!rocketChat) {
									return next();
								}

								rocketChat.createUser(userData.fullname, userData.email, data.password, userData.phone);
								next();
							},
							function (next) {
								if (!data.password) {
									return next();
								}

								User.hashPassword(data.password, function (err, hash) {
									if (err) {
										return next(err);
									}

									async.parallel([
										async.apply(User.setUserField, userData.uid, 'password', hash),
										async.apply(User.reset.updateExpiry, userData.uid)
									], next);
=======
						db.sortedSetAdd('username:sorted', 0, userData.username.toLowerCase() + ':' + userData.uid, next);
					},
					function (next) {
						db.sortedSetAdd('userslug:uid', userData.uid, userData.userslug, next);
					},
					function (next) {
						var sets = ['users:joindate', 'users:online'];
						if (parseInt(userData.uid, 10) !== 1) {
							sets.push('users:notvalidated');
						}
						db.sortedSetsAdd(sets, timestamp, userData.uid, next);
					},
					function (next) {
						db.sortedSetsAdd(['users:postcount', 'users:reputation'], 0, userData.uid, next);
					},
					function (next) {
						groups.join('registered-users', userData.uid, next);
					},
					function (next) {
						User.notifications.sendWelcomeNotification(userData.uid, next);
					},
					function (next) {
						if (userData.email) {
							async.parallel([
								async.apply(db.sortedSetAdd, 'email:uid', userData.uid, userData.email.toLowerCase()),
								async.apply(db.sortedSetAdd, 'email:sorted', 0, userData.email.toLowerCase() + ':' + userData.uid),
							], next);

							if (parseInt(userData.uid, 10) !== 1 && parseInt(meta.config.requireEmailConfirmation, 10) === 1) {
								User.email.sendValidationEmail(userData.uid, {
									email: userData.email,
>>>>>>> b6feb0aa57e9abaee35976e425446f81d97c567c
								});
							}
						} else {
							next();
						}
					},
					function (next) {
						if (!data.password) {
							return next();
						}

						User.hashPassword(data.password, function (err, hash) {
							if (err) {
								return next(err);
							}

							async.parallel([
								async.apply(User.setUserField, userData.uid, 'password', hash),
								async.apply(User.reset.updateExpiry, userData.uid),
							], next);
						});
					},
					function (next) {
						User.updateDigestSetting(userData.uid, meta.config.dailyDigestFreq, next);
					},
				], next);
			},
			function (results, next) {
				if (userNameChanged) {
					User.notifications.sendNameChangeNotification(userData.uid, userData.username);
				}
				plugins.fireHook('action:user.create', { user: userData });
				next(null, userData.uid);
			},
		], callback);
	};

	User.isDataValid = function (userData, callback) {
		async.parallel({
			emailValid: function (next) {
				if (userData.email) {
					next(!utils.isEmailValid(userData.email) ? new Error('[[error:invalid-email]]') : null);
				} else {
					next();
				}
			},
			userNameValid: function (next) {
				next((!utils.isUserNameValid(userData.username) || !userData.userslug) ? new Error('[[error:invalid-username, ' + userData.username + ']]') : null);
			},
			passwordValid: function (next) {
				if (userData.password) {
					User.isPasswordValid(userData.password, next);
				} else {
					next();
				}
			},
			emailAvailable: function (next) {
				if (userData.email) {
					User.email.available(userData.email, function (err, available) {
						if (err) {
							return next(err);
						}
						next(!available ? new Error('[[error:email-taken]]') : null);
					});
				} else {
					next();
				}
			},
		}, function (err) {
			callback(err);
		});
	};

	User.isPasswordValid = function (password, callback) {
		if (!password || !utils.isPasswordValid(password)) {
			return callback(new Error('[[error:invalid-password]]'));
		}

		if (password.length < meta.config.minimumPasswordLength) {
			return callback(new Error('[[user:change_password_error_length]]'));
		}

		if (password.length > 4096) {
			return callback(new Error('[[error:password-too-long]]'));
		}

		callback();
	};

	User.uniqueUsername = function (userData, callback) {
		var numTries = 0;
		function go(username) {
			async.waterfall([
				function (next) {
					meta.userOrGroupExists(username, next);
				},
				function (exists) {
					if (!exists) {
						return callback(null, numTries ? username : null);
					}
					username = userData.username + ' ' + numTries.toString(32);
					numTries += 1;
					go(username);
				},
			], callback);
		}

<<<<<<< HEAD
	// The following methods are used to create a rocket chat user account with the details given while registering to nodebb account
	rocketChat.login = function(user, password, callback) {
		var userInfo = {};
		var postData = 'user='+user+'&password='+password;

		var options = {
			hostname: 'localhost',
			port: 3000,
			path: '/api/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData)
			}
		};

		var req = http.request(options, function(res) {
			console.log(`STATUS: ${res.statusCode}`);
			console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
			res.setEncoding('utf8');
			var responseString = '';
			res.on('data', function(resBody) {
				console.log(`BODY: ${resBody}`);
				responseString += resBody;
			});
			res.on('end', function() {
				console.log('No more data in response.');
				userInfo = JSON.parse(responseString);
				callback(userInfo);
			});
		});

		req.on('error', function(e) {
			console.log(`problem with request: ${e.message}`);
		});

  		// write data to request body
  		req.write(postData);
  		req.end();

  
	}

	rocketChat.logout = function(token, userId) {
		var postData = '';

		var options = {
			hostname: 'localhost',
			port: 3000,
			path: '/api/logout',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(postData),
				'X-Auth-Token': token,
				'X-User-Id': userId
			}
		};

		var req = http.request(options, function(res) {
			console.log(`STATUS: ${res.statusCode}`);
			console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

			res.setEncoding('utf8');
			var responseString = '';
			res.on('data', function(resBody) {
				console.log(`BODY: ${resBody}`);
				responseString += resBody;
			});

			res.on('end', function() {
      		//console.log('No more data in response.');

      		var responseObject = JSON.parse(responseString);
      		if(responseObject.status == 'success') {
      			console.log('Logged out successfully');
      		}else {
      			console.log('Unable to log out. We dont care though');
      		}
      	});
		});

		req.on('error', function(e) {
			console.log(`problem with request: ${e.message}`);
		});

  		// write data to request body
  		req.write(postData);
  		req.end();
  	}


  	rocketChat.addUser = function(name, email, password, username, adminToken, adminUserId, callback) {
  		var requestData = {
  			"name": name, 
  			"email": email, 
  			"password": password, 
  			"username": username
  		}

  		var postData = JSON.stringify(requestData);

  		var options = {
  			hostname: 'localhost',
  			port: 3000,
  			path: '/api/v1/users.create',
  			method: 'POST',
  			headers: {
  				'Content-Type': 'application/json',
  				'Content-Length': Buffer.byteLength(postData),
  				'X-Auth-Token': adminToken,
  				'X-User-Id': adminUserId
  			}
  		};

  		var req = http.request(options, function(res) {
  			console.log(`STATUS: ${res.statusCode}`);
  			console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

  			res.setEncoding('utf8');
  			var responseString = '';
  			res.on('data', function(resBody) {
  				console.log(`BODY: ${resBody}`);
  				responseString += resBody;
  			});

  			res.on('end', function() {
      		//console.log('No more data in response.');

      		var responseObject = JSON.parse(responseString);
      		if(responseObject.success) {
      			console.log('Created user successfully');
      		}else {
      			console.log('Unable to create user');
      		}
      		callback();
      	});
  		});

  		req.on('error', function(e) {
  			console.log(`problem with request: ${e.message}`);
  		});

  		// write data to request body
  		req.write(postData);
  		req.end();
  	}


  	rocketChat.createUser = function(name, email, password, username) {
  		this.login('admin', '!DontKnow1', function(adminUserInfo){
  			if(adminUserInfo.status == 'success') {
  				var adminUserId = adminUserInfo.data.userId;
  				var adminToken = adminUserInfo.data.authToken;

  				rocketChat.addUser(name, email, password, username, 
  					adminToken, adminUserId,
  					function(){
  						console.log('\n\n\n\n\nlogging out');
  						rocketChat.logout(adminToken, adminUserId);  
  					});      
  			}else {
  				console.log('Unable to login using administrator');
  			}
  		});
  	}

=======
		go(userData.userslug);
	};
>>>>>>> b6feb0aa57e9abaee35976e425446f81d97c567c
};
