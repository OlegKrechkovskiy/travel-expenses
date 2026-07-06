import { getHomePageData } from '@/lib/data/home-page';
import { AddTripSection } from '@/modules/home/components/AddTripSection/AddTripSection';
import { UserSection } from '@/modules/home/components/UserSection/UserSection';
import Image from 'next/image';

export default async function Home() {
  const { trips, users } = await getHomePageData();
  console.log('trips length: ', trips.length);
  console.log('users length: ', users.length);
  return (
    <div className='flex flex-col flex-1 items-center justify-center font-sans'>
      <main className='flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start'>
        <div className='flex flex-col items-left justify-center'>
          <h1 className='text-2xl font-semibold tracking-tight text-text-primary dark:text-text-primary-dark'>
            Поездки
          </h1>
          <p className='mt-2'>Выбрать поездку или создать новую</p>
        </div>

        {trips.length === 0 ? (
          <p className='mt-8 p-4 w-full text-sm border rounded-lg border-border-default dark:border-border-default-dark'>
            Пока нет поездок...
          </p>
        ): (
          <ul className='flex flex-col gap-4 w-full mt-8'>
            {trips.map((trip) => (
              /* вынести в компонент TripsItem */
              <li
                key={trip.id}
                className='flex items-center justify-between gap-4 w-full border border-border-default dark:border-border-default-dark rounded-lg p-4'
              >
                <span className='capitalize'>{trip.title}</span>
              </li>
            ))}
          </ul>
        )}

        <AddTripSection users={users} />

        <UserSection users={users} />
      </main>
    </div>
  );
}
