/*
  Warnings:

  - A unique constraint covering the columns `[moduleName,resourceName,actionName]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Permission_moduleName_resourceName_actionName_key" ON "Permission"("moduleName", "resourceName", "actionName");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_companyId_key" ON "Role"("name", "companyId");
