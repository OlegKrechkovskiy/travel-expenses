import { HomeUser } from '@/lib/data/home-page';
import { useActionState, useState } from 'react';

import { deleteUser, type UserFormState } from '@/lib/actions/users';

type UserlistItemProps = {
  user: HomeUser;
  showActions?: boolean;
};

export function UserListItem({ user, showActions = false }: UserlistItemProps) {
  const [editing, setEditing] = useState(false);

  const [deleteState, deleteAction, isDeleting] = useActionState<
    UserFormState,
    FormData
  >(deleteUser, null);

  return (
    <li className='p-2 rounded-lg flex items-center justify-between gap-3 border border-border-default dark:border-border-default-dark'>
      <span className=''>{user.name}</span>
      {showActions && (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='text-sm font-medium transition-colors duration-300 hover:text-text-hover cursor-pointer disable-text-selection'
            onClick={() => setEditing(true)}
          >
            Изменить
          </button>
          <form
            action={deleteAction}
            className='inline'
            onSubmit={(e) => {
              if (!window.confirm('Удалить участника?')) {
                e.preventDefault();
              }
            }}
          >
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
