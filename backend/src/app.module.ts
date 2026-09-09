import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { RolesModule } from './modules/auth/roles/roles.module';
import { PartnersModule } from './modules/partners/partners.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { CrmModule } from './modules/crm/crm.module';
import { DocumentsModule } from './common/documents/documents.module';
import { MailModule } from './common/mail/mail.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { StockModule } from './modules/stock/stock.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { HrModule } from './modules/hr/hr.module';

@Module({
  imports: [
    PrismaModule,
    DocumentsModule,
    MailModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CompaniesModule,
    PartnersModule,
    ProductsModule,
    StockModule,
    QuotesModule,
    OrdersModule,
    InvoicesModule,
    PurchasesModule,
    CrmModule,
    DashboardModule,
    ReportsModule,
    AttachmentsModule,
    ProjectsModule,
    HrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
