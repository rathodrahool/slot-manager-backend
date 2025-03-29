import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedLabelIndex1743233157129 implements MigrationInterface {
    name = 'SeedLabelIndex1743233157129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update indices for the Section table based on priority
        await queryRunner.query(`
          UPDATE section
          SET 
            index = CASE

              WHEN LOWER(name) = 'user' THEN 1
              WHEN LOWER(name) = 'availability' THEN 2
              WHEN LOWER(name) = 'role' THEN 3
              ELSE NULL
            END,
            label = CASE
              WHEN LOWER(name) = 'availability' THEN 'Availability'
              WHEN LOWER(name) = 'user' THEN 'User'
              WHEN LOWER(name) = 'role' THEN 'Role'
              ELSE label
            END;
        `);
    
        // Update indices for the Permission table based on priority
        await queryRunner.query(`
          UPDATE permission
          SET index = CASE
            WHEN LOWER(name) = 'create' THEN 1
            WHEN LOWER(name) = 'view' THEN 2
            WHEN LOWER(name) = 'edit' THEN 3
            WHEN LOWER(name) = 'delete' THEN 4
            ELSE NULL
          END;
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        // Reset indices for the Section table
        await queryRunner.query('UPDATE section SET index = NULL;');
    
        // Reset indices for the Permission table
        await queryRunner.query('UPDATE permission SET index = NULL;');
      }

}
