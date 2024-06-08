import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, } from 'typeorm';

@Entity({ name: `defect_class` })
export class DefectClassEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name!: string;

}
