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
  @Input() private defaultPageSize: number = 10;
  @Input() private images!: PaginatedResponse<Image>
  private imageSetId?: number;
  private isAllSelected = false;
  @Output() private onPaginationChanged = new EventEmitter<PageEvent>();
  private showDeleteBtn = false;
  @Output() private updateImages = new EventEmitter();
  constructor (
    private selectionService: SelectionService,
    private route: ActivatedRoute,
  ) {}

  private handleImagesUpdate() {
    this.updateImages.emit('');
  }

  private handlePageEvent(event: PageEvent) {
    this.onPaginationChanged.emit(event);
  }

  private selectAll(event: Event) {
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
