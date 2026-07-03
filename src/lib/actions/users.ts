'use server';

import { ObjectId } from 'mongodb';

import { getTripsCollection, getUsersCollection } from '@/lib/db/collections';
import { revalidatePath } from 'next/cache';

export type UserFormState = {
  error: string;
} | null;

export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const name = parseName(formData);
  if ('error' in name) {
    return name;
  }

  const users = await getUsersCollection();
  const dublicate = await users.findOne({ name: name.value });
  if (dublicate) {
    return {
      error: 'Пользователь с таким именем уже существует',
    };
  }

  await users.insertOne({
    _id: new ObjectId(),
    name: name.value,
    createdAt: new Date(),
  });

  revalidatePath('/');
  return null;
}

type ParsedName =
  | {
      value: string;
    }
  | {
      error: string;
    };
function parseName(formData: FormData): ParsedName {
  const name = String(formData.get('name') || '').trim();

  if (!name) {
    return {
      error: 'Поле обязательно',
    };
  }

  return {
    value: name,
  };
}

export async function deleteUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const userId = String(formData.get('userId') || '');

  if (!ObjectId.isValid(userId)) {
    return {
      error: 'Некорректные данные',
    };
  }

  const userObjectId = new ObjectId(userId);
  const trips = await getTripsCollection();
  const inTrip = await trips.findOne({ memberIds: userObjectId });

  if (inTrip) {
    return {
      error: 'Нельзя удалить: Пользователь участвует в поездке',
    };
  }

  const users = await getUsersCollection();
  const result = await users.deleteOne({ _id: userObjectId });

  if (result.deletedCount === 0) {
    return {
      error: 'Пользователь не найден',
    };
  }

  revalidatePath('/');
  return null;
}
