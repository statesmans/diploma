import { Component, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { ActivatedRoute, Event } from '@angular/router';
import { Image, ImageSet, Model } from '../../shared/interfaces';
import { ModelService } from '../../services/model.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-image-set',
  templateUrl: './image-set.component.html',
  styleUrl: './image-set.component.scss'
})
export class ImageSetComponent implements OnInit {

  imageSet: ImageSet = {} as ImageSet;

  selectedModel: string | null = null;

  images: Image[] = [];

  models: Model[] = [];




  constructor (
    private activatedRoute: ActivatedRoute,
    private imageService: ImageService,
    private modelService: ModelService,
    private toastr: ToastrService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.imageSet = this.activatedRoute.snapshot.data['imageSet'];

    this.images = (await this.imageService.getAllByImageSet(this.imageSet.id)).sort((a, b) => a.);

    this.selectedModel = this.imageSet.selectedModel;
    
    this.models = await this.modelService.getAll();

  }

  async uploadFiles(event: any) {


    const element = event.currentTarget as HTMLInputElement;

    let files = Array.prototype.slice.call(element.files);
    files = files.map(file => {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        this.toastr.error('Only JPG and PNG files are allowed.', 'Invalid File Type');
        return;
      }
      return file;
    })

    const uploadedImages = await this.imageService.prepareFiles(files, this.imageSet.id);
    this.images = [
      ...this.images,
      ...uploadedImages,
    ]
    
  }
}
