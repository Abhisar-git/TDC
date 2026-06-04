import { notFound } from 'next/navigation';
import { getCustomerById, getDb } from '@/lib/db';
import CustomerDetailView from '@/components/CustomerDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const customer = getCustomerById(id);
  
  if (!customer) {
    notFound();
  }
  
  const pool = getDb();
  
  return (
    <div className="flex-1">
      <CustomerDetailView customer={customer} pool={pool} />
    </div>
  );
}

// Force dynamic rendering to load fresh database notes/statuses
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;
