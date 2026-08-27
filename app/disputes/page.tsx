"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Search, ShieldAlert, MessageSquare, ArrowRightLeft } from "lucide-react";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DisputesPage() {
  const { data: disputes, error, isLoading, mutate } = useSWR('/api/data?type=disputes', fetcher, { refreshInterval: 5000 });
  
  const [actionItem, setActionItem] = useState<any>(null);
  const [actionType, setActionType] = useState<"refund" | "release" | "view" | null>(null);

  if (isLoading) {
    return <div className="p-8"><div className="h-8 w-32 bg-muted animate-pulse rounded mb-6"></div><div className="h-[400px] w-full bg-muted/20 animate-pulse rounded"></div></div>;
  }
  if (error || !disputes) return <div>Error loading disputes</div>;

  // Sort by priority then date
  const sortedDisputes = [...disputes].sort((a: any, b: any) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAction = async () => {
    if (!actionItem || !actionType || actionType === 'view') return;
    
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'updateDisputeStatus', 
        payload: { 
          id: actionItem.id, 
          status: 'resolved'
        } 
      })
    });
    
    mutate();
    setActionItem(null);
    setActionType(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved': return <Badge variant="success">Resolved</Badge>;
      case 'in_review': return <Badge variant="warning">In Review</Badge>;
      case 'open': return <Badge variant="destructive">Open</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Disputes</h1>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDisputes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No disputes found.
                </TableCell>
              </TableRow>
            ) : (
              sortedDisputes.map((d: any) => (
                <TableRow key={d.id} className={`group ${d.priority === 'high' && d.status !== 'resolved' ? 'bg-destructive/5 hover:bg-destructive/10' : ''}`}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{d.id}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(d.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{d.buyerName}</TableCell>
                  <TableCell className="font-medium">{d.workerName}</TableCell>
                  <TableCell>{getStatusBadge(d.status)}</TableCell>
                  <TableCell>
                    {d.priority === 'high' ? (
                      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-transparent"><ShieldAlert className="w-3 h-3 mr-1" /> High</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Normal</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setActionItem(d); setActionType('view'); }} className="h-8">
                      <MessageSquare className="mr-2 h-4 w-4" /> View Details
                    </Button>
                    {d.status !== 'resolved' && (
                      <>
                        <Button variant="outline" size="sm" className="h-8 bg-warning/10 text-warning border-warning/20 hover:bg-warning hover:text-white" onClick={() => { setActionItem(d); setActionType('refund'); }}>
                          Refund Buyer
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 bg-success/10 text-success border-success/20 hover:bg-success hover:text-white" onClick={() => { setActionItem(d); setActionType('release'); }}>
                          Release to Worker
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
        <DialogContent className={actionType === 'view' ? "sm:max-w-2xl" : ""}>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'view' && 'Dispute Details'}
              {actionType === 'refund' && 'Refund Buyer'}
              {actionType === 'release' && 'Release Funds'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'refund' && `Are you sure you want to refund ${actionItem?.buyerName} and close this ticket?`}
              {actionType === 'release' && `Are you sure you want to release funds to ${actionItem?.workerName} and close this ticket?`}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'view' && actionItem && (
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                  <div><span className="text-muted-foreground">Transaction ID:</span> <span className="font-mono">{actionItem.transactionId}</span></div>
                  <div><span className="text-muted-foreground">Buyer:</span> {actionItem.buyerName}</div>
                  <div><span className="text-muted-foreground">Worker:</span> {actionItem.workerName}</div>
               </div>
               <div className="space-y-4 max-h-[400px] overflow-y-auto">
                 <h4 className="font-medium text-sm text-muted-foreground">Message Thread</h4>
                 {actionItem.messages.map((msg: any, i: number) => (
                   <div key={i} className={`p-3 rounded-lg ${msg.sender === actionItem.buyerName ? 'bg-primary/10 ml-0 mr-12' : 'bg-secondary/10 ml-12 mr-0'}`}>
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-medium text-sm">{msg.sender}</span>
                       <span className="text-xs text-muted-foreground">{msg.time}</span>
                     </div>
                     <p className="text-sm">{msg.text}</p>
                   </div>
                 ))}
               </div>
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
                  variant="default" 
                  onClick={handleAction}
                >
                  Confirm Action
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

