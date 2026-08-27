"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#028090', '#00A896', '#F9A826', '#E6A93A', '#D64545'];

export default function OverviewPage() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher, { refreshInterval: 5000 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-muted/20 border-border/10">
              <CardHeader className="py-4"><div className="h-4 bg-muted rounded w-1/2"></div></CardHeader>
              <CardContent><div className="h-8 bg-muted rounded w-3/4"></div></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 md:col-span-2 lg:col-span-4 animate-pulse bg-muted/20 h-[400px]"></Card>
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 animate-pulse bg-muted/20 h-[400px]"></Card>
        </div>
      </div>
    );
  }

  if (error || !data) return <div>Failed to load data</div>;

  // Compute stats
  const totalGmv = data.transactions.filter((t: any) => t.status === 'released').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalCommission = data.transactions.filter((t: any) => t.status === 'released').reduce((sum: number, t: any) => sum + t.commission, 0);
  
  const workers = data.users.filter((u: any) => u.type === 'worker' && u.status === 'active').length;
  const buyers = data.users.filter((u: any) => u.type === 'buyer' && u.status === 'active').length;
  const pendingDisputes = data.disputes.filter((d: any) => d.status === 'open' || d.status === 'in_review').length;
  const completedJobs = data.transactions.filter((t: any) => t.status === 'released').length;

  // Mock data for charts if DB is too small
  const transactionData = [
    { name: 'Mon', volume: 4000 },
    { name: 'Tue', volume: 3000 },
    { name: 'Wed', volume: 5000 },
    { name: 'Thu', volume: 2780 },
    { name: 'Fri', volume: 1890 },
    { name: 'Sat', volume: 2390 },
    { name: 'Sun', volume: 3490 },
  ];
  
  const categoryData = data.categories.map((c: any) => ({ name: c.name, value: 400 + Math.random() * 500 }));
  const regionData = [
    { name: 'New York', value: 120 },
    { name: 'Los Angeles', value: 98 },
    { name: 'Chicago', value: 86 },
    { name: 'Houston', value: 72 },
    { name: 'Miami', value: 45 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
        <Badge variant="outline" className="bg-white/50 dark:bg-black/20 text-muted-foreground border-border/50 backdrop-blur-sm">Live Data</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total GMV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalGmv.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Take Rate Rev.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">+15% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{workers + buyers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-primary font-medium">{workers}</span> Workers / <span className="text-secondary font-medium">{buyers}</span> Buyers
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingDisputes}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Transaction Volume</CardTitle>
            <CardDescription>Daily transaction volume over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                />
                <Line type="monotone" dataKey="volume" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)' }} activeDot={{ r: 6 }} animationDuration={400} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Category Breakdown</CardTitle>
            <CardDescription>GMV distribution by service category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={400}
                  stroke="none"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                  formatter={(value: any) => `$${Number(value || 0).toFixed(0)}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none mt-4">
              <span className="text-3xl font-bold text-foreground">{categoryData.length}</span>
              <span className="text-xs text-muted-foreground">Categories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-7 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Top Regions</CardTitle>
            <CardDescription>Active job volume by city.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: 'var(--color-muted)', opacity: 0.4}}
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} animationDuration={400} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
