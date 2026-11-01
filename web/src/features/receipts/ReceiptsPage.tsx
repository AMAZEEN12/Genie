import React, { useMemo, useState } from 'react';
import { useAuth } from '../../app/authContext';
import {
  useReceiptsQuery,
  useDecideReceiptMutation,
  useReimburseReceiptMutation,
  useDeleteReceiptMutation,
} from '../../hooks/useReceipts';
import type { ReceiptModel, ReceiptStatus } from '../../service/models/receipt.models';
import { ReceiptStatusBadge } from './ReceiptStatusBadge';
import { formatBytes } from './formatBytes';
import { UploadReceiptModal } from './modals/UploadReceiptModal';
import { ReceiptViewModal } from './modals/ReceiptViewModal';

export function ReceiptsPage(): React.JSX.Element {
  const { user } = useAuth();
  const role = user?.role || 'TECHNICIAN';

  const [statusFilter, setStatusFilter] = useState<'all' | ReceiptStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptModel | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: receipts = [], isLoading, isError, error, refetch } = useReceiptsQuery();

  const decideMutation = useDecideReceiptMutation();
  const reimburseMutation = useReimburseReceiptMutation();
  const deleteMutation = useDeleteReceiptMutation();

  // Counts for filter pills
  const counts = useMemo(() => {
    const res = { all: receipts.length, submitted: 0, approved: 0, reimbursed: 0, rejected: 0 };
    receipts.forEach((r) => {
      if (r.status in res) {
        res[r.status]++;
      }
    });
    return res;
  }, [receipts]);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      if (statusFilter !== 'all' && receipt.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = receipt.originalName.toLowerCase().includes(q);
        const matchesId = receipt.id.toLowerCase().includes(q);
        const matchesUploader = receipt.uploadedBy.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesUploader) {
          return false;
        }
      }
      return true;
    });
  }, [receipts, statusFilter, searchQuery]);

  const handleOpenView = (receipt: ReceiptModel) => {
    setSelectedReceipt(receipt);
    setIsViewOpen(true);
  };

  const handleApprove = async (receipt: ReceiptModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      await decideMutation.mutateAsync({ id: receipt.id, status: 'approved' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve receipt');
    }
  };

  const handleReject = async (receipt: ReceiptModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      await decideMutation.mutateAsync({ id: receipt.id, status: 'rejected' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject receipt');
    }
  };

  const handleReimburse = async (receipt: ReceiptModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionError(null);
    try {
      await reimburseMutation.mutateAsync({ id: receipt.id });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reimburse receipt');
    }
  };

  const handleDelete = async (receipt: ReceiptModel, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete receipt "${receipt.originalName}"? This action is recorded in the audit log.`)) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync({ id: receipt.id });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete receipt');
    }
  };

  const handleExportCSV = () => {
    if (filteredReceipts.length === 0) return;

    const headers = ['ID', 'Filename', 'Format', 'Bytes', 'Status', 'UploadedBy', 'CreatedAt', 'DecidedBy', 'DecidedAt', 'ReimbursedAt'];
    const rows = filteredReceipts.map((r) => [
      r.id,
      `"${r.originalName.replace(/"/g, '""')}"`,
      r.format,
      r.bytes,
      r.status,
      r.uploadedBy,
      r.createdAt,
      r.decidedBy || '',
      r.decidedAt || '',
      r.reimbursedAt || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `genie_receipts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRoleHeader = () => {
    switch (role) {
      case 'MANAGER':
        return {
          title: 'Team Receipts & Approvals',
          subtitle: 'Review direct reports’ expense receipts and manage team reimbursements.',
        };
      case 'FINANCE':
        return {
          title: 'Receipts & Reimbursements',
          subtitle: 'Audit organisation receipts, execute reimbursement workflows, and export logs.',
        };
      default:
        return {
          title: 'My Receipts',
          subtitle: 'Upload and monitor expense receipts for verified maintenance repairs.',
        };
    }
  };

  const headerInfo = getRoleHeader();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-[6px] bg-white/5 border border-white/10 text-[#E1EE04] uppercase font-bold">
              {role}
            </span>
            <span className="text-xs text-[#A8A8A8]">• Private Vault</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {headerInfo.title}
          </h1>
          <p className="text-xs text-[#A8A8A8] mt-1">{headerInfo.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'FINANCE' && (
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredReceipts.length === 0}
              className="px-4 py-2.5 rounded-[10px] text-xs font-medium border border-white/14 bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-[#A8A8A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 rounded-[10px] text-xs font-semibold bg-[#E1EE04] text-[#0D0D0D] hover:bg-[#c9d403] transition-colors cursor-pointer shadow-lg flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Upload Receipt</span>
          </button>
        </div>
      </div>

      {/* Global Error Alert Banner */}
      {actionError && (
        <div
          role="alert"
          className="p-4 rounded-[10px] bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] text-sm flex items-start justify-between gap-3"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-white/60 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'all', label: 'All', count: counts.all },
              { key: 'submitted', label: 'Submitted', count: counts.submitted },
              { key: 'approved', label: 'Approved', count: counts.approved },
              { key: 'reimbursed', label: 'Reimbursed', count: counts.reimbursed },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#E1EE04] text-[#0D0D0D] font-semibold'
                    : 'bg-[#1A1A1A] border border-white/10 text-[#A8A8A8] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#0D0D0D]/20 text-[#0D0D0D]' : 'bg-white/10 text-[#A8A8A8]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipts or filenames..."
            className="w-full bg-[#1A1A1A] border border-white/14 rounded-[10px] px-3.5 py-2 text-xs text-white placeholder-[#A8A8A8]/60 focus:outline-none focus:border-[#E1EE04]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-white/50 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Receipts Content */}
      {isLoading ? (
        <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-12 text-center text-sm text-[#A8A8A8]">
          <span className="w-6 h-6 border-2 border-[#E1EE04] border-t-transparent rounded-full animate-spin inline-block mr-2" />
          Loading receipts...
        </div>
      ) : isError ? (
        <div className="bg-[#1A1A1A] border border-[#FF6B5E]/30 rounded-[16px] p-8 text-center space-y-3">
          <p className="text-sm text-[#FF6B5E]">Failed to load receipts: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredReceipts.length === 0 ? (
        /* Empty State */
        <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#E1EE04]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">No receipts found</h3>
            <p className="text-xs text-[#A8A8A8] mt-1 max-w-sm mx-auto">
              {statusFilter !== 'all' || searchQuery
                ? 'No receipts match your selected filter or search query.'
                : 'No expense receipts have been uploaded yet. Upload a receipt to begin the reimbursement workflow.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-[8px] bg-[#E1EE04] text-[#0D0D0D] text-xs font-semibold hover:bg-[#c9d403] transition-colors cursor-pointer"
          >
            Upload Receipt
          </button>
        </div>
      ) : (
        /* Responsive Table & Stacked Cards */
        <div
          tabIndex={0}
          role="region"
          aria-label="Receipts directory"
          className="bg-[#1A1A1A] border border-white/14 rounded-[16px] overflow-hidden shadow-xl"
        >
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-[#141414] border-b border-white/14 text-[#A8A8A8] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="py-3.5 px-4 font-semibold">Receipt File</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">Uploaded</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">Status</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">Workflow Details</th>
                  <th scope="col" className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {filteredReceipts.map((receipt) => {
                  const isPdf = receipt.format.toLowerCase() === 'pdf';
                  const isOwn = Boolean(user?.id && receipt.uploadedBy === user.id);
                  const canManagerApprove =
                    role === 'MANAGER' && receipt.status === 'submitted' && !isOwn;
                  const canFinanceReimburse =
                    role === 'FINANCE' && receipt.status === 'approved';
                  const canUserDelete =
                    role === 'FINANCE' || (isOwn && receipt.status === 'submitted');

                  return (
                    <tr
                      key={receipt.id}
                      onClick={() => handleOpenView(receipt)}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {/* Receipt File */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[6px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#E1EE04] font-mono font-bold text-[10px] uppercase">
                            {isPdf ? 'PDF' : receipt.format}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-white truncate block max-w-xs sm:max-w-sm">
                              {receipt.originalName}
                            </span>
                            <span className="text-[11px] text-[#A8A8A8] font-mono">
                              {formatBytes(receipt.bytes)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Uploaded */}
                      <td className="py-4 px-4 text-[#A8A8A8]">
                        <span className="text-white block font-mono text-[11px]">
                          {new Date(receipt.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px]">
                          {isOwn ? 'You' : `User ${receipt.uploadedBy.slice(0, 8)}...`}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <ReceiptStatusBadge status={receipt.status} />
                      </td>

                      {/* Workflow Details */}
                      <td className="py-4 px-4 text-[#A8A8A8] text-[11px]">
                        {receipt.reimbursedAt ? (
                          <span className="text-[#E1EE04] font-medium">Reimbursed by Finance</span>
                        ) : receipt.decidedAt ? (
                          <span>Manager decided ({receipt.status})</span>
                        ) : (
                          <span className="text-white/40">Awaiting Manager review</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleOpenView(receipt)}
                            className="px-2.5 py-1.5 rounded-[6px] bg-white/5 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          {canManagerApprove && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleReject(receipt, e)}
                                disabled={decideMutation.isPending}
                                className="px-2 py-1.5 rounded-[6px] border border-[#FF6B5E]/30 text-[#FF6B5E] hover:bg-[#FF6B5E]/10 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleApprove(receipt, e)}
                                disabled={decideMutation.isPending}
                                className="px-2.5 py-1.5 rounded-[6px] bg-[#10B981] hover:bg-[#0ea371] text-[#0D0D0D] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Approve
                              </button>
                            </>
                          )}

                          {canFinanceReimburse && (
                            <button
                              type="button"
                              onClick={(e) => handleReimburse(receipt, e)}
                              disabled={reimburseMutation.isPending}
                              className="px-2.5 py-1.5 rounded-[6px] bg-[#E1EE04] hover:bg-[#c9d403] text-[#0D0D0D] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Reimburse
                            </button>
                          )}

                          {canUserDelete && (
                            <button
                              type="button"
                              onClick={(e) => handleDelete(receipt, e)}
                              disabled={deleteMutation.isPending}
                              className="p-1.5 rounded-[6px] text-white/40 hover:text-[#FF6B5E] hover:bg-[#FF6B5E]/10 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete receipt"
                              aria-label="Delete receipt"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="sm:hidden divide-y divide-white/10">
            {filteredReceipts.map((receipt) => {
              const isPdf = receipt.format.toLowerCase() === 'pdf';
              const isOwn = Boolean(user?.id && receipt.uploadedBy === user.id);
              const canManagerApprove =
                role === 'MANAGER' && receipt.status === 'submitted' && !isOwn;
              const canFinanceReimburse =
                role === 'FINANCE' && receipt.status === 'approved';
              const canUserDelete =
                role === 'FINANCE' || (isOwn && receipt.status === 'submitted');

              return (
                <div
                  key={receipt.id}
                  onClick={() => handleOpenView(receipt)}
                  className="p-4 space-y-3 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[6px] bg-white/10 flex items-center justify-center shrink-0 text-[#E1EE04] font-mono text-xs font-bold uppercase">
                        {isPdf ? 'PDF' : receipt.format}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-white text-sm truncate block">
                          {receipt.originalName}
                        </span>
                        <span className="text-[11px] text-[#A8A8A8] font-mono">
                          {formatBytes(receipt.bytes)} • {new Date(receipt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ReceiptStatusBadge status={receipt.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#A8A8A8] pt-1">
                    <span>Uploaded by: {isOwn ? 'You' : `User ${receipt.uploadedBy.slice(0, 6)}`}</span>
                    {receipt.reimbursedAt ? (
                      <span className="text-[#E1EE04]">Reimbursed</span>
                    ) : receipt.decidedAt ? (
                      <span>Manager decided</span>
                    ) : null}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenView(receipt)}
                      className="px-3 py-1.5 rounded-[6px] bg-white/10 text-white text-xs font-medium cursor-pointer"
                    >
                      View
                    </button>

                    {canManagerApprove && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleReject(receipt, e)}
                          disabled={decideMutation.isPending}
                          className="px-2.5 py-1.5 rounded-[6px] border border-[#FF6B5E]/30 text-[#FF6B5E] text-xs font-medium cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleApprove(receipt, e)}
                          disabled={decideMutation.isPending}
                          className="px-3 py-1.5 rounded-[6px] bg-[#10B981] text-[#0D0D0D] text-xs font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                      </>
                    )}

                    {canFinanceReimburse && (
                      <button
                        type="button"
                        onClick={(e) => handleReimburse(receipt, e)}
                        disabled={reimburseMutation.isPending}
                        className="px-3 py-1.5 rounded-[6px] bg-[#E1EE04] text-[#0D0D0D] text-xs font-semibold cursor-pointer"
                      >
                        Reimburse
                      </button>
                    )}

                    {canUserDelete && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(receipt, e)}
                        disabled={deleteMutation.isPending}
                        className="px-2 py-1.5 rounded-[6px] text-[#FF6B5E] text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Receipt Modal */}
      <UploadReceiptModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Receipt File & Details View Modal */}
      <ReceiptViewModal
        receipt={selectedReceipt}
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedReceipt(null);
        }}
        viewerRole={role}
        viewerUserId={user?.id}
        onActionComplete={() => refetch()}
      />
    </div>
  );
}
