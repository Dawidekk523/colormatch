import { AwsClient } from 'aws4fetch';

type Addressee = string | string[];

/** The subset of Resend's `emails.send` payload colormatch actually uses. */
export interface SendEmailInput {
  from: string;
  to: Addressee;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: Addressee;
}

export interface SendEmailResult {
  sent: boolean;
  id?: string;
  reason?: string;
}

const list = (value: Addressee | undefined): string[] | undefined =>
  value === undefined ? undefined : Array.isArray(value) ? value : [value];

/**
 * Sends through SES, falling back to Resend when SES is unconfigured or fails.
 * The shape mirrors the `ses-resend-compat` module the other apps use, so the
 * call sites look the same; the implementation is REST rather than the AWS SDK
 * because this runs on Workers, where the SDK does not belong.
 */
export async function sendEmail(env: Env, input: SendEmailInput): Promise<SendEmailResult> {
  const viaSes = await sendViaSes(env, input);
  if (viaSes.sent || viaSes.reason === 'rejected') return viaSes;
  const viaResend = await sendViaResend(env, input);
  if (viaResend.sent) return viaResend;
  return { sent: false, reason: viaSes.reason ?? viaResend.reason ?? 'email-not-configured' };
}

async function sendViaSes(env: Env, input: SendEmailInput): Promise<SendEmailResult> {
  const region = env.EMAIL_SES_REGION ?? 'eu-west-1';
  const accessKeyId = env.EMAIL_SES_ACCESS_KEY_ID;
  const secretAccessKey = env.EMAIL_SES_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) return { sent: false, reason: 'ses-not-configured' };

  const client = new AwsClient({ accessKeyId, secretAccessKey, service: 'ses', region });
  const body = {
    FromEmailAddress: input.from,
    Destination: { ToAddresses: list(input.to) },
    ReplyToAddresses: list(input.replyTo),
    Content: {
      Simple: {
        Subject: { Data: input.subject, Charset: 'UTF-8' },
        Body: {
          ...(input.html ? { Html: { Data: input.html, Charset: 'UTF-8' } } : {}),
          ...(input.text ? { Text: { Data: input.text, Charset: 'UTF-8' } } : {}),
        },
      },
    },
    ...(env.EMAIL_SES_CONFIGURATION_SET ? { ConfigurationSetName: env.EMAIL_SES_CONFIGURATION_SET } : {}),
  };

  try {
    const response = await client.fetch(`https://email.${region}.amazonaws.com/v2/email/outbound-emails`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { MessageId?: string };
      return { sent: true, id: payload.MessageId };
    }
    // A 4xx is SES telling us the message itself is wrong — a bad sender, an
    // unverified identity, a suppressed address. Retrying it through Resend
    // would only send a second broken message.
    if (response.status >= 400 && response.status < 500) return { sent: false, reason: 'rejected' };
    return { sent: false, reason: 'ses-error' };
  } catch {
    return { sent: false, reason: 'ses-error' };
  }
}

async function sendViaResend(env: Env, input: SendEmailInput): Promise<SendEmailResult> {
  if (!env.RESEND_API_KEY) return { sent: false, reason: 'resend-not-configured' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: input.from,
        to: list(input.to),
        reply_to: list(input.replyTo),
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!response.ok) return { sent: false, reason: 'resend-error' };
    const payload = (await response.json().catch(() => ({}))) as { id?: string };
    return { sent: true, id: payload.id };
  } catch {
    return { sent: false, reason: 'resend-error' };
  }
}

/** The address every message is sent from, however it ends up being delivered. */
export const sender = (env: Env): string | null => env.EMAIL_FROM ?? env.RESEND_FROM ?? null;
