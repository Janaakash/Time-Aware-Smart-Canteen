const mongoose = require('mongoose');
const mockDb = require('../services/mockDb');

function createHybridModel(modelName, schema, collectionKey) {
  const RealModel = mongoose.models[modelName] || mongoose.model(modelName, schema);

  const HybridConstructor = function(data) {
    if (mongoose.connection.readyState === 1) {
      return new RealModel(data);
    }
    return mockDb.createInstance(collectionKey, data);
  };

  return new Proxy(HybridConstructor, {
    get(target, prop) {
      if (mongoose.connection.readyState === 1) {
        return RealModel[prop];
      }
      const mockColl = mockDb.getCollection(collectionKey);
      if (typeof mockColl[prop] === 'function') {
        return mockColl[prop].bind(mockColl);
      }
      return RealModel[prop];
    }
  });
}

module.exports = { createHybridModel };
