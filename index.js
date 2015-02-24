var MongoClient = require('mongodb').MongoClient;
var GoodReporter = require('good-reporter');
var Hoek = require('hoek');


var defaults = {
  collection: 'logs'
};

var GoodMongoDb = function(connectionUrl, options) {

  this.options = Hoek.clone(options);
  this.options = Hoek.applyToDefaults(defaults, this.options);
  this.options.connectionUrl = connectionUrl;

  var events = {};

  for (var event in this.options.events) {
    if (this.options.events[event]['*'] || this.options.events[event] === '*') {
      events[event] = '*';
      continue;
    }

    events[event] = Object.keys(this.options.events[event]);
  }

  this.reporter = new GoodReporter(events);

  this.reporter._report = this._report.bind(this);
  this.reporter.start = this.start.bind(this);
  this.reporter.stop = this.stop.bind(this);

};

Hoek.inherits(GoodMongoDb, GoodReporter);

GoodMongoDb.prototype.stop = function(){};

GoodMongoDb.prototype.start = function(emitter, callback) {

  var self = this;
  
  emitter.on('report', this.reporter._handleEvent.bind(this.reporter));

  MongoClient.connect(this.options.connectionUrl, function(err, db) {
    self._db = db;

    if (!err && self.options.ttl) {
      var collection = db.collection(self.options.collection);
      collection.ensureIndex({'timestamp': 1}, {expireAfterSeconds: self.options.ttl}, function() {});
    }

    callback(err);
  });

};

GoodMongoDb.prototype._report = function(event, eventData) {
  var collection = this._db.collection(this.options.collection);
  var data = Hoek.clone(eventData);
  data.timestamp = new Date(eventData.timestamp);
  if (eventData.error) {
    data.error.message = eventData.error.message;
    data.error.stack = eventData.error.stack;
  }
  collection.insert(data, function() {
  });
};

module.exports = GoodMongoDb;
