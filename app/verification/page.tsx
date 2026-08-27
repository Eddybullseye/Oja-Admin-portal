"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Search, Eye, CheckCircle, XCircle, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VerificationPage() {
  const { data: verifications, error, isLoading, mutate } = useSWR('/api/data?type=verifications', fetcher, { refreshInterval: 5000 });
  const [filter, setFilter] = useState<string>("all");

  const [actionItem, setActionItem] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "view" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) {
    return <div className="p-8"><div className="h-8 w-32 bg-muted animate-pulse rounded mb-6"></div><div className="h-[400px] w-full bg-muted/20 animate-pulse rounded"></div></div>;
  }
  if (error || !verifications) return <div>Error loading verifications</div>;

  const filteredVerifications = verifications.filter((v: any) => {
    if (filter !== "all" && v.status !== filter) return false;
    return true;
  });

  const handleAction = async () => {
    if (!actionItem || !actionType || actionType === 'view') return;

    if (actionType === 'reject' && !rejectReason) return; // Basic validation

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateVerificationStatus',
        payload: {
          id: actionItem.id,
          status: actionType === 'approve' ? 'approved' : 'rejected',
          reason: actionType === 'reject' ? rejectReason : undefined
        }
      })
    });

    mutate();
    setActionItem(null);
    setActionType(null);
    setRejectReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pending = verifications.filter((v: any) => v.status === 'pending').length;
  const approved = verifications.filter((v: any) => v.status === 'approved').length;
  const rejected = verifications.filter((v: any) => v.status === 'rejected').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Verification Queue</h1>
        {pending > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <Clock size={12} /> {pending} awaiting review
          </span>
        )}
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Clock size={18} /></div>
          <div><p className="text-2xl font-black text-foreground">{pending}</p><p className="text-xs text-muted-foreground font-medium">Pending</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
          <div><p className="text-2xl font-black text-foreground">{approved}</p><p className="text-xs text-muted-foreground font-medium">Approved</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0"><AlertTriangle size={18} /></div>
          <div><p className="text-2xl font-black text-foreground">{rejected}</p><p className="text-xs text-muted-foreground font-medium">Rejected</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} size="sm">All</Button>
            <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')} size="sm">Pending</Button>
            <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')} size="sm">Approved</Button>
            <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')} size="sm">Rejected</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker Name</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Document</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVerifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No verifications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredVerifications.map((item: any) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="font-medium text-foreground">{item.workerName}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(item.submittedDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => { setActionItem(item); setActionType('view'); }} className="h-8">
                      <Eye className="mr-2 h-4 w-4" /> View Doc
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {item.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="h-8 bg-success/10 text-success border-success/20 hover:bg-success hover:text-white" onClick={() => { setActionItem(item); setActionType('approve'); }}>
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white" onClick={() => { setActionItem(item); setActionType('reject'); }}>
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className={actionType === 'view' ? "sm:max-w-xl" : ""}>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'view' && 'Document Viewer'}
              {actionType === 'approve' && 'Approve Verification'}
              {actionType === 'reject' && 'Reject Verification'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && `Are you sure you want to approve ${actionItem?.workerName}?`}
              {actionType === 'reject' && `Please provide a reason for rejecting ${actionItem?.workerName}.`}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'view' && (
            <div className="relative w-full h-[400px] bg-muted rounded-md overflow-hidden">
              <Image src={actionItem?.documentUrl || 'https://picsum.photos/seed/doc1/400/600'} alt="Document" fill className="object-contain" referrerPolicy="no-referrer" />
            </div>
          )}

          {actionType === 'reject' && (
            <div className="py-4">
              <Input
                placeholder="Reason for rejection (e.g., Image too blurry)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <DialogFooter>
            {actionType === 'view' ? (
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            ) : (
              <>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant={actionType === 'reject' ? 'destructive' : 'default'}
                  onClick={handleAction}
                  disabled={actionType === 'reject' && !rejectReason.trim()}
                >
                  Confirm
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
