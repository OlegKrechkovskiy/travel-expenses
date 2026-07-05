'use client';

import { HomeUser } from '@/lib/data/home-page';
import { useCallback, useRef, useState } from 'react';

type AddTripSectionProps = {
  users: HomeUser[];
};

export function AddTripSection({ users }: AddTripSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const constentRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    const el = constentRef.current;

    if (!el) return;

    setIsOpen((prev) => !prev);
  }, [isOpen]);

  return (
    <section className='mt-8 p-4 w-full border rounded-lg border-border-default dark:border-border-default-dark'>
      <button
        type='button'
        className='w-full flex items-center justify-between gap-2 rounded-lg outline-none cursor-pointer'
        onClick={toggle}
      >
        <span>Добавить поездку</span>
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div
        ref={constentRef}
        style={{ display: isOpen ? 'block' : 'none' }}
        className='mt-6 flex justify-center'
      >
        {users.map((user) => (
          <p key={user.id}>{user.name}</p>
        ))}
      </div>
    </section>
  );
}
