/**
 * Подключение к MongoDB
 *
 * Зачем отдельный файл?
 * — Все части приложения (страницы, server actions) берут БД отсюда.
 * — Подключение создаётся один раз и переиспользуется (singleton).
 *
 * Зачем singleton?
 * — В dev Next.js часто перезагружает модули (hot reload).
 * — Без кеша в global каждый reload открывал бы новое соединение → лимит Atlas.
 */

import { MongoClient, type Db } from "mongodb";

// Читаем строку из .env.local (Next.js подхватывает её автоматически)
const uri = process.env.MONGODB_URI;

// Имя базы: можно задать в .env, иначе — travel_expenses
const dbName = process.env.MONGODB_DB_NAME ?? "travel_expenses";

// Проверка при старте: если URI нет — сразу ошибка, а не в рантайме
if (!uri) {
  throw new Error(
    "MONGODB_URI не задан. Добавь строку подключения в .env.local",
  );
}

// После проверки выше TypeScript знает, что uri — string
const connectionUri = uri;

/**
 * Расширяем global для TypeScript.
 * В runtime global — объект, живущий весь процесс Node.js.
 * В dev мы кладём сюда Promise клиента, чтобы hot reload его не терял.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Создаёт новый MongoClient и подключается к БД.
 * Возвращает Promise, который резолвится в подключённый клиент.
 *
 * Зачем отдельная функция?
 * — Чтобы не дублировать код для dev и production.
 * — Можно переиспользовать, если нужно сбросить соединение.
 */
function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(connectionUri);
  // connect() возвращает Promise — соединение устанавливается асинхронно
  return client.connect();
}

/**
 * В production — один клиент на процесс (нормально).
 * В development — переиспользуем клиент из global между hot reload.
 *
 * ??= означает: если global._mongoClientPromise уже есть — не перезаписываем.
 * Если нет — создаём новый и сохраняем.
 */
const clientPromise: Promise<MongoClient> =
  process.env.NODE_ENV === "development"
    ? (global._mongoClientPromise ??= createClientPromise())
    : createClientPromise();

/**
 * Главная функция для работы с БД.
 *
 * Вызываем: const db = await getDb()
 * Дальше: db.collection("expenses").find(...)
 *
 * Зачем await?
 * — clientPromise — это Promise, нужно дождаться подключения.
 * — После первого вызова Promise уже зарезолвлен, await сработает мгновенно.
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
