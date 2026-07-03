/**
 * Данные для главной страницы
 *
 * Этот файл — прослойка между БД и компонентами.
 * Компоненты не знают про MongoDB, они получают уже готовые данные.
 * Если источник данных поменяется (например, REST API вместо MongoDB),
 * менять нужно только этот файл, а не компоненты.
 */
import { getTripsCollection, getUsersCollection } from '@/lib/db/collections';

/**
 * Тип пользователя для отображения на главной.
 * Отличается от User из БД: id — строка, нет _id, createdAt и т.д.
 * Это нормально — UI не нужно знать про внутреннюю структуру БД.
 */
export type HomeUser = {
  id: string;
  name: string;
};

/**
 * Получает всех пользователей из БД, сортирует по имени (А→Я).
 *
 * find() — получает все документы коллекции.
 * sort({ name: 1 }) — сортировка по возрастанию (1 = asc, -1 = desc).
 * toArray() — превращает курсор в обычный массив.
 *
 * Зачем map?
 * — Из БД приходит _id (ObjectId), а UI нужна строка.
 * — Преобразуем в плоский объект HomeUser.
 */
export async function getAllUsers(): Promise<HomeUser[]> {
  const users = await getUsersCollection();
  const list = await users.find().sort({ name: 1 }).toArray();

  return list.map((user) => ({
    id: user._id.toString(),
    name: user.name,
  }));
}

/**
 * Собирает все данные для главной страницы.
 *
 * Сейчас возвращает any для trips — потому что тип Trip ещё не описан.
 * Когда появится — заменим any на Trip[].
 */
export async function getHomePageData(): Promise<{
  users: HomeUser[];
  trips: any;
}> {
  const tripsCollection = await getTripsCollection();
  const users = await getAllUsers();

  const trips = await tripsCollection.find().toArray();

  return { trips, users };
}
