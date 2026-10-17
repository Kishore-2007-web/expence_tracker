// My Pocket Tracker - IndexedDB Offline Storage Layer
// High-reliability offline persistence with automatic schema migration and deduplication

import { Transaction, Business, SavingsGoal, Profile } from './mock-db';

const DB_NAME = 'MyPocketTrackerDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

export async function openOfflineDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by_business', 'business_id', { unique: false });
          txStore.createIndex('by_date', 'transaction_date', { unique: false });
        }

        // Businesses store
        if (!db.objectStoreNames.contains('businesses')) {
          db.createObjectStore('businesses', { keyPath: 'id' });
        }

        // Savings Goals store
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }

        // User Profile store
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }

        // Sync queue for offline operations
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        }

        // App Meta (last sync, version, etc.)
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.warn('[OfflineDB] IndexedDB open error, falling back to LocalStorage:', event);
        resolve(null);
      };
    } catch (e) {
      console.warn('[OfflineDB] IndexedDB initialization failed:', e);
      resolve(null);
    }
  });

  return dbPromise;
}

// Generic helper for IndexedDB store operations
async function getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore | null> {
  const db = await openOfflineDB();
  if (!db) return null;
  try {
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  } catch (e) {
    console.warn(`[OfflineDB] Failed to acquire store "${storeName}":`, e);
    return null;
  }
}

// 1. TRANSACTIONS PERSISTENCE
export async function persistTransactionOffline(transaction: Transaction): Promise<void> {
  const store = await getStore('transactions', 'readwrite');
  if (!store) return;
  return new Promise((resolve) => {
    const req = store.put(transaction);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function removeTransactionOffline(id: string): Promise<void> {
  const store = await getStore('transactions', 'readwrite');
  if (!store) return;
  return new Promise((resolve) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function getAllOfflineTransactions(): Promise<Transaction[]> {
  const store = await getStore('transactions', 'readonly');
  if (!store) return [];
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

// 2. BUSINESSES PERSISTENCE
export async function persistBusinessOffline(business: Business): Promise<void> {
  const store = await getStore('businesses', 'readwrite');
  if (!store) return;
  return new Promise((resolve) => {
    const req = store.put(business);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function removeBusinessOffline(id: string): Promise<void> {
  const store = await getStore('businesses', 'readwrite');
  if (!store) return;
  return new Promise((resolve) => {
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function getAllOfflineBusinesses(): Promise<Business[]> {
  const store = await getStore('businesses', 'readonly');
  if (!store) return [];
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

// 3. SAVINGS GOALS PERSISTENCE
export async function persistGoalOffline(goal: SavingsGoal): Promise<void> {
  const store = await getStore('goals', 'readwrite');
  if (!store) return;
  return new Promise((resolve) => {
    const req = store.put(goal);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function getAllOfflineGoals(): Promise<SavingsGoal[]> {
  const store = await getStore('goals', 'readonly');
  if (!store) return [];
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

// 4. USER PROFILE PERSISTENCE
export async function persistProfileOffline(profile: Profile): Promise<void> {
  const store = await getStore('profile', 'readwrite');
  if (!store) return;
  return new Promise((resolve) => {
    const req = store.put(profile);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

// 5. OFFLINE SYNC QUEUE (Deduplication & Synchronization)
export interface OfflineQueueItem {
  id?: number;
  entity: 'transaction' | 'business' | 'goal' | 'profile';
  action: 'create' | 'update' | 'delete';
  entityId: string;
  payload?: any;
  timestamp: string;
}

export async function queueOfflineAction(item: Omit<OfflineQueueItem, 'timestamp'>): Promise<void> {
  const store = await getStore('sync_queue', 'readwrite');
  if (!store) return;
  const entry: OfflineQueueItem = {
    ...item,
    timestamp: new Date().toISOString()
  };
  return new Promise((resolve) => {
    const req = store.add(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function getPendingSyncCount(): Promise<number> {
  const store = await getStore('sync_queue', 'readonly');
  if (!store) return 0;
  return new Promise((resolve) => {
    const req = store.count();
    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => resolve(0);
  });
}

export async function clearSyncQueue(): Promise<void> {
  const store = await getStore('sync_queue', 'readwrite');
  if (!store) return;
  return new Promise((resolve) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

// 6. DUAL-PERSISTENCE RECONCILIATION
// Safely syncs IndexedDB and LocalStorage without duplication
export async function syncOfflineWithLocalStorage(localData: {
  transactions: Transaction[];
  businesses: Business[];
  goals: SavingsGoal[];
  profile: Profile;
}): Promise<{ reconciled: boolean; count: number }> {
  try {
    const db = await openOfflineDB();
    if (!db) return { reconciled: false, count: 0 };

    // Batch write to IndexedDB
    const txTrans = db.transaction(['transactions', 'businesses', 'goals', 'profile'], 'readwrite');
    const txStore = txTrans.objectStore('transactions');
    const bizStore = txTrans.objectStore('businesses');
    const goalStore = txTrans.objectStore('goals');
    const profStore = txTrans.objectStore('profile');

    localData.transactions.forEach(t => txStore.put(t));
    localData.businesses.forEach(b => bizStore.put(b));
    localData.goals.forEach(g => goalStore.put(g));
    profStore.put(localData.profile);

    return new Promise((resolve) => {
      txTrans.oncomplete = () => {
        resolve({ reconciled: true, count: localData.transactions.length });
      };
      txTrans.onerror = () => {
        resolve({ reconciled: false, count: 0 });
      };
    });
  } catch (err) {
    console.warn('[OfflineDB] Dual-sync error:', err);
    return { reconciled: false, count: 0 };
  }
}
