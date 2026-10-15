/**
 * Oja Admin Portal — Centralized API Client
 * Base URL: process.env.NEXT_PUBLIC_API_URL (default: http://localhost:3001/api/v1)
 *
 * All requests require a valid admin JWT Bearer token.
 * Token is stored in localStorage as `oja_access_token`.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('oja_access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
    };

    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message ?? 'API Error');
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

/** POST /api/v1/auth/login — admin login */
export const adminLogin = (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; email: string; role: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) },
    );

// ─── Admin Overview / Analytics ───────────────────────────────────────────────

export interface AdminOverview {
    totalUsers: number;
    totalWorkers: number;
    totalBuyers: number;
    totalBookings: number;
    totalRevenue: number;
    pendingVerifications: number;
    openDisputes: number;
}

/** GET /api/v1/admin/overview */
export const getAdminOverview = () =>
    request<AdminOverview>('/admin/overview');

// ─── Users ────────────────────────────────────────────────────────────────────

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    deletedAt?: string;
}

/** GET /api/v1/admin/users */
export const getAdminUsers = () =>
    request<AdminUser[]>('/admin/users');

/** PATCH /api/v1/admin/users/:id/role */
export const updateUserRole = (id: string, role: string) =>
    request<{ message: string }>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface AdminTransaction {
    id: string;
    bookingId: string;
    amount: number;
    commission: number;
    payoutStatus: string;
    gatewayRef?: string;
    createdAt: string;
}

/** GET /api/v1/admin/transactions */
export const getAdminTransactions = () =>
    request<AdminTransaction[]>('/admin/transactions');

// ─── Payments (Escrow Actions) ────────────────────────────────────────────────

/** POST /api/v1/payments/hold */
export const holdEscrow = (bookingId: string) =>
    request<{ success: boolean }>('/payments/hold', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
        headers: { 'idempotency-key': `hold-${bookingId}-${Date.now()}` },
    });

/** POST /api/v1/payments/release */
export const releaseEscrow = (bookingId: string) =>
    request<{ success: boolean }>('/payments/release', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
        headers: { 'idempotency-key': `release-${bookingId}-${Date.now()}` },
    });

/** POST /api/v1/payments/refund */
export const refundEscrow = (bookingId: string) =>
    request<{ success: boolean }>('/payments/refund', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
        headers: { 'idempotency-key': `refund-${bookingId}-${Date.now()}` },
    });
