import { Component, Input, OnInit } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Image } from '../shared/interfaces';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageDataComponent } from '../image-data/image-data.component';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})
export class ImageComponent implements OnInit {
  @Input() image?: Image;

  imageUrl: string | null = null;
  
  constructor (
    private imageService: ImageService,
    private modal: NgbModal,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.image) {
      this.imageUrl = this.imageService.getImageUrl(this.image.filename, this.image.uuidFile);
    }
  }

  async openImageDataModal() {
    if (this.image) {
      const modal = this.modal.open(ImageDataComponent, {
        centered: true,
        windowClass: 'image-data-modal',
      });

      modal.componentInstance.image = this.image;

    }
  }

}
