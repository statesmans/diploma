import { LabelEntity } from 'src/label/label.entity';
import { ModelEntity } from 'src/models/models.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, } from 'typeorm';

@Entity({ name: `image` })
export class ImageEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    uuidFile!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    filename!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    fileType!: string;

    @Column({ type: 'integer', nullable: true, default: () => 0 })
    fileSize!: number;

    @Column({ type: 'integer', nullable: true })
    imageSetId!: number;

    @Column({ type: 'integer', nullable: false })
    width!: number;

    @Column({ type: 'integer', nullable: false })
    height!: number;

    @OneToMany(() => LabelEntity, label => label.Image)
    readonly Labels!: LabelEntity[];

    @OneToOne(() => LabelEntity, label => label.Image)
    ManualLabel!: LabelEntity;

    @Column({
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt!: Date;
}
