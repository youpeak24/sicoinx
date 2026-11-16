const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "16 Nov 2026, 5:42 PM" in the device's local time zone. Returns "—" for bad input. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${hour12}:${minutes} ${suffix}`;
}

/** "0xabcdef123456…9876" */
export function shortHash(hash: string | null | undefined, head = 12, tail = 4): string {
  if (!hash) return '—';
  if (hash.length <= head + tail + 1) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

/** Masks all but the last 4 characters: "XXXXXXXX1234". */
export function maskId(value: string | null | undefined): string {
  if (!value) return '—';
  if (value.length <= 4) return value;
  return `${'X'.repeat(value.length - 4)}${value.slice(-4)}`;
}

const TX_LABELS: Record<string, string> = {
  BUY_COIN: 'Purchase',
  SELL_COIN: 'Sale',
  TRANSFER_OUT: 'Transfer sent',
  TRANSFER_IN: 'Transfer received',
  ECOSYSTEM_DEBIT: 'Ecosystem spend',
  ECOSYSTEM_CREDIT: 'Ecosystem credit',
  ADMIN_CREDIT: 'Admin credit',
  ADMIN_DEBIT: 'Admin debit',
  REFUND: 'Refund',
};

/** Turns "IN_PROGRESS" into "In progress". */
export function statusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function ticketTone(status: string): 'info' | 'warning' | 'success' | 'neutral' {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'warning';
    case 'RESOLVED':
      return 'success';
    default:
      return 'neutral';
  }
}

export function txTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Record';
  return TX_LABELS[type] ?? statusLabel(type);
}
