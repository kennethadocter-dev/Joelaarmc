import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function ClauseIndex() {
  const { clauses = [] } = usePage().props;
  const [editing, setEditing] = useState(null);

  const { data, setData, post, put, delete: destroy, reset, processing } = useForm({
    title: "",
    body: "",
    is_active: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      put(route("clauses.update", editing.id), { onSuccess: resetForm });
    } else {
      post(route("clauses.store"), { onSuccess: resetForm });
    }
  };

  const resetForm = () => {
    reset();
    setEditing(null);
  };

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">📜 Manage Clauses</h2>}>
      <Head title="Clauses" />
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        
        {/* ✍️ Add or Edit Clause */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {editing ? "✏️ Edit Clause" : "➕ Add New Clause"}
          </h3>

          <input
            type="text"
            placeholder="Clause Title"
            value={data.title}
            onChange={(e) => setData("title", e.target.value)}
            className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />

          <textarea
            placeholder="Clause text..."
            rows="4"
            value={data.body}
            onChange={(e) => setData("body", e.target.value)}
            className="w-full border dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          ></textarea>

          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={(e) => setData("is_active", e.target.checked)}
              className="rounded border-gray-400 dark:border-gray-600"
            />
            Active
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            >
              {editing ? "Update Clause" : "Add Clause"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* 📃 Clauses Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">📚 All Clauses</h3>

          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Body</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clauses.length ? (
                clauses.map((clause) => (
                  <tr key={clause.id} className="border-b dark:border-gray-700">
                    <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{clause.title}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 whitespace-pre-line">{clause.body}</td>
                    <td className="p-3">{clause.is_active ? "✅ Active" : "🚫 Inactive"}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => {
                          setEditing(clause);
                          setData({
                            title: clause.title,
                            body: clause.body,
                            is_active: clause.is_active,
                          });
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => destroy(route("clauses.destroy", clause.id))}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500 dark:text-gray-400">
                    No clauses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}