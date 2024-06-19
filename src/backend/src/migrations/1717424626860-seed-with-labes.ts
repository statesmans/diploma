import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class SeedWithLabes1717424626860 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'defect_class',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true, 
                    generationStrategy: 'increment',
                },
                {
                    name: 'name',
                    type: 'char(255)',
                    isUnique: true,
                    isNullable: true,
                },
                {
                    name: 'created_at', 
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'deleted_at',
                    type: 'timestamp',
                    isNullable: true,
                    default: null,
                },
            ]
        }));

        await queryRunner.query(`
            INSERT INTO defect_class (name) VALUES
            ('OK'), 
            ('Defect');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX "UQ_defect_class_name"');
        await queryRunner.dropTable('defect_class');
    }
}
