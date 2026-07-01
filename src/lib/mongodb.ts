// MongoClient — сам клиент для подключения.
//Db — тип для базы данных (нужен для типизации возврата).
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "travel_expenses";

if (!MONGODB_URI) {
  throw new Error('Отсутствует URI в .env.local');
}

const connectionUri = MONGODB_URI;
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  //если есть кеш - возвращаем
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // создаем новый клиент
  const client = new MongoClient(connectionUri, {
    maxPoolSize: 10,
  });

  //подключаемся
  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    //сохраняем в кеш
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    await client.close();
    throw new Error(`MongoDB connection failed: ${error}`);
  }

}