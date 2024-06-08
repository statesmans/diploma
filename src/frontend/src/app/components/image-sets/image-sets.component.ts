import { Component, OnInit } from '@angular/core';
import { ImageSet } from '../../shared/interfaces';

import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ImageSetService } from '../../services/image-set.service';
import { AddImageSetModalComponent } from './add-image-set-modal/add-image-set-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../libs/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-image-sets',
  templateUrl: './image-sets.component.html',
  styleUrl: './image-sets.component.scss'
})
export class ImageSetsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'selectedModel', 'controls'];


  dataSource: MatTableDataSource<ImageSet> = new MatTableDataSource([{} as ImageSet]);

  constructor (
    private imageSetService: ImageSetService,
    private modal: NgbModal,
    private router: Router,
  ) {}

  async openImageSet(id: number) {
    this.router.navigate(['/image-set/', id]);
  }

  async ngOnInit(): Promise<void> {
    this.updateImageSets()

  }

  async openAddModal() {
    const modal = this.modal.open(AddImageSetModalComponent, {
      centered: true,
    });

    await modal.result;

    this.updateImageSets();
  }

  async openEditModal(id: number) {
    const modal = this.modal.open(AddImageSetModalComponent, {
      centered: true,
    });

    modal.componentInstance.editMode = true;

    await modal.result;

    this.updateImageSets();
  }

  async openDeleteModal(modelId: number) {
    const modal = this.modal.open(ModalConfirmComponent, {
      centered: true,
    });

    modal.componentInstance.content = {
      title: 'Confirm image set deletion!',
      body: 'Are you sure you want to delete this image set?',
      confirm: 'Yes',
      abort: 'No',
    };

    const confirmed = await modal.result;

    if (confirmed) {
      await this.imageSetService.delete(modelId);
      this.updateImageSets();

    }
  }

  async updateImageSets() {
    const imageSets = await this.imageSetService.getAll();

    console.log(imageSets);

    this.dataSource = new MatTableDataSource(imageSets);
  }

}
