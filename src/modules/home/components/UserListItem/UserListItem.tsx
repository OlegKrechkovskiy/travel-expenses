import { HomeUser } from '@/lib/data/home-page';
import { useActionState, useState } from 'react';

import { deleteUser, type UserFormState } from '@/lib/actions/users';

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
