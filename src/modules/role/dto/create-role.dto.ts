export class CreateRoleDto {
  name: string;
  section: { id: string; permission: { id: string; has_access: boolean }[] }[];
}
