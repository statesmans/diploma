import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ImageSetService } from '../../../services/image-set.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-image-set-modal',
  templateUrl: './add-image-set-modal.component.html',
  styleUrl: './add-image-set-modal.component.scss'
})
export class AddImageSetModalComponent {
  private editMode = false;

  private name = new FormControl('', [Validators.required, Validators.maxLength(64)]);

  constructor(
    private imageSetService: ImageSetService,
    private modal: NgbActiveModal
  ) {}
  async createImageSet() {
    
    await this.imageSetService.create({name: this.name.value!});

    this.modal.close(true);
  }
}
