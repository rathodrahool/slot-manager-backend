import { SetMetadata } from '@nestjs/common';

export const Permission = (
  permission: 'create' | 'edit' | 'view' | 'delete',
) => SetMetadata('permission', permission);

export const Section = (
  sectionName:
    | 'user'
    | 'section'
    | 'role'
    | 'permission',
) => SetMetadata('section', sectionName);
