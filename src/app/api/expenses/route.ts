import { supabase } from '@/lib/db';
import { ExpenseSchema, UpdateExpenseSchema } from '@/utils/validation';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = ExpenseSchema.parse(body);

    const { data, error } = await supabase
      .from('expenses')
      .insert([validatedData])
      .select();

    if (error) throw new Error(error.message);

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
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('Received Data:', body);
    const validatedData = UpdateExpenseSchema.parse(body);
    console.log('Validated Data:', validatedData);

    if (!validatedData.id) {
      throw new Error('Expense ID is required for update');
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(validatedData)
      .eq('id', validatedData.id)
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new Error('Expense ID is required for deletion');
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    return NextResponse.json(
      { success: true, message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }
}