# good-mongodb

A Good MongoDb Reporter

## Usage

```
var GoodMongoDb = require('good-mongodb');

var options = {
  reporters: [
    {
      reporter: GoodMongoDb,
      args: ['mongodb://localhost:27017/good-mongodb', {
        collection: 'logs'
        events: {
          ops: '*',
          request: '*',
          log: '*',
          error: '*'
        }
      }]
    }
  ]
};
```
