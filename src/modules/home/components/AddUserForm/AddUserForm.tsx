'use client';

import { useActionState, useState } from 'react';

import { createUser, type UserFormState } from "@/lib/actions/users";
import { ErrorBanner } from "@/app/components/ErrorBanner/ErrorBanner";

const inputClassName =
  'w-full rounded-lg border border-border-default dark:border-border-default-dark px-3 py-2 outline-none';

const labelClassName =
  'mb-1 block text-sm font-medium';

/**
 * Форма добавления нового пользователя.
 *
 * Состоит из двух состояний:
 * 1. Скрыта — показываем кнопку "Добавить путешественника".
 * 2. Открыта — показываем форму с полем ввода и кнопками.
 *
 * Почему 'use client'?
 * — useState для показа/скрытия формы.
 * — useActionState для отправки формы через Server Action.
 */
export function AddUserForm() {
  // showForm — форма скрыта или открыта
  const [showForm, setShowForm] = useState(false);

  /**
   * useActionState — хук React 19 для Server Actions.
   *
   * createUser — Server Action (выполняется на сервере).
   * null — начальное состояние (ошибок нет).
   *
   * Возвращает:
   * state — результат выполнения Action (null или { error: string }).
   * formAction — функция для <form action={}>.
   * isPending — true пока Action выполняется.
   */
  const [state, formAction, isPending] = useActionState<
    UserFormState,
    FormData
  >(createUser, null);

  // Состояние 1: форма скрыта — показываем только кнопку
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

  // Состояние 1.5: отправка формы — показываем заглушку
  if (isPending) {
    return (
      <div>
        <p>Добавление участника...</p>
      </div>
    );
  }

  // Состояние 2: форма открыта
  return (
    <div>
      {/*
       * Заголовок формы и кнопка закрытия.
       * Крестик сбрасывает showForm в false — форма скрывается.
       */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>
          Добавить путешественника
        </h3>
        <button
          type='button'
          onClick={() => setShowForm(false)}
          className='text-sm leading-none transition-opacity duration-300 hover:opacity-50 cursor-pointer'
          aria-label='Закрыть'
        >
          ✕
        </button>
      </div>

      {/*
       * Форма добавления.
       * action={formAction} — при отправке вызывает createUser на сервере.
       * onSubmit — дополнительный confirm() перед отправкой.
       */}
      <form
        action={formAction}
        className='mt-3 flex flex-col gap-3'
        onSubmit={(event) => {
          if (!window.confirm('Добавить участника?')) {
            event.preventDefault();
          }
        }}
      >
        {/*
         * ErrorBanner — показывает ошибку, если state.error есть.
         * Если state === null — ничего не показывает.
         */}
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
          className='rounded-lg border border-border-default dark:border-border-default-dark px-4 py-2.5 text-sm font-medium transition-colors hover:bg-bttn-bg hover:text-text-hover-inv dark:hover:bg-bttn-bg-dark cursor-pointer disabled:opacity-50'
        >
          Добавить путешественника
        </button>

        {/*
         * Кнопка "закрыть" внизу формы — дублирует крестик.
         * Удобно для мобильных устройств.
         */}
        <button
          type='button'
          onClick={() => setShowForm(false)}
          className='w-min self-center mt-2 text-sm font-medium transition-colors duration-300 cursor-pointer hover:text-text-hover'
          aria-label='Закрыть'
        >
          закрыть
        </button>
      </form>
    </div>
  );
}
