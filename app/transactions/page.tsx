"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Search, Download, Filter, DollarSign, Lock, CheckCircle, ArrowLeftRight } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TransactionsPage() {
  const { data: transactions, error, isLoading } = useSWR('/api/data?type=transactions', fetcher, { refreshInterval: 5000 });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  if (isLoading) {
    return <div className="p-8"><div className="h-8 w-32 bg-muted animate-pulse rounded mb-6"></div><div className="h-[400px] w-full bg-muted/20 animate-pulse rounded"></div></div>;
  }
  if (error || !transactions) return <div>Error loading transactions</div>;

  const filteredTransactions = transactions.filter((t: any) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (search && !t.buyerName.toLowerCase().includes(search.toLowerCase()) &&
      !t.workerName.toLowerCase().includes(search.toLowerCase()) &&
      !t.id.toLowerCase().includes(search.toLowerCase()) &&
      !t.gatewayRef.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'released': return <Badge variant="success">Released</Badge>;
      case 'held': return <Badge variant="warning">Held in Escrow</Badge>;
      case 'refunded': return <Badge variant="destructive">Refunded</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExport = () => {
    // Generate CSV
    const headers = ['ID', 'Buyer', 'Worker', 'Amount', 'Commission', 'Status', 'Date', 'Gateway Ref'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((t: any) =>
        [t.id, t.buyerName, t.workerName, t.amount, t.commission, t.status, t.date, t.gatewayRef].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `transactions_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalVolume = filteredTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalHeld = filteredTransactions.filter((t: any) => t.status === 'held').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalReleased = filteredTransactions.filter((t: any) => t.status === 'released').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalRefunded = filteredTransactions.filter((t: any) => t.status === 'refunded').reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><ArrowLeftRight size={18} /></div>
          <div><p className="text-xl font-black text-foreground">${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground font-medium">Total Volume</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Lock size={18} /></div>
          <div><p className="text-xl font-black text-foreground">${totalHeld.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground font-medium">In Escrow</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle size={18} /></div>
          <div><p className="text-xl font-black text-foreground">${totalReleased.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground font-medium">Released</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0"><DollarSign size={18} /></div>
          <div><p className="text-xl font-black text-foreground">${totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground font-medium">Refunded</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-border gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search ID, Buyer, Worker..."
                className="pl-8 bg-muted/50 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus('all')}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('held')}>Held in Escrow</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('released')}>Released</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus('refunded')}>Refunded</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button onClick={handleExport} variant="secondary" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead>Gateway Ref</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No transactions found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx: any) => (
                <TableRow key={tx.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{format(new Date(tx.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium text-foreground">{tx.buyerName}</TableCell>
                  <TableCell className="font-medium text-foreground">{tx.workerName}</TableCell>
                  <TableCell className="text-right font-medium">${tx.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">${tx.commission.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{tx.gatewayRef}</TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
