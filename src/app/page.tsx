import { getHomePageData } from '@/lib/data/home-page';
import Image from 'next/image';

export default async function Home() {
  const { trips } = await getHomePageData();
  console.log('trips: ', trips.length);
  return (
    <div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start'>
        <h1 className='text-2xl font-semibold tracking-tight text-text-primary dark:text-text-primary-dark'>
          Поездки
        </h1>
        <p className='mt-2'>Выбрать поездку или создать новую</p>

        {trips.length === 0 && (
          <p className='mt-8 rounded-lg border border-dashed border-border-input dark:border-border-input-dark bg-bg-card dark:bg-bg-card-dark p-6 text-text-muted dark:text-text-muted-dark'>
            Нет поездок
          </p>
        )}
      </main>
    </div>
  );
}
