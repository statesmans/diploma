import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ImageSet1715522613529 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const table = 

        queryRunner.createTable(
            new Table({
                name: "model",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        length: '255',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid'
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                   
                    {
                        name: 'training_set',
                        type: 'integer',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'training_result_file_uuid',
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: 'hyperparameter',
                        type: 'json',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        columnNames: ['training_set'],
                        referencedColumnNames: ['id'],
                        referencedTableName: `image_set`,
                        onDelete: 'SET NULL',
                        onUpdate: 'CASCADE',
                    }),
                ]
            })
        )

        await queryRunner.createForeignKey(
            `image_set`,
            new TableForeignKey({
                columnNames: ['selected_model'],
                referencedColumnNames: ['id'],
                referencedTableName: `model`,
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
