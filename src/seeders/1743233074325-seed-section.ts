import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedSection1743233074325 implements MigrationInterface {
    name = 'SeedSection1743233074325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          INSERT INTO section (name) VALUES 
            ('user'),
            ('role'),
            ('availability');
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DELETE FROM section');
      }

}
