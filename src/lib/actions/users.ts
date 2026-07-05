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
  const dublicate = await findDuplicateName(users, name.value);
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
 * Обновление имени пользователя.
 *
 * _prevState — предыдущее состояние формы (не используется, но требуется useActionState).
 * formData — данные из <form>, содержат поля 'userId' и 'name'.
 *
 * Шаги:
 * 1. Валидация userId (должен быть валидным ObjectId).
 * 2. Валидация имени (не пустое, не только пробелы).
 * 3. Проверка дубликата: нет ли другого пользователя с таким же именем.
 * 4. Обновление документа в коллекции users.
 * 5. Сброс кеша Next.js для всех страниц, где этот пользователь упоминается.
 *
 * Зачем revalidateUserPages?
 * — Если пользователь участвует в поездках, его имя может отображаться
 *   на страницах этих поездок. Нужно сбросить кеш и там, и на главной.
 */
export async function updateUser(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  // Валидация: вытаскиваем userId из формы, проверяем что это ObjectId
  const userId = String(formData.get('userId') ?? '');
  if (!ObjectId.isValid(userId)) {
    return {
      error: 'Некорректный участник',
    };
  }

  // Валидация: вытаскиваем name из формы, проверяем что не пусто
  const name = parseName(formData);
  if ('error' in name) {
    return name;
  }

  const userObjectId = new ObjectId(userId);
  const users = await getUsersCollection();

  // Проверка дубликата: ищем пользователя с таким же именем, исключая текущего
  const duplicate = await findDuplicateName(users, name.value, userObjectId);
  if (duplicate) {
    return {
      error: 'Участник с таким именем уже существует',
    };
  }

  // Обновление: $set заменяет только поле name, остальные поля не трогает
  const result = await users.updateOne(
    { _id: userObjectId },
    { $set: { name: name.value } },
  );

  // modifiedCount — сколько документов реально изменено
  // Если 0 — значит пользователь с таким _id не найден
  if (result.modifiedCount === 0) {
    return {
      error: 'Участник не найден',
    };
  }
  console.log('User name updated successfully: ', name.value);

  /**
   * revalidateUserPages — сброс кеша на всех страницах, где может
   * отображаться имя этого пользователя (главная + страницы поездок).
   *
   * Почему не просто revalidatePath('/')?
   * — После смены имени нужно обновить не только список на главной,
   *   но и страницы поездок, где пользователь указан как участник.
   */
  await revalidateUserPages(userObjectId);

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

/**
 * Сброс кеша Next.js для всех страниц, связанных с пользователем.
 *
 * Вызывается после обновления пользователя, чтобы новые данные
 * отобразились везде, где упоминается этот пользователь.
 *
 * Что сбрасываем:
 * — Главная страница (/), где отображается список пользователей.
 * — Все страницы поездок (/trips/:id), в которых участвует этот пользователь.
 *
 * Зачем искать поездки?
 * — Если пользователь состоит в поездке, его имя может отображаться
 *   на странице этой поездки. После переименования нужно обновить и их.
 */
async function revalidateUserPages(userId: ObjectId) {
  const trips = await getTripsCollection();
  // Ищем все поездки, где userId есть в массиве memberIds
  const tripList = await trips.find({ memberIds: userId }).toArray();

  // Сбрасываем кеш для каждой такой поездки
  for (const trip of tripList) {
    revalidatePath(`/trips/${trip._id.toString()}`);
  }

  // Сбрасываем кеш главной страницы
  revalidatePath('/');
}

/**
 * Поиск дубликата имени в коллекции users.
 *
 * Используется в createUser и updateUser для проверки уникальности имени.
 *
 * Зачем excludeId?
 * — При обновлении пользователя мы не хотим, чтобы он считался дубликатом
 *   самого себя. excludeId — _id текущего пользователя, его исключаем из поиска.
 * — При создании нового пользователя excludeId не передаётся — проверяем всех.
 *
 * Почему RegExp, а не точное совпадение?
 * — Чтобы сравнение было регистронезависимым: "елисей" и "Елисей" — дубликат.
 * — $regex с флагом 'i' — регистронезависимый поиск.
 * — ^ и $ — якоря, чтобы не находить "Елисейка" при поиске "Елисей".
 *
 * Зачем escapeRegex?
 * — Если в имени есть спецсимволы (например, "Иван (старший)"),
 *   они могут сломать регулярное выражение. escapeRegex экранирует их.
 */
async function findDuplicateName(
  users: Awaited<ReturnType<typeof getUsersCollection>>,
  name: string,
  excludeId?: ObjectId,
) {
  // Регистронезависимый поиск точного совпадения имени
  const filter: Record<string, unknown> = {
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
  };

  // Если передан excludeId — исключаем этого пользователя из поиска
  // $ne (not equal) — MongoDB-оператор "не равно"
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return users.findOne(filter);
}

/**
 * Экранирование спецсимволов для использования в RegExp.
 *
 * Зачем?
 * — Имя пользователя может содержать символы, которые имеют special meaning
 *   в регулярных выражениях: . * + ? ^ $ { } ( ) | [ ] \
 * — Без экранирования findDuplicateName может найти ложный дубликат
 *   или выбросить ошибку при невалидном regex.
 *
 * Пример:
 * — Имя "Иван (старший)" — скобки сломают regex без экранирования.
 * — escapeRegex превращает "(старший)" в "\\(старший\\)".
 *
 * Как работает?
 * — Заменяет каждый спецсимвол на его экранированную версию.
 * — \\$& — вставка обратной косой черты перед найденным символом.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
