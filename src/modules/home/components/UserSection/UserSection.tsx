'use client';

import { HomeUser } from '@/lib/data/home-page';
import { AddUserForm } from '@/modules/home/components/AddUserForm/AddUserForm';
import { UserListItem } from '@/modules/home/components/UserListItem/UserListItem';
import { useState } from 'react';

type UserSectionProps = {
  users: HomeUser[];
};

/**
 * Секция "Путешественники" на главной странице.
 *
 * Получает список пользователей через пропсы (данные приходят с сервера).
 * Управляет режимом редактирования (показать/скрыть кнопки действий).
 *
 * Почему 'use client'?
 * — Используется useState для переключения режима редактирования.
 * — Это интерактивность, которая невозможна на сервере.
 */
export function UserSection({ users }: UserSectionProps) {
  // editing — режим редактирования: показываем кнопки "Изменить" / "Удалить"
  const [editing, setEditing] = useState(false);

  return (
    <section className='mt-8 p-4 w-full border rounded-lg border-border-default dark:border-border-default-dark'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold tracking-tight'>
          Путешественники 🧳
        </h2>
        {/* Кнопка переключает режим редактирования */}
        <button
          type='button'
          className='text-sm font-medium transition-opacity duration-300 hover:opacity-60 cursor-pointer disable-text-selection'
          onClick={() => setEditing((prev) => !prev)}
        >
          { editing ? 'Готово' : 'Редактировать' }
        </button>
      </div>

      {/*
       * Условный рендеринг:
       * — Если пользователей нет — показываем заглушку.
       * — Если есть — рендерим список UserListItem.
       */}
      {users.length === 0 ? (
        <p className='disable-text-selection'>Пока нет учатников</p>
      ) : (
        <ul className='mt-3 flex flex-col gap-2'>
          {users.map((user) => (
            <UserListItem
              /*
               * key меняется при переключении режима редактирования.
               * Это форсирует перемонтирование компонента,
               * чтобы сбросить внутреннее состояние (например, подтверждение удаления).
               */
              key={`${user.id}-${editing ? 'edit' : 'view'}`}
              user={user}
              showActions={editing}
            />
          ))}
        </ul>
      )}

      {/*
       * Форма добавления нового пользователя.
       * Всегда отображается, но сама форма раскрывается по кнопке.
       */}
      <div className='mt-4 pt-4 border-t border-border-default dark:border-border-default-dark'>
        <AddUserForm />
      </div>
    </section>
  );
}
