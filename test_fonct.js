// api_endpoint.test.js
var assert = require('assert').strict;
var app = require('./index.js');
var request = require('supertest')(app);

describe('Load testing operations', function () {
 // Shut everything down gracefully
 afterAll(function (done) {
    app.close();
    done();
  });
 test("vous devez avoir un page de création de compte", function (done) {
    request.get(`/routes/users`)
      .end(function (err, res) {
        assert.strictEqual(res.status, 200);
        done();
      });
  });
 test("vous devez avoir une erreurs", function (done) {
    request.get(`/routes/0`)
      .end(function (err, res) {
        assert.strictEqual(res.status, 404);
        done();
      });
  });
});