var MongoClient = require('mongodb').MongoClient;
var Squeeze = require('good-squeeze').Squeeze;
var Hoek = require('hoek');


var defaults = {
  collection: 'logs'
};

var GoodMongoDb = function(events, config) {

  if (!(this instanceof GoodMongoDb)) {
    return new GoodMongoDb(events, config);
  }

  config = config || {};
  Hoek.assert(config.connectionUrl, 'config.connectionUrl must exist');

  var settings = Hoek.applyToDefaults(defaults, config);

  this._streams = {
    squeeze: Squeeze(events)
  };
  this._eventQueue = [];
  this._settings = settings;

};

GoodMongoDb.prototype.init = function(stream, emitter, callback) {

  var self = this;

  MongoClient.connect(this._settings.connectionUrl, function(err, db) {

    self._db = db;

    var collection = db.collection(self._settings.collection);
    if (!err && self._settings.ttl) {
      collection.createIndex({'timestamp': 1}, {expireAfterSeconds: self._settings.ttl}, function() {});
    }

    collection.createIndex({ 'event': 1 }, { background: 1 }, function() {});
    collection.createIndex({ 'tags': 1 }, { background: 1 }, function() {});
    collection.createIndex({ 'event': 1, 'statusCode': 1 }, { background: 1 }, function() {});

    self._streams.squeeze.on('data', function (data) {
      self.report(data);
    });

    stream.pipe(self._streams.squeeze);


    callback(err);
  });

  emitter.on('stop', function() {
    if (self._db) {
      self._db.close();
    }
  });

};

GoodMongoDb.prototype.report = function(eventData) {
  var collection = this._db.collection(this._settings.collection);
  var data = Hoek.clone(eventData);
  data.timestamp = new Date(eventData.timestamp);
  if (eventData.event == 'error') {
    data.message = eventData.error.message;
    data.stack = eventData.error.stack;
  }
  collection.insert(data, function() {
  });
};

module.exports = GoodMongoDb;
