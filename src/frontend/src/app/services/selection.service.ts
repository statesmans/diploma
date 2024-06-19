import { Injectable } from "@angular/core";
import { ImageService } from "./image.service";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class SelectionService {
    isAllSelected = new BehaviorSubject<boolean>(false);

    selectedImages = new BehaviorSubject<number[]>([]);


    constructor(
        private imageService: ImageService,
    ) {}

    async deleteSelectedImages(imageSetId: number) {
        if (this.isAllSelected.value) {
            await this.imageService.deleteImageBulk(['all'], imageSetId!); 
        } else {
            await this.imageService.deleteImageBulk(this.selectedImages.value, imageSetId!);
        }
        this.selectedImages.next([]);
        this.isAllSelected.next(false);
    }

    setSelectedAll(value: boolean) {
        if (value) {
            this.selectedImages.next([]);
        }
        this.isAllSelected.next(value);
    }

    toggleImageSelection(isSelected: boolean,  imageId: number) {
        if (isSelected) {
            this.selectedImages.next([
                ...this.selectedImages.value,
                imageId,
            ])
        } else {
            this.selectedImages.next(
                this.selectedImages.value.filter(id => id !== imageId)
            )
            this.isAllSelected.next(false)
        }
    }
}