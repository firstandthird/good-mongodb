var MongoClient = require('mongodb').MongoClient;
var GoodReporter = require('good-reporter');
var Hoek = require('hoek');


var defaults = {
  collection: 'logs'
};

var GoodMongoDb = function(connectionUrl, options) {

  var settings = Hoek.clone(options);
  settings = Hoek.applyToDefaults(defaults, settings);
  settings.connectionUrl = connectionUrl;

  GoodReporter.call(this, settings);

};

Hoek.inherits(GoodMongoDb, GoodReporter);

GoodMongoDb.prototype.start = function(emitter, callback) {

  var self = this;
  emitter.on('report', this._handleEvent.bind(this));
  MongoClient.connect(this._settings.connectionUrl, function(err, db) {
    self._db = db;

    if(!err && self._settings.ttl) {
      var collection = db.collection(self._settings.collection);
      collection.ensureIndex({'timestamp': 1}, {expireAfterSeconds: self._settings.ttl}, function() {});
    }

    callback(err);
  });
};

GoodMongoDb.prototype._report = function(event, eventData) {
  var collection = this._db.collection(this._settings.collection);
  var data = Hoek.clone(eventData);
  data.timestamp = new Date(eventData.timestamp);
  collection.insert(data, function() {
  });
};

module.exports = GoodMongoDb;
