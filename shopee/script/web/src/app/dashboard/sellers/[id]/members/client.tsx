'use client';

import { useState } from 'react';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { colors } from '@/lib/uiConfig';

interface Member {
  id: number;
  seller_id: number;
  profile_id: string;
  role: 'owner' | 'manager' | 'staff';
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

interface SellerMembersClientProps {
  sellerId: number;
  members: Member[];
  canManage: boolean;
}

export default function SellerMembersClient({ sellerId, members: initialMembers, canManage }: SellerMembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const handleDelete = async (member: Member) => {
    if (!confirm('Remove this team member?')) return;

    try {
      const res = await fetch(`/api/admin/seller-members/${member.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      const refreshRes = await fetch(`/api/admin/seller-members?seller_id=${sellerId}`);
      const data = await refreshRes.json();
      setMembers(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns: Column<Member>[] = [
    {
      key: 'profile_id',
      label: 'Member',
      render: (member) => (
        <span className="font-semibold text-slate-900">
          {member.profiles?.full_name || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (member) => {
        const roleColors = {
          owner: 'bg-purple-50 text-purple-700',
          manager: 'bg-blue-50 text-blue-700',
          staff: 'bg-slate-100 text-slate-700',
        };

        return (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleColors[member.role]}`}>
            {member.role}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Added',
      sortable: true,
      render: (member) => (
        <span className="text-sm text-slate-600">
          {new Date(member.created_at).toLocaleDateString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={members}
      keyExtractor={(member) => member.id.toString()}
      searchPlaceholder="Search members..."
      emptyMessage="No team members yet"
      actions={(member) => (
        canManage && member.role !== 'owner' && (
          <button
            onClick={() => handleDelete(member)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Remove
          </button>
        )
      )}
    />
  );
}
