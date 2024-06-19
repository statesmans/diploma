
import { ImageSetEntity } from 'src/image-set/image-set.entity';
import { LabelEntity } from 'src/label/label.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, Generated, PrimaryColumn } from 'typeorm';

@Entity({ name: `model` })
export class ModelEntity {
  @PrimaryColumn()
  @Generated('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  trainingSet!: number | null;

  @Column({ type: 'simple-json', nullable: true })
  hyperparameter!: NonNullable<unknown> | null;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;


  @Column({ type: 'text', nullable: true })
  trainingResultFileUuid!: string | null;
  
  @ManyToOne(() => ImageSetEntity, imageSet => imageSet.trainingSetModels, {
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'training_set', referencedColumnName: 'id' }])
  readonly TrainingSet!: ImageSetEntity;

  @OneToMany(() => ImageSetEntity, imageSet => imageSet.selectedModel)
  readonly imageSets!: ImageSetEntity[];

  @OneToMany(() => LabelEntity, label => label.Model)
  Labels: LabelEntity[];

  @Column({ type: 'text', nullable: true })
  trainingResultFileName!: string;
}
