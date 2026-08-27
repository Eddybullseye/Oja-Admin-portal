"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "motion/react";
import { Shield, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Mock audit logs
  const auditLogs = [
    { id: "log1", action: "Suspended User", admin: "super.admin@oja.com", target: "charlie@example.com", date: "2023-10-26T10:30:00Z" },
    { id: "log2", action: "Approved Verification", admin: "support.agent@oja.com", target: "Alice Smith", date: "2023-10-26T09:15:00Z" },
    { id: "log3", action: "Refunded Transaction tx1", admin: "finance@oja.com", target: "Bob Jones", date: "2023-10-25T14:20:00Z" },
    { id: "log4", action: "Updated Category Pricing", admin: "super.admin@oja.com", target: "Cleaning", date: "2023-10-25T11:00:00Z" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Admin Profile</span>
            </CardTitle>
            <CardDescription>Your current administrative session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="text-foreground font-medium">super.admin@oja.com</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="text-foreground font-medium flex items-center mt-1">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Super Admin
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">2FA Status</label>
              <div className="text-success font-medium flex items-center mt-1 text-sm">
                <span className="w-2 h-2 rounded-full bg-success mr-2"></span>
                Enabled & Verified
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the admin portal theme. Default is light mode for data density.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                onClick={() => setTheme('light')}
                className="w-full justify-start"
              >
                <Sun className="w-4 h-4 mr-2" /> Light
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                onClick={() => setTheme('dark')}
                className="w-full justify-start"
              >
                <Moon className="w-4 h-4 mr-2" /> Dark
              </Button>
              <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                onClick={() => setTheme('system')}
                className="w-full justify-start"
              >
                <Monitor className="w-4 h-4 mr-2" /> System
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Record of administrative actions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.date).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{log.admin}</TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
