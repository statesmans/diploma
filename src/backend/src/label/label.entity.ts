import { ImageEntity } from 'src/image/image.entity';
import { LabelInterface } from '../lib/label';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, } from 'typeorm';

export enum LabelClassification {
    Unclassified = 0,
    Ok = 1,
    Defect = 2,
}

export enum LabelType {
    Manual = 1,
    Inferred = 2,
}



@Entity({ name: `label` })
export class LabelEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'integer', nullable: false })
    imageId!: number;

    @Column({ type: 'float', nullable: true })
    confidence!: number;

    @Column({ type: 'integer', nullable: true })
    classification!: LabelClassification;

    // only OK or Defect
    @Column({ type: 'integer', nullable: true })
    defectClassId!: number | null;

    @Column({ type: 'simple-json', nullable: true })
    labelData!: LabelInterface;

    @Column({ type: 'integer', nullable: true })
    type!: LabelType;

    @ManyToOne(() => ImageEntity, image => image.Labels, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'image_id', referencedColumnName: 'id' }])
    readonly Image!: ImageEntity;
}