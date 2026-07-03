import { connectToDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    //Это отправляет MongoDB команду ping. Сервер отвечает { ok: 1 }. Если ответа нет — будет ошибка.
    await db.command({ ping: 1 });
    return NextResponse.json({
      status: 'connected',
      database: db.databaseName
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    );
  }
}
