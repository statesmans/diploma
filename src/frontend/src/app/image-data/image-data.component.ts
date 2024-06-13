import { ModelService } from './../services/model.service';
import { AfterViewInit, Component, HostListener, model, OnInit } from '@angular/core';
import { DefectClass, Image, Label, LabelInterface, Model } from '../shared/interfaces';
import { ImageService } from '../services/image.service';
import { LabelService } from '../services/label.service';
import { DefectClassService } from '../services/defect-class.service';
import { FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';

enum ManualDefects {
  OK = 1
}

@Component({
  selector: 'app-image-data',
  templateUrl: './image-data.component.html',
  styleUrl: './image-data.component.scss'
})
export class ImageDataComponent implements OnInit, AfterViewInit {
  image!: Image;

  manualLabel: Label = {} as Label;
  automaticLabels: Label[] = [];

  selectedDefectClassId: FormControl<number | null> = new FormControl(null, [Validators.required, Validators.min(1)]);
  selectedModel: FormControl<string> = new FormControl();

  defectClasses: DefectClass[] = [];
  modelsThatPredictedImage: Model[] = []
  // inferredLabels: Label[] = []

  tabIndex = 0;
  canvasHeight = 512;
  canvasWidth = 512;



  private rectangles: { x: number, y: number, width: number, height: number }[] = [];


  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private img = new Image();
  private isImageDownloaded = false;
  private scaleFactor = 1;

  constructor (
    private imageService: ImageService,
    private labelService: LabelService,
    private defectClassService: DefectClassService,
    private modelService: ModelService,
  ) {}

  async ngOnInit(): Promise<void> {

    this.manualLabel = await this.labelService.getManualByImageId(this.image.id);
    this.automaticLabels = await this.labelService.getAutomaticByImageId(this.image.id);
    // preserving image
    this.img.src = this.imageService.getImageUrl(this.image.filename, this.image.uuidFile);

    // we have only one manual label so there is no need to iterate
    if (
      this.manualLabel.labelData &&
      Object.entries(this.manualLabel.labelData)?.length
    ) {
      const labelData = this.manualLabel.labelData;
      this.rectangles.push({
        x: labelData.xy[1] * this.scaleFactor,
        y: labelData.xy[2] * this.scaleFactor,
        width: labelData.xy[3] * this.scaleFactor,
        height: labelData.xy[4] * this.scaleFactor
      });

    }

    this.selectedDefectClassId.setValue(this.manualLabel.defectClassId);


    this.defectClasses = (await this.defectClassService.getAll()).filter(defect => defect.id !== 1);
    const labelWithModel = await this.labelService.getAllInferredWithModel(this.image.id);

    labelWithModel.map(label => {
      const model = this.modelsThatPredictedImage.find(model => model.id === label.modelUuid);

      if (label.Model && !model) {
        this.modelsThatPredictedImage.push(label.Model)
      }
    })

    this.selectedModel.valueChanges.subscribe(modelId => {
      this.clearRectangles();
      this.automaticLabels.map(label => {
        if (label.modelUuid === modelId) {
          const labelData = label?.labelData;

          this.rectangles.push({
            x: labelData.xy[1],
            y: labelData.xy[2],
            width: labelData.xy[3],
            height: labelData.xy[4]
          })
        }
      })
      this.drawAll()
    })

  }
  async ngAfterViewInit(): Promise<void> {
    this.loadCanvas('imageCanvas_0')
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

  drawImage() {
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

  onMouseDown(event: MouseEvent) {
    if (this.tabIndex !== 0) return;
    this.isDrawing = true;
    if (this.selectedDefectClassId.value === ManualDefects.OK) {
      this.selectedDefectClassId.setValue(null)
      this.selectedDefectClassId.markAsUntouched()
    }

    
    const rect = this.canvas.getBoundingClientRect();
  
    this.startX = (event.clientX - rect.left) / this.scaleFactor;
    this.startY = (event.clientY - rect.top) / this.scaleFactor;
  }


  onMouseUp(event: MouseEvent) {
    if (this.isDrawing) {
      this.isDrawing = false;

      const rect = this.canvas.getBoundingClientRect();
      let endX = (event.clientX - rect.left) / this.scaleFactor;
      let endY = (event.clientY - rect.top) / this.scaleFactor;
  
      let width = endX - this.startX;
      let height = endY - this.startY;
  
      // If width or height is negative, adjust the starting point and make width and height positive
      if (width < 0) {
        this.startX += width;
        width = Math.abs(width);
      }
      if (height < 0) {
        this.startY += height;
        height = Math.abs(height);
      }
  
      if (width > 0 && height > 0) {
        this.rectangles = [{ x: this.startX, y: this.startY, width, height }];
      }

    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDrawing) {
      const rect = this.canvas.getBoundingClientRect();
      const endX = (event.clientX - rect.left) / this.scaleFactor;
      const endY = (event.clientY - rect.top) / this.scaleFactor;
      this.context.clearRect(0, 0, this.canvas.width / this.scaleFactor, this.canvas.height / this.scaleFactor);
      this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);

      this.drawRect(this.startX, this.startY, endX - this.startX, endY - this.startY, 'red');
    }
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

  private drawAll() {
    // console.log(JSON.stringify(this.rectangles[0]))
    for (const rect of this.rectangles) {
      this.drawRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  clearRectangles() {
    this.rectangles = [];
    this.selectedDefectClassId.setValue(null)
    this.selectedDefectClassId.markAsUntouched()
    this.context.clearRect(0, 0, this.canvas.width / this.scaleFactor, this.canvas.height / this.scaleFactor);
    this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
  }

  saveLabel() {
    if (!this.selectedDefectClassId.value) return;

    const { x, y, height, width } = this.rectangles[0];

    const labelData: LabelInterface = {
      xy: [ this.selectedDefectClassId.value, x, y, width, height],
    }
    this.labelService.update(this.manualLabel.id, {
      labelData,
      defectClassId: this.selectedDefectClassId.value
    });
  }


  toggleTab(event: MatTabChangeEvent) {
    this.tabIndex = event.index;
    this.clearRectangles();

    if (event.index === 0) {
      const labelData = this.manualLabel?.labelData;
      if (
        labelData &&
        Object.entries(labelData)?.length
      ) {
        this.rectangles.push({
          x: labelData.xy[1],
          y: labelData.xy[2],
          width: labelData.xy[3],
          height: labelData.xy[4]
        });
      }
      
    }
    this.loadCanvas(`imageCanvas_${event.index}`)

  }

  loadCanvas(canvasId: string) {
    this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d')!;
    this.loadImage();
    
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));

  }

  markAsOk() {
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

}
