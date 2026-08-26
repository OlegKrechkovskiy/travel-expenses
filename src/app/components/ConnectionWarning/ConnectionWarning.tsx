/**
 * Предупреждение о проблемах с подключением к базе данных.
 *
 * Рендерится на сервере (без 'use client'), поэтому статично и без интерактива.
 * Показывается на главной странице, когда getHomePageData вернул dbError: true.
 */
export function ConnectionWarning() {
  return (
    <div
      role="alert"
      className="mt-8 w-full rounded-lg border border-border-error bg-bg-error dark:bg-bg-error-dark px-4 py-3 text-sm text-text-white"
    >
      ⚠️ Не удалось подключиться к базе данных. Данные временно недоступны.<br/>
      Попробуйте обновить страницу позже.
    </div>
  );
}