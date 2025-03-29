export class UpdateRoleDto {
  name: string;
  role_section_permission: {
    id: string;
    has_access: boolean;
  }[];
}
