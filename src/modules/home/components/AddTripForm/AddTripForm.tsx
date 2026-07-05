import { createTrip, type TripFormState } from '@/lib/actions/trips';
import { HomeUser } from '@/lib/data/home-page';
import { useActionState, useRef } from 'react';

type AddTripFormProps = {
  users: HomeUser[];
  onCancel?: () => void;
};
/**
 * Форма создания поездки
 *
 * users: список существующих участников
 */
export function AddTripForm({ users, onCancel }: AddTripFormProps) {
  const [state, formAction, isPending] = useActionState<
    TripFormState,
    FormData
  >(createTrip, null);

  const formRef = useRef<HTMLFormElement>(null);
  const handleCancel = () => {
    formRef.current?.reset();
    onCancel?.();
  };

  if (users === undefined || users.length === 0) {
    return <p className='mt-8 p-4 w-full text-sm'>Пока нет пользователей...</p>;
  }
  return (
    <form
      action={formAction}
      ref={formRef}
      className='flex flex-col gap-4 w-full'
      onSubmit={(e) => {
        if (!window.confirm('Создать поездку?')) e.preventDefault();
      }}
    >
      <div>
        <label htmlFor='title' className=''>
          Название поездки
        </label>
        <input
          type='text'
          name='title'
          id='title'
          className='w-full border border-border-default dark:border-border-default-dark rounded-lg px-3 py-2 outline-none'
        />
      </div>

      {/* Отображаем список существующих участников */}
      <fieldset>
        <legend className='block mb-2 text-sm font-medium'>Участники</legend>

        <div className='flex flex-col gap-2'>
          {users.map((user) => (
            <label
              key={user.id}
              htmlFor={user.id}
              className='flex items-center gap-2 border border-border-default dark:border-border-default-dark rounded-lg px-3 py-2 cursor-pointer'
            >
              <input
                type='checkbox'
                name='users'
                id={user.id}
                value={user.id}
              />
              {user.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className='flex gap-2'>
        <button
          type='submit'
          disabled={isPending}
          className='w-full border border-border-default dark:border-border-default-dark rounded-lg px-3 py-2 outline-none cursor-pointer hover:opacity-60 transition-opacity duration-300 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isPending ? 'Создание...' : 'Создать'}
        </button>
        <button
          type='reset'
          className='w-full border border-border-default dark:border-border-default-dark rounded-lg px-3 py-2 outline-none cursor-pointer hover:opacity-60 transition-opacity duration-300'
          onClick={handleCancel}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
