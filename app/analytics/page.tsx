"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Users, Briefcase, DollarSign, Star } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#028090', '#00A896', '#F9A826', '#6366f1'];

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher, { refreshInterval: 5000 });

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted/20 animate-pulse rounded-xl" />)}
        </div>
        <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-xl" />
      </div>
    );
  }
  if (error || !data) return <div className="p-8 text-muted-foreground">Error loading analytics</div>;

  const retentionData = [
    { name: 'Wk 1', cohort: 100 },
    { name: 'Wk 2', cohort: 85 },
    { name: 'Wk 3', cohort: 75 },
    { name: 'Wk 4', cohort: 70 },
    { name: 'Wk 5', cohort: 68 },
    { name: 'Wk 6', cohort: 65 },
    { name: 'Wk 7', cohort: 60 },
  ];

  const funnelData = [
    { name: 'Signup', value: 1000 },
    { name: 'Verified', value: 750 },
    { name: 'First Job', value: 450 },
    { name: 'Repeat Job', value: 300 },
  ];

  const revenueData = [
    { month: 'May', revenue: 18400, jobs: 204 },
    { month: 'Jun', revenue: 22100, jobs: 246 },
    { month: 'Jul', revenue: 19800, jobs: 220 },
    { month: 'Aug', revenue: 26500, jobs: 295 },
    { month: 'Sep', revenue: 24200, jobs: 269 },
    { month: 'Oct', revenue: 28900, jobs: 321 },
  ];

  const categoryData = [
    { name: 'Cleaning', value: 35 },
    { name: 'Plumbing', value: 20 },
    { name: 'Electrical', value: 18 },
    { name: 'Assembly', value: 27 },
  ];

  const kpis = [
    { label: 'Active Workers', value: '12,084', change: '+8.4%', up: true, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Jobs This Month', value: '3,210', change: '+12.1%', up: true, icon: Briefcase, color: 'text-teal-600 bg-teal-50' },
    { label: 'Gross Revenue', value: '$28,900', change: '+19.5%', up: true, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Avg Rating', value: '4.87★', change: '-0.04', up: false, icon: Star, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">Live · Refreshes every 5s</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="shadow-sm border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {kpi.change}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-foreground leading-tight">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{kpi.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue + Jobs Line Chart (full width) */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Revenue & Jobs (6-Month Trend)</CardTitle>
          <CardDescription>Monthly escrow revenue (USD) vs jobs completed.</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '10px', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#028090" strokeWidth={2.5} dot={{ fill: '#028090', r: 4 }} name="Revenue ($)" animationDuration={600} />
              <Line yAxisId="right" type="monotone" dataKey="jobs" stroke="#F9A826" strokeWidth={2} dot={{ fill: '#F9A826', r: 3 }} name="Jobs" animationDuration={600} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lower grid: Retention + Funnel + Category Pie */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-border md:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground text-base">User Retention</CardTitle>
            <CardDescription>Worker cohort % returning weekly.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCohort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#028090" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#028090" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
                <Area type="monotone" dataKey="cohort" stroke="#028090" strokeWidth={2} fillOpacity={1} fill="url(#colorCohort)" animationDuration={600} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border md:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Conversion Funnel</CardTitle>
            <CardDescription>Signup → Verified → Active user journey.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={70} />
                <RechartsTooltip cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }} contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="value" fill="#00A896" radius={[0, 6, 6, 0]} animationDuration={600} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border md:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Jobs by Category</CardTitle>
            <CardDescription>Distribution of completed jobs this month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={600}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
