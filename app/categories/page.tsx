"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
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

export default function CategoriesPage() {
  const { data: categories, error, isLoading, mutate } = useSWR('/api/data?type=categories', fetcher, { refreshInterval: 5000 });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', commissionRate: 10, featuredPrice: 20 });

  if (isLoading) {
    return <div className="p-8"><div className="h-8 w-32 bg-muted animate-pulse rounded mb-6"></div><div className="h-[400px] w-full bg-muted/20 animate-pulse rounded"></div></div>;
  }
  if (error || !categories) return <div>Error loading categories</div>;

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({ name: '', commissionRate: 10, featuredPrice: 20 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingItem(cat);
    setFormData({ name: cat.name, commissionRate: cat.commissionRate, featuredPrice: cat.featuredPrice });
    setIsFormOpen(true);
  };

  const handleOpenDelete = (cat: any) => {
    setEditingItem(cat);
    setIsDeleteOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: editingItem ? 'updateCategory' : 'createCategory', 
        payload: editingItem ? { id: editingItem.id, ...formData } : formData
      })
    });
    
    mutate();
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'deleteCategory', 
        payload: { id: editingItem.id } 
      })
    });
    
    mutate();
    setIsDeleteOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Categories & Pricing</h1>
        <Button onClick={handleOpenNew}>
           <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-right">Commission Rate (%)</TableHead>
              <TableHead className="text-right">Featured Listing Price ($)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c: any) => (
                <TableRow key={c.id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.id}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">{c.commissionRate}%</TableCell>
                  <TableCell className="text-right">${c.featuredPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(c)} className="h-8 w-8 p-0">
                      <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDelete(c)} className="h-8 w-8 p-0 hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              Configure the category settings and pricing model.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input 
                   value={formData.name} 
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   placeholder="e.g. Cleaning"
                />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium">Commission Rate (%)</label>
                   <Input 
                      type="number"
                      value={formData.commissionRate} 
                      onChange={(e) => setFormData({...formData, commissionRate: Number(e.target.value)})}
                      min={0} max={100}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Featured Price ($)</label>
                   <Input 
                      type="number"
                      value={formData.featuredPrice} 
                      onChange={(e) => setFormData({...formData, featuredPrice: Number(e.target.value)})}
                      min={0}
                   />
                </div>
             </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{editingItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

