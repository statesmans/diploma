import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ImageTable1717159365648 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'image',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'uuid_file',
                    type: 'varchar',
                    length: '255',
                    isNullable: false
                },
                {
                    name: 'filename',
                    type: 'varchar',
                    length: '255',
                    isNullable: true
                },
                {
                    name: 'file_type',
                    type: 'varchar',
                    length: '255',
                    isNullable: true
                },
                {
                    name: 'file_size',
                    type: 'int',
                    isNullable: true,
                    default: '0'
                },
                {
                    name: 'image_set_id',
                    type: 'int',
                    isNullable: true
                },
                {
                    name: 'width',
                    type: 'int',
                    isNullable: true
                },
                {
                    name: 'height',
                    type: 'int',
                    isNullable: true
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()',
                },
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('image');
    }
}
