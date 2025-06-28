import { supabase } from '@/lib/db';
import { TimerSchema } from '@/utils/validation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = TimerSchema.parse(body);

    const { data, error } = await supabase
      .from('work_entries')
      .insert([validatedData])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }
}


export async function GET() {
  try {
    const { data, error } = await supabase
      .from('work_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}