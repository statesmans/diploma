import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

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

        await queryRunner.createForeignKey(
            'label',
            new TableForeignKey({
                columnNames: ['image_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'image',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            })
        );

        await queryRunner.createIndex(
            'label',
            new TableIndex({
                columnNames: ['image_id', 'type', 'model_uuid'],
                name: 'image_id_type_model_uuid_index',
                isUnique: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('label');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('image_id') !== -1);
        await queryRunner.dropForeignKey('label', foreignKey);
        await queryRunner.dropIndex('label', 'image_id_type_model_uuid_index');
        await queryRunner.dropTable('label');
    }

}