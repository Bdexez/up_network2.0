import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  attachments?: MailAttachment[];
}

export interface MailResult {
  delivered: boolean;
  /** `smtp` quand un serveur est configuré, `log` sinon. */
  transport: 'smtp' | 'log';
  messageId?: string;
}

/**
 * Envoi d'e-mails.
 *
 * Sans configuration SMTP, le message est journalisé au lieu d'être envoyé et
 * la réponse le dit (`transport: 'log'`). C'est délibéré : en développement,
 * une facture ne doit pas partir chez un vrai client, et l'API ne doit pas
 * échouer pour autant. En production, renseigner SMTP_HOST suffit à activer
 * l'envoi réel.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (!host) return;

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  async send(message: MailMessage): Promise<MailResult> {
    const from = process.env.SMTP_FROM ?? 'no-reply@up-network.local';

    if (!this.transporter) {
      this.logger.log(
        `[SMTP non configuré] À : ${message.to} — « ${message.subject} »` +
          (message.attachments?.length
            ? ` (${message.attachments.length} pièce(s) jointe(s))`
            : ''),
      );
      return { delivered: false, transport: 'log' };
    }

    const info = (await this.transporter.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      attachments: message.attachments,
    })) as { messageId?: string };

    return { delivered: true, transport: 'smtp', messageId: info.messageId };
  }
}
