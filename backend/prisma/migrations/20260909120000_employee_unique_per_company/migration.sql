-- Un compte applicatif peut être salarié de plusieurs sociétés du même ERP :
-- l'unicité porte sur le couple (société, compte) et non sur le compte seul.
DROP INDEX "Employee_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_userId_key" ON "Employee"("companyId", "userId");
