import { getDb } from '@/lib/db';
import CustomerDashboard from '@/components/CustomerDashboard';

// This is a Server Component, so it runs on the server
export default function Page() {
  const customers = getDb();
  
  return (
    <div className="flex-1">
      <CustomerDashboard initialCustomers={customers} />
    </div>
  );
}

// Force dynamic rendering to always load fresh notes/statuses from the local JSON database
export const dynamic = 'force-dynamic';
export const revalidate = 0;
