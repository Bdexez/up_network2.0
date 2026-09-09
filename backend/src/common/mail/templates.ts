/**
 * Corps des messages sortants. Regroupés ici pour qu'un changement de ton ou
 * de mentions légales se fasse en un seul endroit.
 */

export interface InvoiceMailContext {
  companyName: string;
  partnerName: string;
  ref: string;
  amount: string;
  dueDate: string | null;
}

export function invoiceEmail(context: InvoiceMailContext) {
  return {
    subject: `Facture ${context.ref} — ${context.companyName}`,
    text: [
      `Bonjour ${context.partnerName},`,
      '',
      `Vous trouverez ci-joint la facture ${context.ref} d'un montant de ${context.amount}.`,
      context.dueDate
        ? `Elle est payable au plus tard le ${context.dueDate}.`
        : '',
      '',
      'Nous restons à votre disposition pour toute question.',
      '',
      'Cordialement,',
      context.companyName,
    ]
      .filter((line) => line !== '')
      .join('\n'),
  };
}

export interface ReminderMailContext extends InvoiceMailContext {
  /** Niveau de relance déjà atteint : le ton se durcit progressivement. */
  level: number;
  daysOverdue: number;
}

export function reminderEmail(context: ReminderMailContext) {
  const opening =
    context.level <= 1
      ? 'Sauf erreur de notre part, la facture ci-dessous reste impayée.'
      : context.level === 2
        ? 'Malgré notre précédent rappel, la facture ci-dessous demeure impayée.'
        : 'En dépit de nos relances, cette facture reste à ce jour non réglée.';

  const closing =
    context.level >= 3
      ? 'À défaut de règlement sous huit jours, nous serons contraints d’engager une procédure de recouvrement.'
      : 'Si le règlement a été effectué entre-temps, merci de ne pas tenir compte de ce message.';

  return {
    subject: `Relance ${context.level} — facture ${context.ref}`,
    text: [
      `Bonjour ${context.partnerName},`,
      '',
      opening,
      '',
      `Facture : ${context.ref}`,
      `Montant restant dû : ${context.amount}`,
      `Échéance dépassée de ${context.daysOverdue} jour(s).`,
      '',
      closing,
      '',
      'Cordialement,',
      context.companyName,
    ].join('\n'),
  };
}
