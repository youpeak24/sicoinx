/** Up to two initials from a display name or email: "Jane Doe" → "JD", "admin123@x.com" → "A". */
export function initialsOf(nameOrEmail: string | null | undefined): string {
  const source = (nameOrEmail ?? '').trim();
  if (!source) return '?';
  const base = source.includes('@') ? source.split('@')[0]! : source;
  const words = base.split(/[\s._-]+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.length === 1 ? words[0]!.slice(0, 1) : words[0]!.slice(0, 1) + words[words.length - 1]!.slice(0, 1);
  return letters.toUpperCase();
}

/** "Good morning" / "Good afternoon" / "Good evening" for the given hour (0-23). */
export function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** First name for greetings. Falls back to the part of the email before "@". */
export function firstNameOf(nameOrEmail: string | null | undefined): string {
  const source = (nameOrEmail ?? '').trim();
  if (!source) return 'there';
  const base = source.includes('@') ? source.split('@')[0]! : source;
  const first = base.split(/\s+/)[0] ?? base;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

const STAFF_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  FINANCE_MANAGER: 'Finance Manager',
  CONTENT_EDITOR: 'Content Editor',
  SUPPORT_AGENT: 'Support Agent',
  SUPPORT_STAFF: 'Support Staff',
  READONLY_ANALYST: 'Analyst',
};

/** Label for staff roles; null for ordinary customers. */
export function staffRoleLabel(role: string | null | undefined): string | null {
  if (!role || role === 'USER') return null;
  return STAFF_LABELS[role] ?? role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
