import  ExcelJS  from 'exceljs';
import { supabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data: expenses } = await supabase.from('expenses').select('*');
    const { data: workEntries } = await supabase.from('work_entries').select('*');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Combined Report');

    worksheet.addRow(['EXPENSES REPORT']);
    worksheet.addRow(['Company', 'Amount', 'Description', 'Category', 'Date']);
    expenses?.forEach(exp => {
      worksheet.addRow([exp.company, exp.amount, exp.description, exp.category, exp.date]);
    });

    worksheet.addRow([]); // Empty row
    worksheet.addRow(['WORK HOURS REPORT']);
    worksheet.addRow(['Company', 'Start Time', 'End Time', 'Duration (hours)', 'Submitted']);
    workEntries?.forEach(entry => {
      worksheet.addRow([
        entry.company,
        entry.start_time,
        entry.end_time,
        entry.duration,
        entry.is_submitted ? 'Yes' : 'No'
      ]);
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=combined_report.xlsx'
      }
    });

  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to generate report: ', err },
      { status: 500 }
    );
  }
}