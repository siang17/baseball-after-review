import { NextResponse } from 'next/server';
import { importRoster, rosterImportSchema } from '@/lib/data/rosterImport';

export const runtime = 'nodejs';

function isAuthorized(request: Request): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const token = process.env.BAR_IMPORT_TOKEN;
  return Boolean(token && request.headers.get('authorization') === `Bearer ${token}`);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const parsed = rosterImportSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid roster payload', issues: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json(await importRoster(parsed.data), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import failed' }, { status: 500 });
  }
}
