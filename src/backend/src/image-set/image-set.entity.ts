import { ModelEntity } from 'src/models/models.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, } from 'typeorm';


@Entity({ name: `image_set` })
export class ImageSetEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({  type: 'varchar' })
    selectedModel!: string;

    @Column({  type: 'int' })
    imagesCount!: number;

    @ManyToOne(() => ModelEntity, model => model.imageSets, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'selected_model', referencedColumnName: 'id' }])
    readonly SelectedModel!: ModelEntity;

    @OneToMany(() => ModelEntity, model => model.trainingSet)
    readonly trainingSetModels!: ModelEntity[];
}
