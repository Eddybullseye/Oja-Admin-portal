export type UserRole = 'super_admin' | 'support_agent' | 'finance' | 'moderator';

export type User = {
  id: string;
  name: string;
  email: string;
  type: 'worker' | 'buyer';
  joinDate: string;
  status: 'active' | 'suspended' | 'banned';
  rating: number;
  totalJobs: number;
  lastActive: string;
};

export type VerificationQueueItem = {
  id: string;
  workerId: string;
  workerName: string;
  submittedDate: string;
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
};

export type Transaction = {
  id: string;
  buyerName: string;
  workerName: string;
  amount: number;
  commission: number;
  status: 'held' | 'released' | 'refunded';
  date: string;
  gatewayRef: string;
};

export type Dispute = {
  id: string;
  transactionId: string;
  buyerName: string;
  workerName: string;
  status: 'open' | 'in_review' | 'resolved';
  priority: 'high' | 'normal';
  createdAt: string;
  messages: { sender: string; text: string; time: string }[];
};

export type Report = {
  id: string;
  reporterName: string;
  reportedName: string;
  type: 'review' | 'message' | 'profile';
  content: string;
  reason: string;
  status: 'pending' | 'removed' | 'escalated' | 'approved';
  date: string;
};

export type Category = {
  id: string;
  name: string;
  commissionRate: number;
  featuredPrice: number;
};

// Seed Data
let users: User[] = [
  { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', type: 'worker', joinDate: '2023-01-15', status: 'active', rating: 4.8, totalJobs: 42, lastActive: '2023-10-25' },
  { id: 'u2', name: 'Bob Jones', email: 'bob@example.com', type: 'buyer', joinDate: '2023-03-22', status: 'active', rating: 5.0, totalJobs: 12, lastActive: '2023-10-24' },
  { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', type: 'worker', joinDate: '2023-06-10', status: 'suspended', rating: 3.2, totalJobs: 5, lastActive: '2023-09-10' },
  { id: 'u4', name: 'Diana Prince', email: 'diana@example.com', type: 'buyer', joinDate: '2023-08-05', status: 'active', rating: 4.9, totalJobs: 30, lastActive: '2023-10-26' },
];

let verifications: VerificationQueueItem[] = [
  { id: 'v1', workerId: 'u1', workerName: 'Alice Smith', submittedDate: '2023-10-20', documentUrl: 'https://picsum.photos/seed/doc1/400/600', status: 'pending' },
  { id: 'v2', workerId: 'u3', workerName: 'Charlie Brown', submittedDate: '2023-10-22', documentUrl: 'https://picsum.photos/seed/doc2/400/600', status: 'pending' },
];

let transactions: Transaction[] = [
  { id: 'tx1', buyerName: 'Bob Jones', workerName: 'Alice Smith', amount: 150.00, commission: 15.00, status: 'released', date: '2023-10-21', gatewayRef: 'pi_3M...' },
  { id: 'tx2', buyerName: 'Diana Prince', workerName: 'Alice Smith', amount: 300.00, commission: 30.00, status: 'held', date: '2023-10-25', gatewayRef: 'pi_4X...' },
];

let disputes: Dispute[] = [
  { id: 'd1', transactionId: 'tx2', buyerName: 'Diana Prince', workerName: 'Alice Smith', status: 'open', priority: 'high', createdAt: '2023-10-25', messages: [{sender: 'Diana Prince', text: 'Job was not completed as described.', time: '10:00 AM'}, {sender: 'Alice Smith', text: 'I did exactly what was asked.', time: '10:15 AM'}] }
];

let reports: Report[] = [
  { id: 'r1', reporterName: 'Bob Jones', reportedName: 'Charlie Brown', type: 'message', content: 'Inappropriate language used in chat.', reason: 'Harassment', status: 'pending', date: '2023-10-24' }
];

let categories: Category[] = [
  { id: 'c1', name: 'Cleaning', commissionRate: 10, featuredPrice: 20 },
  { id: 'c2', name: 'Handyman', commissionRate: 12, featuredPrice: 25 },
];

export const db = {
  getUsers: () => [...users],
  updateUserStatus: (id: string, status: User['status']) => { users = users.map(u => u.id === id ? { ...u, status } : u) },
  
  getVerifications: () => [...verifications],
  updateVerificationStatus: (id: string, status: VerificationQueueItem['status'], reason?: string) => { verifications = verifications.map(v => v.id === id ? { ...v, status, rejectionReason: reason } : v) },
  
  getTransactions: () => [...transactions],
  updateTransactionStatus: (id: string, status: Transaction['status']) => { transactions = transactions.map(t => t.id === id ? { ...t, status } : t) },

  getDisputes: () => [...disputes],
  updateDisputeStatus: (id: string, status: Dispute['status']) => { disputes = disputes.map(d => d.id === id ? { ...d, status } : d) },

  getReports: () => [...reports],
  updateReportStatus: (id: string, status: Report['status']) => { reports = reports.map(r => r.id === id ? { ...r, status } : r) },

  getCategories: () => [...categories],
  createCategory: (cat: Omit<Category, 'id'>) => { categories.push({ ...cat, id: `c${categories.length + 1}` }) },
  updateCategory: (id: string, cat: Partial<Category>) => { categories = categories.map(c => c.id === id ? { ...c, ...cat } : c) },
  deleteCategory: (id: string) => { categories = categories.filter(c => c.id !== id) },
};
