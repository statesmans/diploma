import { Component, OnInit } from '@angular/core';
import { ImageSet } from '../../shared/interfaces';

import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ImageSetService } from '../../services/image-set.service';
import { AddImageSetModalComponent } from './add-image-set-modal/add-image-set-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../libs/components/confirm-modal/confirm-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-image-sets',
  templateUrl: './image-sets.component.html',
  styleUrl: './image-sets.component.scss',
})
export class ImageSetsComponent implements OnInit {
  dataSource: MatTableDataSource<ImageSet> = new MatTableDataSource([{} as ImageSet]);
  displayedColumns: string[] = ['name', 'selectedModel', 'imagesCount', 'controls'];

  searchControl: FormControl = new FormControl();
  searchControlSub$?: Subscription;
  constructor (
    private imageSetService: ImageSetService,
    private modal: NgbModal,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.searchControlSub$?.unsubscribe();
  }

  async ngOnInit(): Promise<void> {
    this.updateImageSets()
    this.searchControlSub$ = this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Set the debounce time (300ms in this case)
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.updateImageSets(value);
      });
  }

  async openAddModal() {
    const modal = this.modal.open(AddImageSetModalComponent, {
      centered: true,
    });

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

  async openEditModal(id: number) {
    const modal = this.modal.open(AddImageSetModalComponent, {
      centered: true,
    });

    modal.componentInstance.editMode = true;

    await modal.result;

    this.updateImageSets();
  }

  async openImageSet(id: number) {
    this.router.navigate(['/image-set/', id]);
  }

  async updateImageSets(search?: string) {
    const imageSets = await this.imageSetService.getAll(search);

    this.dataSource = new MatTableDataSource(imageSets);
  }


}
