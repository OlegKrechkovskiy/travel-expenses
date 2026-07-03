'use client';

import { HomeUser } from '@/lib/data/home-page';
import { AddUserForm } from '@/modules/home/components/AddUserForm/AddUserForm';
import { UserListItem } from '@/modules/home/components/UserListItem/UserListItem';
import { useState } from 'react';

type UserSectionProps = {
  users: HomeUser[];
};

export function UserSection({ users }: UserSectionProps) {
  const [editing, setEditing] = useState(false);

  return (
    <section className='mt-8 p-4 w-full border rounded-lg border-border-default dark:border-border-default-dark'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold tracking-tight'>
          Путешественники 🧳
        </h2>
        <button
          type='button'
          className='text-sm font-medium transition-colors duration-300 hover:text-text-hover cursor-pointer disable-text-selection'
          onClick={() => setEditing((prev) => !prev)}
        >
          { editing ? 'Готово' : 'Редактировать' }
        </button>
      </div>
      {users.length === 0 ? (
        <p className='disable-text-selection'>Пока нет учатников</p>
      ) : (
        <ul className='mt-3 flex flex-col gap-2'>
          {users.map((user) => (
            <UserListItem
              key={`${user.id}-${editing ? 'edit' : 'view'}`}
              user={user}
              showActions={editing}
            />
          ))}
        </ul>
      )}

      <div className='mt-4 pt-4 border-t border-border-default dark:border-border-default-dark'>
        <AddUserForm />
      </div>
    </section>
  );
}
