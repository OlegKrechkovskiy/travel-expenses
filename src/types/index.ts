/**
 * Типы документов MongoDB
 *
 * Зачем отдельные типы?
 * — TypeScript подсказывает поля при чтении/записи.
 * — Один раз договорились о форме документа — используем везде.
 *
 * ObjectId — идентификатор записи в MongoDB (как primary key).
 */

import type { ObjectId } from 'mongodb';

/** Участник поездки */
export type User = {
  _id: ObjectId;
  name: string;
  createdAt: Date;
};

/**
 * Поездка — контекст, в котором живут расходы.
 * memberIds — кто участвует.
 */
export type Trip = {
  _id: ObjectId;
  title: string;
  memberIds: ObjectId[];
  createdAt: Date;
  completedAt?: Date; // Дата завершения поездки
};
