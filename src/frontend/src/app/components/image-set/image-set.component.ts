import { ImageSetService } from './../../services/image-set.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { ActivatedRoute, Event } from '@angular/router';
import { Image, ImageSet, Model, PaginatedResponse } from '../../shared/interfaces';
import { ModelService } from '../../services/model.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { DefectClassService } from '../../services/defect-class.service';

interface Classification {
  name: string
  value: string | number
}

enum ManualClassificationValue {
  OK = 'OK',
  DEFECT = 'Defect',
  UNCLASSIFIED = 'Unclassified',
  ALL = '',
}


@Component({
  selector: 'app-image-set',
  templateUrl: './image-set.component.html',
  styleUrl: './image-set.component.scss'
})
export class ImageSetComponent implements OnInit, OnDestroy {
  automaticClassification = new FormControl<string | null>('All');
  automaticClassifications: Classification[] = [
    { 
      name: 'All',
      value: '',
    },

  ]
  images: PaginatedResponse<Image> = {
    data: [],
    total: 0,
  };
  imageSet: ImageSet = {} as ImageSet;
  imageSetName = new FormControl<string>('', [Validators.required, Validators.minLength(1)]);
  imagesOffset: number = 0;
  imagesPageSize: number = 50;
  manualClassification = new FormControl<string | null>('All');
  manualClassifications: Classification[] = [
    { 
      name: 'All',
      value: '',
    },
    { 
      name: ManualClassificationValue.UNCLASSIFIED,
      value: ManualClassificationValue.UNCLASSIFIED,
    },
    { 
      name: ManualClassificationValue.OK,
      value: ManualClassificationValue.OK,
    },
    { 
      name: ManualClassificationValue.DEFECT,
      value: ManualClassificationValue.DEFECT,
    },

    
  ];
  models: Model[] = [];
  searchControl: FormControl = new FormControl<string>('');
  selectedModel = new FormControl<string | null>(null);
  subs$: Subscription[] = [];

  get canSave() {
    return this.imageSetName.valid && this.selectedModel.valid && (this.manualClassification.touched || this.automaticClassification.touched);

  }

  constructor (
    private activatedRoute: ActivatedRoute,
    private imageService: ImageService,
    private imageSetService: ImageSetService,
    private modelService: ModelService,
    private defectService: DefectClassService,
    private toastr: ToastrService,
  ) {}

  ngOnDestroy(): void {
    this.subs$.forEach(sub => sub.unsubscribe());
  }

  async ngOnInit(): Promise<void> {
    this.imageSet = this.activatedRoute.snapshot.data['imageSet'];

    this.imageSetName.setValue(this.imageSet.name);
    this.selectedModel.setValue(this.imageSet.selectedModel);
    this.imageSetName.markAsUntouched();
    this.imageSetName.markAsUntouched();

    this.manualClassification.setValue('All');
    this.automaticClassification.setValue('');



    const defects = await this.defectService.getAll();
    defects.map(defect => {
      if ([1,2].includes(defect.id)) return;

      this.manualClassifications.push({
        name: defect.name,
        value: defect.id
      })
    })

    await this.updateImages();

    
    this.models = await this.modelService.getAll();

    const searchControlSub$ = this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Set the debounce time (300ms in this case)
        distinctUntilChanged()
      )
      .subscribe(async value => {
        this.images = await this.imageService.getAllByImageSet(this.imageSet.id, {
          search: value,
          offset: 0,
          limit: this.imagesPageSize,
        });
      });

    

    const manualClassificationSub$ = this.manualClassification.valueChanges
      .pipe(
        debounceTime(300), // Set the debounce time (300ms in this case)
        distinctUntilChanged()
      )
      .subscribe(async value => {
        this.images = await this.imageService.getAllByImageSet(this.imageSet.id, {
          search: this.searchControl.value,
          offset: 0,
          limit: this.imagesPageSize,
          manualClassification: value,
        });
      });

      const automaticlassificationSub$ = this.automaticClassification.valueChanges
      .pipe(
        debounceTime(300), // Set the debounce time (300ms in this case)
        distinctUntilChanged()
      )
      .subscribe(async value => {
        this.images = await this.imageService.getAllByImageSet(this.imageSet.id, {
          search: this.searchControl.value,
          offset: 0,
          limit: this.imagesPageSize,
          automaticClassification: value || 'All',
        });
      });

      this.subs$.push(searchControlSub$);
      this.subs$.push(manualClassificationSub$);
      this.subs$.push(automaticlassificationSub$);

  }

  async onImagesPaginationChanged(event: PageEvent) {
    this.imagesPageSize = event.pageSize;
    this.imagesOffset = event.pageIndex * event.pageSize;

    this.images = await this.imageService.getAllByImageSet(this.imageSet.id, {
      search: this.searchControl.value,
      offset: this.imagesOffset,
      limit: this.imagesPageSize,
      ...(this.manualClassification.value ? { manualClassification: this.manualClassification.value } : {}),
      ...(this.automaticClassification.value ? { automaticClassification: this.automaticClassification.value } : {}),
    });
  }

  async save() {
    await this.imageSetService.update(this.imageSet.id, {
      selectedModel: this.selectedModel.value,
      name: this.imageSetName.value!,
    });

    this.toastr.success('Image set successfully saved', 'Image Set');
  }

  async startInference() {
    await this.modelService.startPredictionOnImageSet(this.selectedModel.value!, this.imageSet.id);
  }

  async updateImages() {
    this.images = await this.imageService.getAllByImageSet(this.imageSet.id, {
      offset: this.imagesOffset,
      limit: this.imagesPageSize,
      search: this.searchControl.value,
      ...(this.manualClassification.value ? { manualClassification: this.manualClassification.value } : {}),
      ...(this.automaticClassification.value ? { automaticClassification: this.automaticClassification.value } : {}),
    });
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

    await this.imageService.prepareFiles(files, this.imageSet.id);
    
    this.images = await this.imageService.getAllByImageSet(this.imageSet.id, {
      search: '',
      offset: this.imagesOffset,
      limit: this.imagesPageSize,
    });
  }
}
