"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { Search, MoreVertical, Ban, Play, FileText, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersPage() {
  const { data: users, error, isLoading, mutate } = useSWR('/api/data?type=users', fetcher, { refreshInterval: 5000 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("workers");
  
  // Dialog state
  const [actionUser, setActionUser] = useState<any>(null);
  const [actionType, setActionType] = useState<"suspend" | "ban" | "reactivate" | null>(null);

  if (isLoading) {
    return <div className="p-8"><div className="h-8 w-32 bg-muted animate-pulse rounded mb-6"></div><div className="h-[400px] w-full bg-muted/20 animate-pulse rounded"></div></div>;
  }
  if (error || !users) return <div>Error loading users</div>;

  const filteredUsers = users.filter((u: any) => {
    if (activeTab === "workers" && u.type !== "worker") return false;
    if (activeTab === "buyers" && u.type !== "buyer") return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAction = async () => {
    if (!actionUser || !actionType) return;
    
    let newStatus = actionUser.status;
    if (actionType === 'suspend') newStatus = 'suspended';
    if (actionType === 'ban') newStatus = 'banned';
    if (actionType === 'reactivate') newStatus = 'active';

    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateUserStatus', payload: { id: actionUser.id, status: newStatus } })
    });
    
    mutate();
    setActionUser(null);
    setActionType(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'suspended': return <Badge variant="warning">Suspended</Badge>;
      case 'banned': return <Badge variant="destructive">Banned</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Users</h1>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        <Tabs defaultValue="workers" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border gap-4">
            <TabsList className="w-full sm:w-auto justify-start overflow-x-auto">
              <TabsTrigger value="workers">Workers</TabsTrigger>
              <TabsTrigger value="buyers">Buyers</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                className="pl-8 bg-muted/50 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="workers" className="p-0 m-0 border-none outline-none">
            <UserTable users={filteredUsers} getStatusBadge={getStatusBadge} setActionUser={setActionUser} setActionType={setActionType} />
          </TabsContent>
          <TabsContent value="buyers" className="p-0 m-0 border-none outline-none">
            <UserTable users={filteredUsers} getStatusBadge={getStatusBadge} setActionUser={setActionUser} setActionType={setActionType} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!actionUser} onOpenChange={(open) => !open && setActionUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'suspend' && 'Suspend User'}
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'reactivate' && 'Reactivate User'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'suspend' && `Are you sure you want to suspend ${actionUser?.name}? They will temporarily not be able to log in.`}
              {actionType === 'ban' && `Are you sure you want to permanently ban ${actionUser?.name}? This action is severe.`}
              {actionType === 'reactivate' && `Are you sure you want to reactivate ${actionUser?.name}'s account?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant={actionType === 'reactivate' ? 'default' : 'destructive'} 
              onClick={handleAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function UserTable({ users, getStatusBadge, setActionUser, setActionType }: any) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Jobs</TableHead>
          <TableHead className="text-right">Rating</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user: any) => (
            <TableRow key={user.id} className="group">
              <TableCell className="font-medium text-foreground">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell className="text-muted-foreground">{format(new Date(user.joinDate), 'MMM d, yyyy')}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell className="text-right">{user.totalJobs}</TableCell>
              <TableCell className="text-right">{user.rating.toFixed(1)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" /> View Profile
                    </DropdownMenuItem>
                    {user.status !== 'active' ? (
                      <DropdownMenuItem className="cursor-pointer text-success focus:text-success" onClick={() => { setActionUser(user); setActionType('reactivate'); }}>
                        <Play className="mr-2 h-4 w-4" /> Reactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="cursor-pointer text-warning focus:text-warning" onClick={() => { setActionUser(user); setActionType('suspend'); }}>
                        <AlertTriangle className="mr-2 h-4 w-4" /> Suspend
                      </DropdownMenuItem>
                    )}
                    {user.status !== 'banned' && (
                      <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={() => { setActionUser(user); setActionType('ban'); }}>
                        <Ban className="mr-2 h-4 w-4" /> Ban
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
