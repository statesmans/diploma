import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Image, PaginatedResponse } from '../shared/interfaces';
import { PageEvent } from '@angular/material/paginator';
import { SelectionService } from '../services/selection.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-images-list',
  templateUrl: './images-list.component.html',
  styleUrl: './images-list.component.scss'
})
export class ImagesListComponent implements OnInit{
  imageSetId?: number;


  @Input() defaultPageSize: number = 10;
  @Input() images!: PaginatedResponse<Image>

  @Output() onPaginationChanged = new EventEmitter<PageEvent>();
  @Output() updateImages = new EventEmitter();

  isAllSelected = false;
  showDeleteBtn = false;


  constructor (
    private selectionService: SelectionService,
    private route: ActivatedRoute,
  ) {}

  handleImagesUpdate() {
    this.updateImages.emit('');
  }

  handlePageEvent(event: PageEvent) {
    this.onPaginationChanged.emit(event);
  }

  selectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;

    this.selectionService.setSelectedAll(checkbox.checked);
  }

  async deleteSelectedImages() {
    await this.selectionService.deleteSelectedImages(this.imageSetId!);
    this.updateImages.emit('');
  }

  async ngOnInit(): Promise<void> {
    this.imageSetId = +this.route.snapshot.paramMap.get('id')!;
    this.selectionService.selectedImages.subscribe(images => {
      const selectedImagesLength = images.length;

      if (selectedImagesLength) {
        this.showDeleteBtn = true;
      } else {
        this.showDeleteBtn = false;
      }

    })

    this.selectionService.isAllSelected.subscribe(isAllSelected => {
      const selectedImagesLength = this.selectionService.selectedImages.value.length;

      if (isAllSelected) {
        this.showDeleteBtn = true;
      } else if (!isAllSelected && !selectedImagesLength) {
        this.showDeleteBtn = false;
        this.isAllSelected = false;
      }

    })
  }
}
