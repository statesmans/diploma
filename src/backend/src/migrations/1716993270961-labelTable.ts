import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class LabelTable1716993270961 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'label',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'image_id',
                    type: 'int',
                    isNullable: false,
                },
                {
                    name: 'model_uuid',
                    type: 'varchar',
                    length: '36',
                    isNullable: true,
                },
                {
                    name: 'confidence',
                    type: 'float',
                    isNullable: true,
                },
                {
                    name: 'classification',
                    type: 'int',
                    isNullable: true,
                },
                {
                    name: 'defect_class_id',
                    type: 'int',
                    isNullable: true,
                },
                {
                    name: 'label_data',
                    type: 'json',
                    isNullable: true,
                },
                {
                    name: 'type',
                    type: 'integer',
                    isNullable: true,
                },
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('label');
    }

}
