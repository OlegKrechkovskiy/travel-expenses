/**
 * Данные для главной страницы
 */
import { getTripsCollection } from '@/lib/db/collections';

export async function getHomePageData() {
  // здесь мы получаем данные из БД
  const tripsCollection = await getTripsCollection();
  // получаем все поездки
  const trips = await tripsCollection.find().toArray();

  return { trips };
}
