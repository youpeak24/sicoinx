export type Device = 'IOS' | 'ANDROID' | 'WEB' | 'HARDWARE';
export type Category = 'user' | 'hardware' | 'agentic';
export type SortId = 'featured' | 'name';

export interface Wallet {
  id: string;
  name: string;
  category: Category;
  kind: string;
  tagline: string;
  summary: string;
  highlights: string[];
  bestFor: string;
  devices: Device[];
  capabilities: string[];
  website: string;
  evm?: boolean;
  caveat?: string;
}

export interface WalletFilters {
  q: string;
  category: 'all' | Category;
  device: 'ALL' | Device;
  capability: 'ALL' | string;
  sort: SortId;
}

export const DIRECTORY_UPDATED: string;
export const DEVICES: readonly Device[];
export const DEVICE_LABELS: Record<Device, string>;
export const CATEGORIES: { id: 'all' | Category; label: string }[];
export const CAPABILITIES: string[];
export const SORTS: { id: SortId; label: string }[];
export const CATEGORY_INFO: Record<Category, { label: string; blurb: string }>;
export const WALLETS: Wallet[];
export const DEFAULT_FILTERS: WalletFilters;

export function getWallet(id: string): Wallet | undefined;
export function relatedWallets(id: string, limit?: number): Wallet[];
export function resolveCompare(idsParam: string | null | undefined, limit?: number): Wallet[];
export function filterWallets(list: Wallet[], filters?: Partial<WalletFilters>): Wallet[];
export function parseFilters(search: string): WalletFilters;
export function serializeFilters(filters: Partial<WalletFilters>): string;
export function directoryStats(list?: Wallet[]): {
  total: number;
  user: number;
  hardware: number;
  agentic: number;
  byDevice: Record<Device, number>;
};
export function walletSeo(w: Wallet): {
  title: string;
  description: string;
  h1: string;
  lead: string;
  points: string[];
  breadcrumb: string;
};
