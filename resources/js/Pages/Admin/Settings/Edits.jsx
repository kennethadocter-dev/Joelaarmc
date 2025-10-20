import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Edit() {
  const { setting } = usePage().props;
  const { data, setData, post, processing, errors } = useForm({
    logo: null,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("settings.update"));
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-gray-800">Settings</h2>}
    >
      <Head title="Settings" />

      <div className="max-w-xl mx-auto py-10">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Logo</label>
            {setting?.logo_path && (
              <img
                src={`/storage/${setting.logo_path}`}
                alt="Logo"
                className="h-20 my-3"
              />
            )}
            <input
              type="file"
              onChange={(e) => setData("logo", e.target.files[0])}
              className="mt-2 block w-full text-sm"
            />
            {errors.logo && <div className="text-red-500">{errors.logo}</div>}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {processing ? "Updating..." : "Update Logo"}
          </button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}