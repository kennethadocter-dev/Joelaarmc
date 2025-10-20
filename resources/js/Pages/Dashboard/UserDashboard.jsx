import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { FaMoneyBillWave, FaCalendarAlt, FaChartLine } from "react-icons/fa";

export default function UserDashboard({ auth, userLoans, userPayments, error }) {
  const user = auth?.user || {};

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold">My Dashboard</h2>}
    >
      <Head title="My Dashboard" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ⚠️ Error Notice */}
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* 🧾 Summary Cards */}
        {userLoans && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-md">
              <FaMoneyBillWave className="text-3xl mb-2" />
              <p className="text-sm uppercase opacity-80">Total Loan</p>
              <h2 className="text-2xl font-bold">₵{userLoans.totalLoan?.toFixed(2) ?? 0}</h2>
            </div>

            <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-md">
              <FaChartLine className="text-3xl mb-2" />
              <p className="text-sm uppercase opacity-80">Amount Paid</p>
              <h2 className="text-2xl font-bold">₵{userLoans.amountPaid?.toFixed(2) ?? 0}</h2>
            </div>

            <div className="p-5 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-md">
              <FaMoneyBillWave className="text-3xl mb-2" />
              <p className="text-sm uppercase opacity-80">Remaining Balance</p>
              <h2 className="text-2xl font-bold">₵{userLoans.amountLeft?.toFixed(2) ?? 0}</h2>
            </div>

            <div className="p-5 bg-gradient-to-br from-yellow-500 to-orange-600 text-white rounded-xl shadow-md">
              <FaCalendarAlt className="text-3xl mb-2" />
              <p className="text-sm uppercase opacity-80">Next Due Date</p>
              <h2 className="text-xl font-semibold">
                {userLoans.nextDueDate
                  ? new Date(userLoans.nextDueDate).toLocaleDateString()
                  : "—"}
              </h2>
            </div>
          </div>
        )}

        {/* 📊 Loan Status */}
        {userLoans && (
          <div className="p-5 bg-white dark:bg-gray-800 shadow rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Current Loan Status
            </h3>
            <p
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                userLoans.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : userLoans.status === "overdue"
                  ? "bg-red-100 text-red-700"
                  : userLoans.status === "active"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {userLoans.status || "—"}
            </p>
          </div>
        )}

        {/* 💳 Recent Payments */}
        <div className="p-5 bg-white dark:bg-gray-800 shadow rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
            Recent Payments
          </h3>
          {userPayments && userPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {userPayments.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{i + 1}</td>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-100 font-medium">
                        ₵{p.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                        {new Date(p.paid_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">
                        {p.reference || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              No recent payments found.
            </p>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}