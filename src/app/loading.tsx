/**
 * работает для всех страниц в папке app
 */
export default function Loading() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-bg-page dark:bg-bg-page-dark'>
      <div className='flex flex-col items-center gap-6'>
        <div className='relative flex h-16 w-16 items-center justify-center'>
          <div className='absolute inset-0 rounded-full border-2 border-border-default dark:border-border-default-dark' />
          <div className='absolute inset-0 rounded-full border-t-2 border-zinc-900 animate-spin' />
          <span className='relative text-2xl'>✈️</span>
        </div>
        <p className='text-sm text-text-muted dark:text-text-muted-dark'>
          Загрузка ...
        </p>
      </div>
    </div>
  );
}
