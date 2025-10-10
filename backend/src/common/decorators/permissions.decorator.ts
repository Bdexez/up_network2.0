import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (
  moduleName: string,
  resourceName: string,
  actionName: string,
) =>
  SetMetadata('permission', {
    moduleName,
    resourceName,
    actionName,
  });
