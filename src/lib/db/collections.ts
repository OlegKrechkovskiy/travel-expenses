/**
 * Имена коллекций и доступ к ним
 *
 * Коллекция в MongoDB ≈ таблица в SQL.
 * Имена выносим в константы — не опечатаемся в строках по всему проекту.
 */

import type { Collection } from 'mongodb';

import { getDb } from '@/lib/db/mongodb';
import type { Trip, User } from '@/types';

// Единый справочник имен коллекций
export const COLLECTIONS = {
  users: 'users',
  trips: 'trips',
} as const;

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>(COLLECTIONS.users);
}

export async function getTripsCollection(): Promise<Collection<Trip>> {
  const db = await getDb();
  return db.collection<Trip>(COLLECTIONS.trips);
}
