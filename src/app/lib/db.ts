import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'SnapshareDB';
const STORE_NAME = 'images';

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveImageBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, blob, id);
}

export async function getImageBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function deleteImageBlob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
