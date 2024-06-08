import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class FileTable1716982483146 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'file',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'filename',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'ref_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'size',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'content_type',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },

                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },  
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}