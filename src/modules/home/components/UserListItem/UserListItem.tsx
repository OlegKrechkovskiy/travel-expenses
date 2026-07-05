import { HomeUser } from '@/lib/data/home-page';
import { useActionState, useEffect, useRef, useState } from 'react';

import {
  deleteUser,
  updateUser,
  type UserFormState,
} from '@/lib/actions/users';

type UserlistItemProps = {
  user: HomeUser;
  showActions?: boolean;
};

/**
 * Один элемент списка пользователей.
 *
 * В режиме просмотра — просто имя.
 * В режиме редактирования — кнопки "Изменить" и "Удалить".
 *
 * Почему не 'use client'?
 * — Компонент использует useState и useActionState — хуки React,
 *   которые работают только на клиенте. Директива 'use client'
 *   не нужна, потому что она уже есть в родителе (UserSection).
 *   Next.js сам понимает, что этот компонент — клиентский,
 *   так как он импортируется и используется внутри 'use client'-компонента.
 */
export function UserListItem({ user, showActions = false }: UserlistItemProps) {
  // editing — режим редактирования имени (пока не реализовано)
  const [editing, setEditing] = useState(false);
  const wasUpdating = useRef(false);

  /**
   * useActionState — хук React 19 для работы с Server Actions в формах.
   *
   * deleteUser — Server Action (выполняется на сервере).
   * null — начальное состояние формы.
   *
   * Возвращает:
   * deleteState — текущее состояние (null или { error: string }).
   * deleteAction — функция, которую передаём в <form action={}>.
   * isDeleting — true пока Action выполняется (показываем "Удаление...").
   */
  const [deleteState, deleteAction, isDeleting] = useActionState<
    UserFormState,
    FormData
  >(deleteUser, null);

  /**
   * updateUser — Server Action (выполняется на сервере).
   * null — начальное состояние формы.
   *
   * Возвращает:
   * updateState — текущее состояние (null или { error: string }).
   * updateAction — функция, которую передаём в <form action={}>.
   * isUpdating — true пока Action выполняется (показываем "Изменение...").
   */
  const [updateState, updateAction, isUpdating] = useActionState<
    UserFormState,
    FormData
  >(updateUser, null);

  /**
   * useEffect без массива зависимостей — срабатывает после каждого рендера.
   *
   * Зачем?
   * — useActionState не даёт колбэка "on success" (выполнилось успешно — сделай что-то).
   * — Нам нужно автоматически закрыть режим редактирования после успешного обновления имени.
   *
   * Как работает?
   * — Шаг 1: пользователь нажал "Готово" → isUpdating = true.
   *   useEffect видит isUpdating, записывает в wasUpdating.current = true.
   * — Шаг 2: сервер ответил, обновление завершилось → isUpdating = false.
   *   useEffect видит: wasUpdating.current === true, isUpdating === false,
   *   ошибок нет (updateState?.error — falsy) → закрываем редактирование.
   *
   * Зачем useRef (wasUpdating)?
   * — Без него мы не могли бы отличить "только что закончилось обновление"
   *   от "обновления никогда не было". useRef сохраняет значение между рендерами,
   *   но не вызывает перерендер при изменении (в отличие от useState).
   *
   * Почему нет массива зависимостей?
   * — Нужно проверять isUpdating на каждом рендере, потому что хук
   *   срабатывает именно в момент перехода isUpdating: true → false.
   * — Если добавить [isUpdating], эффект будет срабатывать только при изменении
   *   isUpdating, но может пропустить нужный момент из-за batch-обновлений React.
   */
  useEffect(() => {
    // Запоминаем, что обновление было запущено
    if (isUpdating) {
      wasUpdating.current = true;
    }
    // Если обновление завершилось успешно — выходим из режима редактирования
    if (wasUpdating.current && !isUpdating && !updateState?.error) {
      wasUpdating.current = false;
      setEditing(false);
    }
  });

  if (editing) {
    return (
      <li className='p-2 rounded-lg flex items-center justify-between gap-3 border border-border-default dark:border-border-default-dark'>
        <form
          action={updateAction}
          className='flex items-center gap-3'
          onSubmit={(e) => {
            if (!window.confirm('Сохранить новое имя?')) {
              e.preventDefault();
            }
          }}
        >
          <input type='hidden' name='userId' value={user.id} />
          <input
            type='text'
            name='name'
            defaultValue={user.name}
            className='w-full p-2 text-sm outline-0 border rounded-lg border-border-default dark:border-border-default-dark'
          />

          <button
            type='submit'
            className='text-sm font-medium transition-opacity duration-300 text-text-secondary hover:opacity-60 cursor-pointer disable-text-selection'
            disabled={isUpdating}
          >
            {isUpdating ? 'Изменение...' : 'Готово'}
          </button>
          <button
            type='button'
            className='text-sm font-medium transition-opacity duration-300 text-text-secondary hover:opacity-60 cursor-pointer disable-text-selection'
            onClick={() => setEditing(false)}
          >
            Отменить
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className='p-2 rounded-lg flex items-center justify-between gap-3 border border-border-default dark:border-border-default-dark'>
      <span className=''>{user.name}</span>

      {/*
       * showActions приходит из UserSection.
       * true — режим редактирования (показываем кнопки).
       * false — режим просмотра (только имя).
       */}
      {showActions && (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='text-sm font-medium transition-opacity duration-300 text-text-secondary hover:opacity-60 cursor-pointer disable-text-selection'
            onClick={() => setEditing(true)}
          >
            Изменить
          </button>

          {/*
           * Форма удаления.
           * action={deleteAction} — Server Action.
           * При отправке формы Next.js вызывает deleteUser на сервере.
           *
           * onSubmit — дополнительная проверка через confirm().
           * Если пользователь отменил — preventDefault() отменяет отправку.
           */}
          <form
            action={deleteAction}
            className='inline'
            onSubmit={(e) => {
              if (!window.confirm('Удалить участника?')) {
                e.preventDefault();
              }
            }}
          >
            {/*
             * Скрытое поле: передаём userId в Server Action.
             * formData.get('userId') вернёт это значение.
             */}
            <input type='hidden' name='userId' value={user.id} />
            <button
              type='submit'
              disabled={isDeleting}
              className='text-sm font-medium transition-opacity duration-300 text-text-error hover:opacity-60 cursor-pointer disable-text-selection'
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
