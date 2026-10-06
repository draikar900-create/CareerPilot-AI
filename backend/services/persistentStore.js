import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data_store');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function readJsonFile(filename, defaultValue = []) {
  try {
    const p = getFilePath(filename);
    if (!fs.existsSync(p)) return defaultValue;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${filename}:`, err.message);
    return defaultValue;
  }
}

function writeJsonFile(filename, data) {
  try {
    const p = getFilePath(filename);
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
  }
}

// 1. Persistent Resources Store
export const persistentResourceStore = {
  getAll: () => readJsonFile('resources.json', []),
  save: (resource) => {
    const list = readJsonFile('resources.json', []);
    const idx = list.findIndex(r => r.id === resource.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...resource, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...resource, created_at: resource.created_at || new Date().toISOString() });
    }
    writeJsonFile('resources.json', list);
    return resource;
  },
  delete: (id) => {
    const list = readJsonFile('resources.json', []);
    const filtered = list.filter(r => r.id !== id);
    writeJsonFile('resources.json', filtered);
    return true;
  }
};

// 2. Persistent Notifications Store
export const persistentNotificationStore = {
  getAll: () => readJsonFile('notifications.json', []),
  save: (notif) => {
    const list = readJsonFile('notifications.json', []);
    list.unshift({ ...notif, id: notif.id || 'notif-' + Date.now(), created_at: notif.created_at || new Date().toISOString() });
    writeJsonFile('notifications.json', list);
    return notif;
  }
};

// 3. Persistent Student Profiles Store (Fallback for when Supabase RLS blocks anon upsert)
export const persistentProfileStore = {
  getAll: () => readJsonFile('student_profiles.json', []),
  getById: (userId) => {
    const list = readJsonFile('student_profiles.json', []);
    return list.find(p => p.user_id === userId || p.id === userId);
  },
  save: (profile) => {
    const list = readJsonFile('student_profiles.json', []);
    const idx = list.findIndex(p => p.user_id === profile.user_id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...profile, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...profile, updated_at: new Date().toISOString() });
    }
    writeJsonFile('student_profiles.json', list);
    return profile;
  }
};

// 4. Persistent Jobs Store
export const persistentJobStore = {
  getAll: () => readJsonFile('jobs.json', []),
  save: (job) => {
    const list = readJsonFile('jobs.json', []);
    const idx = list.findIndex(j => j.id === job.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...job, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...job, created_at: job.created_at || new Date().toISOString() });
    }
    writeJsonFile('jobs.json', list);
    return job;
  }
};

// 5. Persistent Banners Store
export const persistentBannerStore = {
  getAll: () => readJsonFile('banners.json', []),
  save: (banner) => {
    const list = readJsonFile('banners.json', []);
    const idx = list.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...banner, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...banner, created_at: banner.created_at || new Date().toISOString() });
    }
    writeJsonFile('banners.json', list);
    return banner;
  },
  delete: (id) => {
    const list = readJsonFile('banners.json', []);
    const filtered = list.filter(b => b.id !== id);
    writeJsonFile('banners.json', filtered);
    return true;
  }
};

// 6. Persistent Companies Store
export const persistentCompanyStore = {
  getAll: () => readJsonFile('companies.json', []),
  getById: (id) => {
    const list = readJsonFile('companies.json', []);
    return list.find(c => c.id === id);
  },
  save: (company) => {
    const list = readJsonFile('companies.json', []);
    const idx = list.findIndex(c => c.id === company.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...company, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...company, created_at: company.created_at || new Date().toISOString() });
    }
    writeJsonFile('companies.json', list);
    return company;
  },
  delete: (id) => {
    const list = readJsonFile('companies.json', []);
    const filtered = list.filter(c => c.id !== id);
    writeJsonFile('companies.json', filtered);
    return true;
  }
};

