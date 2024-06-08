import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class ImageSet1715522513529 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const table = 

        queryRunner.createTable(
            new Table({
                name: "image_set",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment'
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "selected_model",
                        type: "varchar",
                        length: "36",
                        isNullable: true,
                    },
                    {
                        name: "images_count",
                        type: "int",
                        default: 0,
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
