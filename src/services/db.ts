// services/db.ts

import { Whiteboard } from '../types/types';

const DB_NAME = 'whiteboard-app';
const STORE_NAME = 'whiteboards';
const DB_VERSION = 1;

let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

function getStore(mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
  const transaction = db.transaction(STORE_NAME, mode);
  return transaction.objectStore(STORE_NAME);
}

export const dbService = {
  init: async () => {
    if (!db) db = await openDB();
  },

  getAllWhiteboards: async (): Promise<Whiteboard[]> => {
    await dbService.init();
    return new Promise((resolve, reject) => {
      const store = getStore();
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as Whiteboard[]);
      request.onerror = () => reject(request.error);
    });
  },

  createWhiteboard: async (data: Omit<Whiteboard, 'id' | 'createdAt' | 'updatedAt' | 'lastViewedAt'>): Promise<Whiteboard> => {
    await dbService.init();
    const now = new Date();
    const newBoard: Whiteboard = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      lastViewedAt: now
    };

    return new Promise((resolve, reject) => {
      const store = getStore('readwrite');
      const request = store.add(newBoard);
      request.onsuccess = () => resolve(newBoard);
      request.onerror = () => reject(request.error);
    });
  },

  updateWhiteboard: async (whiteboard: Whiteboard): Promise<void> => {
    await dbService.init();
    whiteboard.updatedAt = new Date();

    return new Promise((resolve, reject) => {
      const store = getStore('readwrite');
      const request = store.put(whiteboard);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  deleteWhiteboard: async (id: string): Promise<void> => {
    await dbService.init();

    return new Promise((resolve, reject) => {
      const store = getStore('readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
