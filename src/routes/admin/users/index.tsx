import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, ShieldAlert } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersList,
});

function AdminUsersList() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          orders ( id, total_amount )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (
      window.confirm(
        `Are you sure you want to ${currentStatus ? "revoke" : "grant"} admin access for this user?`,
      )
    ) {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (!error) {
        // Optimistically update cache
        queryClient.setQueryData(["admin-users"], (old: any[]) =>
          old.map((u) => (u.id === userId ? { ...u, is_admin: !currentStatus } : u)),
        );
      } else {
        alert("Error updating admin status: " + error.message);
      }
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-black uppercase tracking-tight">Registered Users</h1>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-900">
            <tr>
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Joined</th>
              <th className="px-6 py-4 font-bold">Orders</th>
              <th className="px-6 py-4 font-bold">Total Spent</th>
              <th className="px-6 py-4 font-bold text-right">Admin Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const totalOrders = user.orders?.length || 0;
                const totalSpent =
                  user.orders?.reduce(
                    (acc: number, order: any) => acc + Number(order.total_amount),
                    0,
                  ) || 0;

                return (
                  <tr key={user.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                        {user.id.split("-")[0]}...
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{totalOrders}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      Rs {totalSpent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        className={`flex items-center justify-end gap-1 w-full rounded p-2 text-xs font-bold uppercase transition-colors ${
                          user.is_admin
                            ? "text-red-600 hover:bg-red-50"
                            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                      >
                        {user.is_admin ? (
                          <>
                            <ShieldAlert className="h-4 w-4" /> Revoke
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" /> Grant
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
