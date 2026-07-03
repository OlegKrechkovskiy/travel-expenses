/**
 * Server Actions для работы с пользователями
 *
 * 'use server' — директива Next.js.
 * Все функции в этом файле выполняются ТОЛЬКО на сервере.
 * Клиентский код вызывает их как обычные async функции,
 * Next.js сам отправляет fetch-запрос на сервер.
 *
 * Зачем отдельный файл?
 * — Логика работы с пользователями в одном месте.
 * — Можно переиспользовать из разных компонентов.
 * — Безопасно: код БД никогда не попадёт на клиент.
 */
'use server';

import { ObjectId } from 'mongodb';

import { getTripsCollection, getUsersCollection } from '@/lib/db/collections';
import { revalidatePath } from 'next/cache';

/**
 * Тип возвращаемого значения для форм.
 * null — успех (ошибок нет).
 * { error: string } — ошибка, показываем пользователю.
 *
 * Зачем такой тип?
 * — useActionState в компоненте ожидает именно такой формат.
 * — Поле error отображается через ErrorBanner.
 */
export type UserFormState = {
  error: string;
} | null;

/**
 * Создание нового пользователя.
 *
 * _prevState — предыдущее состояние формы (не используется, но требуется useActionState).
 * formData — данные из <form>, содержат поле 'name'.
 *
 * Шаги:
 * 1. Валидация имени (не пустое, не только пробелы).
 * 2. Проверка дубликата в БД.
 * 3. Вставка нового документа.
 * 4. Сброс кеша Next.js (revalidatePath), чтобы страница обновилась.
 */
export async function createUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  // Валидация: вытаскиваем name из формы, проверяем что не пусто
  const name = parseName(formData);
  if ('error' in name) {
    return name;
  }

  // Проверка дубликата: ищем пользователя с таким же именем
  const users = await getUsersCollection();
  const dublicate = await users.findOne({ name: name.value });
  if (dublicate) {
    return {
      error: 'Пользователь с таким именем уже существует',
    };
  }

  // Вставка: _id генерируем сами (ObjectId), чтобы знать его заранее
  await users.insertOne({
    _id: new ObjectId(),
    name: name.value,
    createdAt: new Date(),
  });

  /**
   * revalidatePath('/') — сброс кеша Next.js на главной странице.
   *
   * Без этого Next.js показывал бы старый список пользователей из кеша.
   * После revalidatePath при следующем запросе страница заново получит данные из БД.
   *
   * Почему '/'?
   * — Список пользователей отображается на главной (/).
   * — Если бы форма была на /users, писали бы revalidatePath('/users').
   */
  revalidatePath('/');
  return null;
}

/**
 * Разбор и валидация имени из FormData.
 *
 * Возвращает либо { value: string } — успех,
 * либо { error: string } — ошибка валидации.
 *
 * Зачем отдельная функция?
 * — Можно переиспользовать, если появятся другие формы с именем.
 * — Легче тестировать изолированно.
 */
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

/**
 * Удаление пользователя.
 *
 * Шаги:
 * 1. Проверка, что userId — валидный ObjectId (24 hex-символа).
 * 2. Проверка, что пользователь не участвует ни в одной поездке.
 * 3. Удаление из коллекции users.
 * 4. Сброс кеша Next.js.
 */
export async function deleteUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const userId = String(formData.get('userId') || '');

  // ObjectId.isValid — встроенная проверка MongoDB
  if (!ObjectId.isValid(userId)) {
    return {
      error: 'Некорректные данные',
    };
  }

  const userObjectId = new ObjectId(userId);

  // Проверка: есть ли поездки, где этот пользователь — участник
  const trips = await getTripsCollection();
  const inTrip = await trips.findOne({ memberIds: userObjectId });

  if (inTrip) {
    return {
      error: 'Нельзя удалить: Пользователь участвует в поездке',
    };
  }

  // Удаление пользователя
  const users = await getUsersCollection();
  const result = await users.deleteOne({ _id: userObjectId });

  // deleteOne возвращает deletedCount — сколько документов удалено
  if (result.deletedCount === 0) {
    return {
      error: 'Пользователь не найден',
    };
  }

  /**
   * revalidatePath('/') — сброс кеша Next.js на главной странице.
   *
   * После удаления пользователя список на главной должен обновиться.
   * revalidatePath('/') говорит Next.js: "при следующем запросе к / не бери из кеша,
   * запроси свежие данные из БД".
   */
  revalidatePath('/');
  return null;
}
