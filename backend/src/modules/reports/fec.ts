/**
 * Fichier des Écritures Comptables (FEC).
 *
 * Format imposé par l'article A47 A-1 du Livre des procédures fiscales :
 * 18 colonnes, séparateur tabulation, encodage UTF-8, une ligne d'en-tête.
 * L'ordre des colonnes est normatif — ne pas le réarranger.
 */
export const FEC_COLUMNS = [
  'JournalCode',
  'JournalLib',
  'EcritureNum',
  'EcritureDate',
  'CompteNum',
  'CompteLib',
  'CompAuxNum',
  'CompAuxLib',
  'PieceRef',
  'PieceDate',
  'EcritureLib',
  'Debit',
  'Credit',
  'EcritureLet',
  'DateLet',
  'ValidDate',
  'Montantdevise',
  'Idevise',
] as const;

export interface FecEntry {
  journalCode: string;
  journalLabel: string;
  entryNumber: string;
  entryDate: Date;
  accountNumber: string;
  accountLabel: string;
  auxAccountNumber?: string;
  auxAccountLabel?: string;
  pieceRef: string;
  pieceDate: Date;
  label: string;
  debit: number;
  credit: number;
  /** Montant en devise d'origine, si le document n'est pas en devise société. */
  foreignAmount?: number;
  foreignCurrency?: string;
}

/**
 * Plan comptable minimal utilisé pour la génération.
 * Volontairement explicite : un vrai paramétrage comptable se configure,
 * mais ces comptes sont ceux du plan général français pour une PME de service.
 */
export const ACCOUNTS = {
  customer: { number: '411000', label: 'Clients' },
  supplier: { number: '401000', label: 'Fournisseurs' },
  sales: { number: '706000', label: 'Prestations de services' },
  purchases: { number: '607000', label: 'Achats de marchandises' },
  vatCollected: { number: '445710', label: 'TVA collectée' },
  vatDeductible: { number: '445660', label: 'TVA déductible' },
  bank: { number: '512000', label: 'Banque' },
} as const;

/** Date au format AAAAMMJJ exigé par le FEC. */
export function fecDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/** Montant au format FEC : deux décimales, virgule décimale, jamais de séparateur de milliers. */
export function fecAmount(value: number): string {
  return value === 0 ? '0,00' : value.toFixed(2).replace('.', ',');
}

/**
 * Neutralise les caractères qui casseraient le format : la tabulation sépare
 * les colonnes, le saut de ligne sépare les écritures.
 */
function sanitize(value: string | undefined): string {
  return (value ?? '').replace(/[\t\r\n]+/g, ' ').trim();
}

export function toFecLine(entry: FecEntry): string {
  return [
    sanitize(entry.journalCode),
    sanitize(entry.journalLabel),
    sanitize(entry.entryNumber),
    fecDate(entry.entryDate),
    sanitize(entry.accountNumber),
    sanitize(entry.accountLabel),
    sanitize(entry.auxAccountNumber),
    sanitize(entry.auxAccountLabel),
    sanitize(entry.pieceRef),
    fecDate(entry.pieceDate),
    sanitize(entry.label),
    fecAmount(entry.debit),
    fecAmount(entry.credit),
    '', // EcritureLet : lettrage, non géré
    '', // DateLet
    fecDate(entry.entryDate), // ValidDate
    entry.foreignAmount !== undefined ? fecAmount(entry.foreignAmount) : '',
    sanitize(entry.foreignCurrency),
  ].join('\t');
}

export function buildFecFile(entries: FecEntry[]): string {
  return (
    [FEC_COLUMNS.join('\t'), ...entries.map(toFecLine)].join('\r\n') + '\r\n'
  );
}

/**
 * Contrôle d'équilibre : en partie double, la somme des débits égale celle des
 * crédits. Un écart signale une erreur de génération, pas une donnée douteuse.
 */
export function checkBalance(entries: FecEntry[]): {
  debit: number;
  credit: number;
  balanced: boolean;
} {
  const debit = round2(entries.reduce((acc, e) => acc + e.debit, 0));
  const credit = round2(entries.reduce((acc, e) => acc + e.credit, 0));
  return { debit, credit, balanced: Math.abs(debit - credit) < 0.01 };
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
