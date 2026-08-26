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

export type HomeTrip = {
  id: string;
  title: string;
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

export async function getAllTrips(): Promise<HomeTrip[]> {
  const trips = await getTripsCollection();
  const list = await trips.find().toArray();

  return list.map((trip) => ({
    id: trip._id.toString(),
    title: trip.title,
  }));
}

export type HomePageData = {
  users: HomeUser[];
  trips: HomeTrip[];
  /**
   * true — не удалось связаться с БД.
   * Вместо исключения отдаём пустые данные, а страница показывает предупреждение.
   */
  dbError: boolean;
};

/**
 * Собирает все данные для главной страницы.
 *
 * Если БД недоступна (не удалось подключиться, сеть, таймаут и т.п.) —
 * ловим ошибку и возвращаем пустые списки с флагом dbError,
 * чтобы приложение не падало, а просто показало предупреждение.
 */
export async function getHomePageData(): Promise<HomePageData> {
  try {
    const [trips, users] = await Promise.all([getAllTrips(), getAllUsers()]);

    /* Для отладки — задержка по времени */
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    return { trips, users, dbError: false };
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
    return { trips: [], users: [], dbError: true };
  }
}
