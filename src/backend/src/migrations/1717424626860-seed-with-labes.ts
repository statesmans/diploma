import { MigrationInterface, QueryRunner, Table } from "typeorm";

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
                    isNullable: false,
                },
            ]
        }));

        await queryRunner.query(`
            INSERT INTO defect_class (name) VALUES
            ('OK'), 
            ('Scratch'),
            ('Oil leak'),
            ;
        `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
