import { ImageSetService } from '../services/image-set.service';
import { ModelService } from '../services/model.service';
import { AfterViewInit, Component, HostListener, model, OnInit } from '@angular/core';
import { DefectClass, Image, ImageSet, Label, LabelInterface, Model } from '../shared/interfaces';
import { ImageService } from '../services/image.service';
import { LabelService } from '../services/label.service';
import { DefectClassService } from '../services/defect-class.service';
import { FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { ModalConfirmComponent } from '../libs/components/confirm-modal/confirm-modal.component';

enum ManualDefects {
  OK = 1,
  DEFECT = 2,
}

@Component({
  selector: 'app-image-data-modal',
  templateUrl: './image-data-modal.component.html',
  styleUrl: './image-data-modal.component.scss'
})
export class ImageDataModalComponent implements OnInit, AfterViewInit {
  private automaticLabels: Label[] = [];
  private automaticLabelsDataSource!: MatTableDataSource<Label & {
    defectName: string
  }>;
  private canvas!: HTMLCanvasElement;
  private canvasHeight = 512;
  private canvasWidth = 512;
  private context!: CanvasRenderingContext2D;
  private defectClasses: DefectClass[] = [];
  private defectClassesWithoutOk: DefectClass[] = [];
  private displayedColumns = ['name', 'confidence', 'controls']

  private image!: Image;
  private imageSet?: ImageSet;
  private imageSetId!: number;
  private img = new Image();
  private isDrawing = false;
  private isImageDownloaded = false;
  private manualLabel: Label = {} as Label;
  private modelsThatPredictedImage: Model[] = []
  private rectangles: { x: number, y: number, width: number, height: number }[] = [];
  private scaleFactor = 1;
  private selectedDefectClassId: FormControl<number | null> = new FormControl(null, [Validators.required, Validators.min(1)]);
  private selectedModel: FormControl<string> = new FormControl();
  private startX = 0;
  private startY = 0;
  private tabIndex = 0;
  constructor (
    private imageService: ImageService,
    private labelService: LabelService,
    private defectClassService: DefectClassService,
    private modelService: ModelService,
    private activeModal: NgbActiveModal,
    private modal: NgbModal,
    private ImageSetService: ImageSetService,
    private toastr: ToastrService
  ) {}

  private clearRectangles() {

    this.rectangles = [];
    this.selectedDefectClassId.setValue(null)
    this.context.clearRect(0, 0, this.canvas.width / this.scaleFactor, this.canvas.height / this.scaleFactor);
    this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
  }

  private createAutomaticDataSource() {
    // setting data source for inferred labels table
    const dataSource = this.automaticLabels.map(label => {
      const defect = this.defectClasses.find(defect => defect.id === label.defectClassId);
      return {
        ...label,
        defectName: defect?.name || `unknown`,
      }
    })
    this.automaticLabelsDataSource = new MatTableDataSource(dataSource);
  }

  private drawAll() {
    for (const rect of this.rectangles) {
      this.drawRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  private drawAllAutomaticRect() {
    this.clearRectangles()
    this.rectangles = this.automaticLabels.map((label) => {
      const [x, y, width, height] = label.labelData.xy;
      return {
        x, y, width, height
      }
    })
    this.drawAll()
  }

  private drawImage() {
    const containerWidth = this.canvasHeight;
    const scale = containerWidth / this.img.width;
    
    this.scaleFactor = scale;

    if (this.tabIndex === 1) {
      this.canvas.style.cursor = 'default';
    }
    this.canvas.width = this.img.width * scale;
    this.canvas.height = this.img.height * scale;
    this.context.scale(scale, scale);
    this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
    this.drawAll();
  }

  private drawRect(
    x: number, 
    y: number,
    width: number, 
    height: number, 
    color: 'red' | 'green' = 'red'
  ) {
    this.context.beginPath();
    this.context.rect(x, y, width, height);
    // green only if the user desided to make this label OK
    if (
      color === 'green' ||this.selectedDefectClassId.value === ManualDefects.OK) {
      this.context.lineWidth = 4;
      this.context.strokeStyle = 'green';
      this.context.stroke();
      return;
    }

    if (color === 'red') {
      this.context.lineWidth = 2;
      this.context.strokeStyle = 'red';
      this.context.stroke();
      return;
    }
    
  }

  private drawSpecificRect(label: Label) {
    const [x, y, width, height] = label.labelData.xy;
    this.clearRectangles()
    this.drawRect(x, y, width, height, 'red')
  }

  private loadCanvas(canvasId: string) {
    this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d')!;
    this.loadImage();
    
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));

  }

  private loadImage() {
    if (this.isImageDownloaded) {
      this.drawImage();
    }
    this.img.onload = () => {
      this.isImageDownloaded = true;
      this.drawImage()
    };
  }

  private markAsOk() {
    this.clearRectangles()
    this.rectangles.push({
      x: 0,
      y: 0,
      width: this.img.width,
      height: this.image.height
    })
    this.selectedDefectClassId.setValue(ManualDefects.OK)
    this.selectedDefectClassId.markAsTouched()
    this.drawRect(0, 0, this.img.width, this.img.height, 'green')
  }

  private onMouseDown(event: MouseEvent) {
    if (this.tabIndex !== 0) return;
    this.selectedDefectClassId.markAsTouched();
    this.isDrawing = true;
    if (this.selectedDefectClassId.value === ManualDefects.OK) {
      this.selectedDefectClassId.setValue(null)
      this.selectedDefectClassId.markAsUntouched()
    }

    
    const rect = this.canvas.getBoundingClientRect();
  
    this.startX = (event.clientX - rect.left) / this.scaleFactor;
    this.startY = (event.clientY - rect.top) / this.scaleFactor;
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDrawing) {
      const rect = this.canvas.getBoundingClientRect();
      const endX = (event.clientX - rect.left) / this.scaleFactor;
      const endY = (event.clientY - rect.top) / this.scaleFactor;
      this.context.clearRect(0, 0, this.canvas.width / this.scaleFactor, this.canvas.height / this.scaleFactor);
      this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);

      this.drawRect(this.startX, this.startY, endX - this.startX, endY - this.startY, 'red');
    }
  }

  private onMouseUp(event: MouseEvent) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const rect = this.canvas.getBoundingClientRect();
      let endX = (event.clientX - rect.left) / this.scaleFactor;
      let endY = (event.clientY - rect.top) / this.scaleFactor;
      let startX = this.startX;
      let startY = this.startY;

      let width;
      let height;

      if (startX < endX) {
        width = startX - endX;
      } else {
        width = endX - startX;
        startX = startX + width
      }

      if (startY < endY) {
        height = startY - endY;
      } else {
        height = endY - startY;
        startY = startY + height
      }

      width = Math.abs(width);
      height = Math.abs(height);

      if (width > 0 && height > 0) {
          this.rectangles = [{ x: startX, y: startY, width, height }];
          this.drawAll(); // Ensure all rectangles are drawn
      } else {
          this.toastr.error('Please select a rectangle with a width and height larger than 0', 'Error');
      }
    }
  }

  private toggleTab(event: MatTabChangeEvent) {
    this.tabIndex = event.index;
    this.clearRectangles();

    if (event.index === 0) {
      const labelData = this.manualLabel?.labelData;
      if (
        labelData &&
        Object.entries(labelData)?.length
      ) {
        this.rectangles.push({
          x: labelData.xy[0],
          y: labelData.xy[1],
          width: labelData.xy[2],
          height: labelData.xy[3]
        });
      }
      
    }
    this.loadCanvas(`imageCanvas_${event.index}`)

  }

  async ngAfterViewInit(): Promise<void> {
    this.loadCanvas('imageCanvas_0')
  }

  async ngOnInit(): Promise<void> {
    this.imageSet = await this.ImageSetService.getOne(+this.imageSetId!);
    this.manualLabel = await this.labelService.getManualByImageId(this.image.id);
    console.log(this.imageSet)
    // preserving image
    this.img.src = this.imageService.getImageUrl(this.image.uuidFile);

    // we have only one manual label so there is no need to iterate
    if (
      this.manualLabel.labelData &&
      Object.entries(this.manualLabel.labelData)?.length
    ) {
      const labelData = this.manualLabel.labelData;
      this.rectangles.push({
        x: labelData.xy[0] * this.scaleFactor,
        y: labelData.xy[1] * this.scaleFactor,
        width: labelData.xy[2] * this.scaleFactor,
        height: labelData.xy[3] * this.scaleFactor
      });

    }

    this.selectedDefectClassId.setValue(this.manualLabel.defectClassId);


    this.defectClasses = await this.defectClassService.getAll();
    this.defectClassesWithoutOk = this.defectClasses.filter(defect => defect.id !== ManualDefects.OK);


    const automaticLabels = await this.labelService.getAutomaticByImageId(this.image.id);

    automaticLabels.map(async label => {
      const model = this.modelsThatPredictedImage.find(model => model.id === label.modelUuid);

      if (label.Model && !model) {
        const model = await this.modelService.getOne(label.modelUuid);
        this.modelsThatPredictedImage.push(model);
      }
    })

    this.selectedModel.valueChanges.subscribe(async modelId => {
      this.automaticLabels = await this.labelService.getAutomaticByImageId(this.image.id);

      this.createAutomaticDataSource();

      this.clearRectangles();
      this.automaticLabels.map(label => {
        if (label.modelUuid === modelId) {
          const labelData = label?.labelData;

          this.rectangles.push({
            x: labelData.xy[0],
            y: labelData.xy[1],
            width: labelData.xy[2],
            height: labelData.xy[3]
          })
        }
      })
      this.drawAll()
    })

  }

  async openLabelDeleteModal(labelId: number) {
    const modal = this.modal.open(ModalConfirmComponent, {
      centered: true,
    });

    modal.componentInstance.content = {
      title: 'Confirm label deletion!',
      body: 'Are you sure you want to delete this label?',
      confirm: 'Yes',
      abort: 'No',
    };

    const confirmed = await modal.result;

    if (confirmed) {
      await this.labelService.delete(labelId);
      this.automaticLabels = this.automaticLabels.filter((label) => label.id !== labelId);
      this.createAutomaticDataSource();
      this.drawAllAutomaticRect();
    }
  }

  async predictImage() {
    this.modelService.startPredictionOnImage(this.imageSet!.selectedModel!, this.image.id);
  }

  async saveLabel() {
    if (!this.selectedDefectClassId.value) return;

    const { x, y, height, width } = this.rectangles[0];

    const labelData: LabelInterface = {
      xy: [ x, y, width, height],
    }
    await this.labelService.update(this.manualLabel.id, {
      labelData,
      defectClassId: this.selectedDefectClassId.value
    });
    
    this.activeModal.close()
  }
} 
