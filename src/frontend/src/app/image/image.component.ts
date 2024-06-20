import { SelectionService } from './../services/selection.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Image, Label, LabelClassification } from '../shared/interfaces';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageDataModalComponent } from '../image-data-modal/image-data-modal.component';
import { LabelService } from '../services/label.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})
export class ImageComponent implements OnInit {
  @Input() image!: Image;
  @Output() onImageLabelUpdate = new EventEmitter();

  imageUrl: string | null = null;
  isSelected = false;
  labelClassification?: LabelClassification;
  LabelClassification = LabelClassification;

  constructor (
    private imageService: ImageService,
    private labelService: LabelService,
    private route: ActivatedRoute,
    private modal: NgbModal,
    private selectionService: SelectionService,
  ) {}

  toggleImageSelection(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.selectionService.toggleImageSelection(checkbox.checked, this.image.id);
  }

  async ngOnInit(): Promise<void> {
    this.imageUrl = this.imageService.getImageUrl(this.image.uuidFile);

    this.updateLabel()

    this.selectionService.isAllSelected.subscribe(isAllSelected => {

      if (isAllSelected) {
        this.isSelected = true;
      } else {
        this.isSelected = false;

      }
    })
  }

  async openImageDataModal() {
    if (this.image) {
      const modal = this.modal.open(ImageDataModalComponent, {
        centered: true,
        windowClass: 'image-data-modal',
      });

      modal.componentInstance.image = this.image;
      modal.componentInstance.imageSetId = this.route.snapshot.paramMap.get('id');

      
      modal.closed.subscribe(_ => this.updateLabel())
    }
  }

  async updateLabel() {
    const manualLabel = await this.labelService.getManualByImageId(this.image.id);

    this.labelClassification = manualLabel.classification;
  }
}
