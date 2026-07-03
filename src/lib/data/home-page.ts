/**
 * Данные для главной страницы
 */
import { getTripsCollection, getUsersCollection } from '@/lib/db/collections';

export type HomeUser = {
  id: string;
  name: string;
};

export async function getAllUsers(): Promise<HomeUser[]> {
  const users = await getUsersCollection();
  const list = await users.find().sort({ name: 1 }).toArray();

  return list.map((user) => ({
    id: user._id.toString(),
    name: user.name,
  }));
}

export async function getHomePageData(): Promise<{
  users: HomeUser[];
  trips: any;
}> {
  // здесь мы получаем данные из БД
  const tripsCollection = await getTripsCollection();
  const users = await getAllUsers();

  // получаем все поездки
  const trips = await tripsCollection.find().toArray();

  return { trips, users};
}
