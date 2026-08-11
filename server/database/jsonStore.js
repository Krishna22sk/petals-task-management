import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_PATH = path.join(__dirname, 'local_store.json');

// Default seed data for first-run initialization
const DEFAULT_DATA = {
  users: [],
  employees: [],
  projects: [],
  tasks: [],
  notifications: [],
  activity_logs: [],
  queries: [],
  roles: [
    { id: 'role-admin', role_name: 'Admin', description: 'Full system access' },
    { id: 'role-hr', role_name: 'HR', description: 'Employee management' },
    { id: 'role-mgr', role_name: 'Manager', description: 'Project management' },
    { id: 'role-tl', role_name: 'Team Leader', description: 'Task assignment and team oversight' },
    { id: 'role-emp', role_name: 'Employee', description: 'Task execution and workflow' },
  ],
  departments: [
    { id: 'dept-emb', department_name: 'Embedded Systems', code: 'EMB' },
    { id: 'dept-scd', department_name: 'SCADA & Industrial Software', code: 'SCD' },
    { id: 'dept-pcb', department_name: 'Hardware & PCB Design', code: 'PCB' },
    { id: 'dept-hre', department_name: 'Human Resources & Executive', code: 'HRE' },
    { id: 'dept-dms', department_name: 'Digital Marketing & Sales', code: 'DMS' },
  ],
};

class JsonStore {
  constructor() {
    this._data = null;
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this._data = JSON.parse(raw);
        // Ensure all collections exist
        for (const key of Object.keys(DEFAULT_DATA)) {
          if (!this._data[key]) {
            this._data[key] = DEFAULT_DATA[key];
          }
        }
      } else {
        this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this._flush();
      }
    } catch (err) {
      console.error('[JsonStore] Failed to load store, using defaults:', err.message);
      this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      this._flush();
    }
  }

  _flush() {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this._data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[JsonStore] Failed to write store:', err.message);
    }
  }

  // Generate a unique ID
  _genId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  // ---- CRUD Methods ----

  getAll(collection) {
    return this._data[collection] || [];
  }

  getById(collection, id) {
    return (this._data[collection] || []).find(item => item.id === id) || null;
  }

  findByField(collection, field, value) {
    return (this._data[collection] || []).find(item => {
      const itemVal = item[field];
      if (typeof itemVal === 'string' && typeof value === 'string') {
        return itemVal.toLowerCase() === value.toLowerCase();
      }
      return itemVal === value;
    }) || null;
  }

  findManyByField(collection, field, value) {
    return (this._data[collection] || []).filter(item => {
      const itemVal = item[field];
      if (typeof itemVal === 'string' && typeof value === 'string') {
        return itemVal.toLowerCase() === value.toLowerCase();
      }
      return itemVal === value;
    });
  }

  create(collection, record) {
    if (!this._data[collection]) {
      this._data[collection] = [];
    }
    if (!record.id) {
      record.id = this._genId(collection.substring(0, 3));
    }
    if (!record.created_at) {
      record.created_at = new Date().toISOString();
    }
    record.updated_at = new Date().toISOString();
    this._data[collection].push(record);
    this._flush();
    return record;
  }

  update(collection, id, data) {
    const arr = this._data[collection] || [];
    const idx = arr.findIndex(item => item.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...data, updated_at: new Date().toISOString() };
    this._flush();
    return arr[idx];
  }

  updateMany(collection, filterField, filterValue, data) {
    const arr = this._data[collection] || [];
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][filterField] === filterValue) {
        arr[i] = { ...arr[i], ...data, updated_at: new Date().toISOString() };
        count++;
      }
    }
    if (count > 0) this._flush();
    return count;
  }

  delete(collection, id) {
    const arr = this._data[collection] || [];
    const idx = arr.findIndex(item => item.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    this._flush();
    return true;
  }

  deleteMany(collection, filterField, filterValue) {
    if (!this._data[collection]) return 0;
    const before = this._data[collection].length;
    this._data[collection] = this._data[collection].filter(item => item[filterField] !== filterValue);
    const deleted = before - this._data[collection].length;
    if (deleted > 0) this._flush();
    return deleted;
  }

  count(collection) {
    return (this._data[collection] || []).length;
  }
}

// Singleton instance
const store = new JsonStore();
export default store;
