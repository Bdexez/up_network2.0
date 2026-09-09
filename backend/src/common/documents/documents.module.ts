import { Global, Module } from '@nestjs/common';
import { DocumentLinesService } from './lines.service';
import { DocumentPdfService } from './document-pdf.service';
import { NumberingService } from './numbering.service';

/**
 * Briques partagées par tous les documents commerciaux.
 * Global : la numérotation est utilisée par cinq modules.
 */
@Global()
@Module({
  providers: [NumberingService, DocumentLinesService, DocumentPdfService],
  exports: [NumberingService, DocumentLinesService, DocumentPdfService],
})
export class DocumentsModule {}
