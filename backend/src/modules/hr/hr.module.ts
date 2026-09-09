import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

/** Ressources humaines : employés, congés et notes de frais. */
@Module({
  controllers: [EmployeesController, LeaveController, ExpensesController],
  providers: [EmployeesService, LeaveService, ExpensesService],
})
export class HrModule {}
