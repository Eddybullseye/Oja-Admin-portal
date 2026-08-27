"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Shield, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsPage() {
  const { data: reports, error, isLoading, mutate } = useSWR('/api/data?type=reports', fetcher, { refreshInterval: 5000 });
  
  const [actionItem, setActionItem] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "remove" | "escalate" | null>(null);

  if (isLoading) {
    return <div className="p-8"><div className="h-8 w-32 bg-muted animate-pulse rounded mb-6"></div><div className="h-[400px] w-full bg-muted/20 animate-pulse rounded"></div></div>;
  }
  if (error || !reports) return <div>Error loading reports</div>;

  const handleAction = async () => {
    if (!actionItem || !actionType) return;
    
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'updateReportStatus', 
        payload: { 
          id: actionItem.id, 
          status: actionType === 'approve' ? 'approved' : actionType === 'remove' ? 'removed' : 'escalated'
        } 
      })
    });
    
    mutate();
    setActionItem(null);
    setActionType(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'removed': return <Badge variant="destructive">Removed</Badge>;
      case 'escalated': return <Badge variant="destructive">Escalated</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reviews & Reports</h1>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Reported User</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((r: any) => (
                <TableRow key={r.id} className="group">
                  <TableCell className="text-muted-foreground whitespace-nowrap">{format(new Date(r.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{r.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{r.reporterName}</TableCell>
                  <TableCell className="font-medium">{r.reportedName}</TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{r.reason}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{r.content}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {r.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="h-8 bg-success/10 text-success border-success/20 hover:bg-success hover:text-white" onClick={() => { setActionItem(r); setActionType('approve'); }}>
                          Keep
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-warning/10 text-warning border-warning/20 hover:bg-warning hover:text-white" onClick={() => { setActionItem(r); setActionType('remove'); }}>
                          Remove
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white" onClick={() => { setActionItem(r); setActionType('escalate'); }}>
                          Escalate
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Keep Content'}
              {actionType === 'remove' && 'Remove Content'}
              {actionType === 'escalate' && 'Escalate Report'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && `Are you sure you want to approve this content and dismiss the report?`}
              {actionType === 'remove' && `Are you sure you want to remove this ${actionItem?.type} from the platform?`}
              {actionType === 'escalate' && `Are you sure you want to escalate this report to Super Admin?`}
            </DialogDescription>
          </DialogHeader>
          
          {actionItem && (
            <div className="p-4 bg-muted/50 rounded-lg border text-sm mt-4">
               <div className="font-medium mb-2">Reported Content:</div>
               <p className="text-muted-foreground italic">"{actionItem.content}"</p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant={actionType === 'remove' || actionType === 'escalate' ? 'destructive' : 'default'} 
              onClick={handleAction}
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

