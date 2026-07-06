'use server';

import { ObjectId } from 'mongodb';

import { getTripsCollection, getUsersCollection } from '@/lib/db/collections';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type TripFormState = {
  error: string;
} | null;

export async function createTrip(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const title = String(formData.get('title') ?? '');
  const memberIds = formData.getAll('memberIds').map(String);

  if (!title) {
    return {
      error: 'Название поездки обязательно',
    };
  }

  for (const memberId of memberIds) {
    /* проверяем, что memberId — валидный ObjectId */
    if (!ObjectId.isValid(memberId)) {
      return {
        error: 'Некорректные данные',
      };
    }
  }
  /* преобразуем memberIds в массив ObjectId */
  const memberObjectIds = memberIds.map((id) => new ObjectId(id));
  /* проверяем, что участники не повторяются */
  const uniquieIds = new Set(memberObjectIds.map((id) => id.toString()));

  if (uniquieIds.size !== memberObjectIds.length) {
    return {
      error: 'Участники не должны повторяться',
    };
  }

  const users = await getUsersCollection();
  const foundUsers = await users
    .find({ _id: { $in: memberObjectIds } })
    .toArray();

  if (foundUsers.length !== memberObjectIds.length) {
    return {
      error: 'Один или несколько участников не найдены',
    };
  }

  const trips = await getTripsCollection();
  const result = await trips.insertOne({
    _id: new ObjectId(),
    title,
    memberIds: memberObjectIds,
    createdAt: new Date(),
  });

  revalidatePath('/');
  /* Перенаправляем на страницу поездки */
  // redirect(`/trips/${result.insertedId.toString()}`);

  return null;
}

/*
 * 1. Удаляем поездку
 * 2. Перенаправляем на главную
 * 3. Сбрасываем кеш
 */

export async function deleteTrip(
  _prevState: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const tripId = String(formData.get('tripId') || '');
  // ObjectId.isValid — встроенная проверка MongoDB
  if (!ObjectId.isValid(tripId)) {
    return {
      error: 'Некорректные данные',
    };
  }

  // Преобразуем tripId в ObjectId чтобы MongoDB мог его использовать
  const tripObjectId = new ObjectId(tripId);
  const trips = await getTripsCollection();
  const result = await trips.deleteOne({ _id: tripObjectId });
  console.log('trip deleted >>> ', result);

  revalidatePath('/');
  redirect('/');
}
