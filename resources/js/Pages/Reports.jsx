import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Reports() {
  return (
    <AuthenticatedLayout header="Reports">
      <Head title="Reports" />
      <h1 className="text-2xl font-bold">Reports Management</h1>
    </AuthenticatedLayout>
  );
}