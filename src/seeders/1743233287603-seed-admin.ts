import { MigrationInterface, QueryRunner, Repository } from 'typeorm';
import { hash } from 'bcrypt';

export class SeedAdmin1743233287603 implements MigrationInterface {
    name = 'SeedAdmin1743233287603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const roleRepository: Repository<any> =
          queryRunner.manager.getRepository('role');
        const sectionRepository: Repository<any> =
          queryRunner.manager.getRepository('section');
        const permissionRepository: Repository<any> =
          queryRunner.manager.getRepository('permission');
        const roleSectionPermissionRepository: Repository<any> =
          queryRunner.manager.getRepository('role_section_permission');
        const userRepository: Repository<any> =
          queryRunner.manager.getRepository('user');
    
        // Create default super admin role
        const role = await roleRepository.save({
          name: 'admin',
        });
    
        // Fetch all sections
        const sections = await sectionRepository.find();
    
        // Grant all permissions for all sections to the Super Admin role
        for (const section of sections) {
          const permissions = await permissionRepository.find();
    
          for (const permission of permissions) {
            await roleSectionPermissionRepository.save({
              role: { id: role.id },
              section: { id: section.id },
              permission: { id: permission.id },
              has_access: true,
            });
          }
        }
    
        // Create default super admin use
        const hashedPassword = await hash('Admin@123', 10);
        await userRepository.save({
          name: 'admin',
          email: 'admin@slotmanager.com',
          password: hashedPassword,
          role: { id: role.id }
        });
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        const roleRepository: Repository<any> =
          queryRunner.manager.getRepository('role');
        const roleSectionPermissionRepository: Repository<any> =
          queryRunner.manager.getRepository('role_section_permission');
    
        // Remove super admin user
        await queryRunner.query(
          `DELETE FROM "user" WHERE email = 'admin@slotmanager.com'`,
        );
    
        // Remove super admin role permissions
        const role = await roleRepository.findOne({
          where: { name: 'Admin' },
        });
        if (role) {
          await roleSectionPermissionRepository.delete({ role_id: role.id });
          await roleRepository.delete({ id: role.id });
        }
      }
    }
    