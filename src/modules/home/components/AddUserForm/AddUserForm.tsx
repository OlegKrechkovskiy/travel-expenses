'use client';

import { useActionState, useState } from 'react';

import { createUser, type UserFormState } from "@/lib/actions/users";
import { ErrorBanner } from "@/app/components/ErrorBanner/ErrorBanner";

const inputClassName =
  'w-full rounded-lg border border-border-default dark:border-border-default-dark px-3 py-2 outline-none';

const labelClassName =
  'mb-1 block text-sm font-medium text-text-secondary dark:text-text-secondary-dark';

export function AddUserForm() {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState<
    UserFormState,
    FormData
  >(createUser, null);

  if (!showForm) {
    return (
      <button
        type='button'
        onClick={() => setShowForm(true)}
        className='text-sm font-medium transition-colors duration-300 hover:text-text-hover cursor-pointer disable-text-selection'
      >
        Добавить путешественника ＋
      </button>
    );
  }

  if (isPending) {
    return (
      <div>
        <p>Добавление участника...</p>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium text-text-secondary dark:text-text-secondary-dark'>
          Добавить путешественника
        </h3>
        <button
          type='button'
          onClick={() => setShowForm(false)}
          className='text-sm leading-none text-text-muted dark:text-text-muted-dark transition-colors hover:text-text-secondary dark:hover:text-text-secondary-dark cursor-pointer'
          aria-label='Закрыть'
        >
          ✕
        </button>
      </div>

      <form
        action={formAction}
        className='mt-3 flex flex-col gap-3'
        onSubmit={(event) => {
          if (!window.confirm('Добавить участника?')) {
            event.preventDefault();
          }
        }}
      >
        <ErrorBanner message={state?.error} />

        <div>
          <label htmlFor='name' className={labelClassName}>
            Имя
          </label>
          <input
            id='name'
            name='name'
            type='text'
            required
            placeholder='Елисей, Любава...'
            className={inputClassName}
          />
        </div>

        <button
          type='submit'
          disabled={isPending}
          className='rounded-lg border border-border-default dark:border-border-default-dark px-4 py-2.5 text-sm font-medium transition-colors hover:bg-bttn-bg dark:hover:bg-bttn-bg-dark cursor-pointer disabled:opacity-50'
        >
          Добавить путешественника
        </button>

        <button
          type='button'
          onClick={() => setShowForm(false)}
          className='w-min self-center mt-2 text-sm font-medium text-text-primary transition-colors cursor-pointer hover:text-text-hover'
          aria-label='Закрыть'
        >
          закрыть
        </button>
      </form>
    </div>
  );
}
