import type { gmail_v1 } from 'googleapis';

export interface ParsedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
  htmlBody: string;
  plainTextBody: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }>;
}

export class GmailParser {
  static parseMessage(message: gmail_v1.Schema$Message): ParsedEmail {
    const headers = message.payload?.headers || [];

    const getHeader = (name: string): string => {
      const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };

    const from = getHeader('From');
    const fromEmail = this.extractEmail(from);
    const fromName = this.extractName(from);

    const labels = message.labelIds || [];
    const isRead = !labels.includes('UNREAD');
    const isStarred = labels.includes('STARRED');

    const { plainText, html, attachments } = this.extractBody(message.payload);

    return {
      id: message.id!,
      threadId: message.threadId!,
      subject: getHeader('Subject'),
      from: fromName || fromEmail,
      fromEmail: fromEmail,
      to: getHeader('To'),
      date: getHeader('Date'),
      snippet: message.snippet || '',
      body: plainText || html || '',
      htmlBody: html,
      plainTextBody: plainText,
      labels,
      isRead,
      isStarred,
      hasAttachments: attachments.length > 0,
      attachments,
    };
  }

  private static extractEmail(from: string): string {
    const match = from.match(/<(.+?)>/);
    return match ? match[1] : from;
  }

  private static extractName(from: string): string {
    const match = from.match(/^([^<]+)</);
    return match ? match[1].trim().replace(/"/g, '') : '';
  }

  private static extractBody(
    payload: gmail_v1.Schema$MessagePart | undefined
  ): {
    plainText: string;
    html: string;
    attachments: Array<{
      filename: string;
      mimeType: string;
      size: number;
      attachmentId: string;
    }>;
  } {
    let plainText = '';
    let html = '';
    const attachments: Array<{
      filename: string;
      mimeType: string;
      size: number;
      attachmentId: string;
    }> = [];

    if (!payload) {
      return { plainText, html, attachments };
    }

    const extractParts = (part: gmail_v1.Schema$MessagePart) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plainText += this.decodeBase64(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html += this.decodeBase64(part.body.data);
      } else if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType || 'application/octet-stream',
          size: part.body.size || 0,
          attachmentId: part.body.attachmentId,
        });
      }

      if (part.parts) {
        part.parts.forEach(extractParts);
      }
    };

    extractParts(payload);

    return { plainText, html, attachments };
  }

  private static decodeBase64(encodedString: string): string {
    try {
      const sanitized = encodedString.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(sanitized, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  }

  static encodeBase64(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  static createRawEmail(options: {
    to: string;
    from: string;
    subject: string;
    body: string;
    html?: string;
    inReplyTo?: string;
    references?: string;
  }): string {
    const { to, from, subject, body, html, inReplyTo, references } = options;

    let email = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
    ];

    if (inReplyTo) {
      email.push(`In-Reply-To: ${inReplyTo}`);
    }

    if (references) {
      email.push(`References: ${references}`);
    }

    if (html) {
      email.push('Content-Type: multipart/alternative; boundary="boundary123"');
      email.push('');
      email.push('--boundary123');
      email.push('Content-Type: text/plain; charset="UTF-8"');
      email.push('');
      email.push(body);
      email.push('');
      email.push('--boundary123');
      email.push('Content-Type: text/html; charset="UTF-8"');
      email.push('');
      email.push(html);
      email.push('');
      email.push('--boundary123--');
    } else {
      email.push('Content-Type: text/plain; charset="UTF-8"');
      email.push('');
      email.push(body);
    }

    return this.encodeBase64(email.join('\r\n'));
  }

  static stripHtmlTags(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  static getEmailPreview(message: ParsedEmail, maxLength: number = 200): string {
    const body = message.plainTextBody || this.stripHtmlTags(message.htmlBody);
    return this.truncateText(body, maxLength);
  }
}
