const crypto = require('crypto');

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

// Initial food items from seed data
const initialFoods = [
  { _id: '65e100000000000000000001', name: 'Idli', category: 'BREAKFAST', price: 30, prepTime: 3, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Idli' },
  { _id: '65e100000000000000000002', name: 'Vada', category: 'BREAKFAST', price: 15, prepTime: 3, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Vada' },
  { _id: '65e100000000000000000003', name: 'Pongal', category: 'BREAKFAST', price: 40, prepTime: 5, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Pongal' },
  { _id: '65e100000000000000000004', name: 'Masala Dosa', category: 'BREAKFAST', price: 50, prepTime: 8, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Masala+Dosa' },
  { _id: '65e100000000000000000005', name: 'Poori Masala', category: 'BREAKFAST', price: 45, prepTime: 6, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Poori+Masala' },
  { _id: '65e100000000000000000006', name: 'Veg Meals', category: 'RICE / MEALS', price: 80, prepTime: 7, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Veg+Meals' },
  { _id: '65e100000000000000000007', name: 'Sambar Rice', category: 'RICE / MEALS', price: 45, prepTime: 4, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Sambar+Rice' },
  { _id: '65e100000000000000000008', name: 'Lemon Rice', category: 'RICE / MEALS', price: 40, prepTime: 4, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Lemon+Rice' },
  { _id: '65e100000000000000000009', name: 'Curd Rice', category: 'RICE / MEALS', price: 35, prepTime: 3, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Curd+Rice' },
  { _id: '65e100000000000000000010', name: 'Chicken Rice', category: 'RICE / MEALS', price: 100, prepTime: 10, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Chicken+Rice' },
  { _id: '65e100000000000000000011', name: 'Chicken Biryani', category: 'RICE / MEALS', price: 120, prepTime: 12, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Chicken+Biryani' },
  { _id: '65e100000000000000000012', name: 'Egg Rice', category: 'RICE / MEALS', price: 80, prepTime: 8, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Egg+Rice' },
  { _id: '65e100000000000000000013', name: 'Samosa', category: 'SNACKS', price: 15, prepTime: 2, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Samosa' },
  { _id: '65e100000000000000000014', name: 'Bajji', category: 'SNACKS', price: 20, prepTime: 4, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Bajji' },
  { _id: '65e100000000000000000015', name: 'Tea', category: 'BEVERAGES', price: 15, prepTime: 2, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Tea' },
  { _id: '65e100000000000000000016', name: 'Coffee', category: 'BEVERAGES', price: 20, prepTime: 2, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Coffee' },
  { _id: '65e100000000000000000017', name: 'Buttermilk', category: 'BEVERAGES', price: 20, prepTime: 1, available: true, image: 'https://placehold.co/500x300/f97316/ffffff?text=Buttermilk' }
];

// Initial demo users with pre-hashed passwords
const initialUsers = [
  { _id: '65e200000000000000000001', name: 'Akash', email: 'student@example.com', password: '$2b$10$xgEOqZy6/kv.ywOaw98k4uZpVgwW6xRRD9WN8FFgAKW07pdLlWZH.', role: 'student', studentId: 'STU1001' },
  { _id: '65e200000000000000000002', name: 'Rahul', email: 'rahul@example.com', password: '$2b$10$xgEOqZy6/kv.ywOaw98k4uZpVgwW6xRRD9WN8FFgAKW07pdLlWZH.', role: 'student', studentId: 'STU1002' },
  { _id: '65e200000000000000000003', name: 'Priya', email: 'priya@example.com', password: '$2b$10$xgEOqZy6/kv.ywOaw98k4uZpVgwW6xRRD9WN8FFgAKW07pdLlWZH.', role: 'student', studentId: 'STU1003' },
  { _id: '65e200000000000000000004', name: 'Canteen Staff', email: 'staff@canteen.com', password: '$2b$10$qRcgFlWXE4p55zmveTfqT.di.e33V0sk83qZJOnehzKVH9gfRVkM2', role: 'staff' },
  { _id: '65e200000000000000000005', name: 'Admin', email: 'admin@canteen.com', password: '$2b$10$GqRSh9bRupLf3U4gsIh.7.ky.KQ1SsslJnyH3J2cDRnpyAbC6U/a.', role: 'admin' }
];

// Initial default canteen configuration
const initialConfig = {
  _id: '65e300000000000000000001',
  maxOrdersPerPickupWindow: 5,
  kitchenPrepSlots: 3,
  pickupWindowDurationMins: 10,
  pickupHandlingMins: 1,
  walkingTimeMins: 3,
  eatingTimeMins: 5,
  lowDelayThresholdMins: 5,
  highDelayThresholdMins: 15,
  openingTime: '08:00',
  closingTime: '20:00'
};

class MemoryCollection {
  constructor(initialData = []) {
    this.data = initialData.map(item => this.wrap(item));
  }

  wrap(item) {
    if (!item) return null;
    const doc = { ...item };
    if (!doc._id) doc._id = generateId();
    if (!doc.id) doc.id = doc._id;
    if (!doc.createdAt) doc.createdAt = new Date();
    if (!doc.updatedAt) doc.updatedAt = new Date();

    const collection = this;
    doc.save = async function() {
      doc.updatedAt = new Date();
      const idx = collection.data.findIndex(x => x._id.toString() === doc._id.toString());
      if (idx >= 0) {
        collection.data[idx] = doc;
      } else {
        collection.data.push(doc);
      }
      return doc;
    };

    return doc;
  }

  match(item, filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const key of Object.keys(filter)) {
      const condition = filter[key];
      if (key === '_id' || key === 'studentId' || key === 'orderId') {
        const itemVal = item[key] ? item[key].toString() : null;
        if (condition && typeof condition === 'object' && condition.$in) {
          const list = condition.$in.map(v => v.toString());
          if (!list.includes(itemVal)) return false;
        } else if (condition) {
          if (itemVal !== condition.toString()) return false;
        }
      } else if (key === 'status' && condition && typeof condition === 'object' && condition.$in) {
        if (!condition.$in.includes(item.status)) return false;
      } else if (key === 'pickupWindow.slotLabel') {
        const slot = item.pickupWindow && item.pickupWindow.slotLabel;
        if (slot !== condition) return false;
      } else if (condition && typeof condition === 'object' && condition.$exists !== undefined) {
        const exists = item[key] !== undefined && item[key] !== null;
        if (exists !== condition.$exists) return false;
      } else {
        if (item[key] !== condition) return false;
      }
    }
    return true;
  }

  find(filter = {}) {
    const matched = this.data.filter(item => this.match(item, filter));
    let result = [...matched];

    // Chainable Mongoose Query Object
    const query = {
      sort(sortObj) {
        if (sortObj && typeof sortObj === 'object') {
          const [field, dir] = Object.entries(sortObj)[0] || [];
          if (field) {
            result.sort((a, b) => {
              if (a[field] < b[field]) return dir === -1 ? 1 : -1;
              if (a[field] > b[field]) return dir === -1 ? -1 : 1;
              return 0;
            });
          }
        }
        return query;
      },
      limit(n) {
        result = result.slice(0, n);
        return query;
      },
      populate() {
        return query;
      },
      then(resolve, reject) {
        return Promise.resolve(result).then(resolve, reject);
      },
      catch(reject) {
        return Promise.resolve(result).catch(reject);
      }
    };

    return query;
  }

  async findOne(filter = {}) {
    const item = this.data.find(x => this.match(x, filter));
    return item ? this.wrap(item) : null;
  }

  async findById(id) {
    if (!id) return null;
    const item = this.data.find(x => x._id.toString() === id.toString());
    return item ? this.wrap(item) : null;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const item = await this.findById(id);
    if (!item) return null;
    Object.assign(item, update);
    return item.save();
  }

  async findOneAndUpdate(filter, update, options = {}) {
    let item = await this.findOne(filter);
    if (!item) {
      if (options.upsert) {
        return this.create({ ...filter, ...update });
      }
      return null;
    }
    Object.assign(item, update);
    return item.save();
  }

  async findByIdAndDelete(id) {
    const idx = this.data.findIndex(x => x._id.toString() === id.toString());
    if (idx >= 0) {
      const removed = this.data.splice(idx, 1)[0];
      return removed;
    }
    return null;
  }

  async countDocuments(filter = {}) {
    return this.data.filter(item => this.match(item, filter)).length;
  }

  async create(data) {
    const instance = this.wrap(data);
    await instance.save();
    return instance;
  }

  async insertMany(items) {
    const saved = [];
    for (const item of items) {
      const inst = this.wrap(item);
      await inst.save();
      saved.push(inst);
    }
    return saved;
  }

  async deleteMany(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      this.data = [];
      return { deletedCount: this.data.length };
    }
    const before = this.data.length;
    this.data = this.data.filter(x => !this.match(x, filter));
    return { deletedCount: before - this.data.length };
  }
}

// Global In-Memory Collections
const collections = {
  foods: new MemoryCollection(initialFoods),
  users: new MemoryCollection(initialUsers),
  config: new MemoryCollection([initialConfig]),
  orders: new MemoryCollection([]),
  bills: new MemoryCollection([]),
  notifications: new MemoryCollection([])
};

function getCollection(name) {
  if (!collections[name]) {
    collections[name] = new MemoryCollection([]);
  }
  return collections[name];
}

function createInstance(name, data) {
  const coll = getCollection(name);
  return coll.wrap(data);
}

module.exports = {
  collections,
  getCollection,
  createInstance
};
