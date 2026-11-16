export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: string;
  linkPreview?: string;
}

// In-memory development mail inbox
const devOutbox: OutboxEmail[] = [];

export async function sendEmail({
  to,
  subject,
  html,
  text,
  linkPreview,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  linkPreview?: string;
}): Promise<boolean> {
  const emailRecord: OutboxEmail = {
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    to,
    subject,
    html,
    text,
    sentAt: new Date().toISOString(),
    linkPreview,
  };

  devOutbox.unshift(emailRecord);
  if (devOutbox.length > 50) {
    devOutbox.pop();
  }

  console.log(`[DevMailer] Email dispatched to <${to}>: "${subject}"`);
  if (linkPreview) {
    console.log(`[DevMailer] Action Link Preview: ${linkPreview}`);
  }

  return true;
}

export function getDevOutbox(): OutboxEmail[] {
  return [...devOutbox];
}

export function clearDevOutbox(): void {
  devOutbox.length = 0;
}
