import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  
  if (type === 'users') return NextResponse.json(db.getUsers());
  if (type === 'verifications') return NextResponse.json(db.getVerifications());
  if (type === 'transactions') return NextResponse.json(db.getTransactions());
  if (type === 'disputes') return NextResponse.json(db.getDisputes());
  if (type === 'reports') return NextResponse.json(db.getReports());
  if (type === 'categories') return NextResponse.json(db.getCategories());
  
  return NextResponse.json({
    users: db.getUsers(),
    verifications: db.getVerifications(),
    transactions: db.getTransactions(),
    disputes: db.getDisputes(),
    reports: db.getReports(),
    categories: db.getCategories(),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action, payload } = body;
  
  switch (action) {
    case 'updateUserStatus':
      db.updateUserStatus(payload.id, payload.status);
      break;
    case 'updateVerificationStatus':
      db.updateVerificationStatus(payload.id, payload.status, payload.reason);
      break;
    case 'updateTransactionStatus':
      db.updateTransactionStatus(payload.id, payload.status);
      break;
    case 'updateDisputeStatus':
      db.updateDisputeStatus(payload.id, payload.status);
      break;
    case 'updateReportStatus':
      db.updateReportStatus(payload.id, payload.status);
      break;
    case 'createCategory':
      db.createCategory(payload);
      break;
    case 'updateCategory':
      db.updateCategory(payload.id, payload);
      break;
    case 'deleteCategory':
      db.deleteCategory(payload.id);
      break;
  }
  
  return NextResponse.json({ success: true });
}
