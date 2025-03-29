import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedPermission1743233106142 implements MigrationInterface {
    name = 'SeedPermission1743233106142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          INSERT INTO permission (name) VALUES 
            ('create'),
            ('edit'),
            ('view'),
            ('delete');
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DELETE FROM permission');
      }

}
