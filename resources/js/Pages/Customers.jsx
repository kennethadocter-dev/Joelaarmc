import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Customers() {
  return (
    <AuthenticatedLayout header="Customers">
      <Head title="Customers" />
      <h1 className="text-2xl font-bold">Customers Management</h1>
    </AuthenticatedLayout>
  );
}