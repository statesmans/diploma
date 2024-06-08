import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { DefectClass, Image, Label, LabelInterface } from '../shared/interfaces';
import { ImageService } from '../services/image.service';
import { LabelService } from '../services/label.service';
import { DefectClassService } from '../services/defect-class.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-image-data',
  templateUrl: './image-data.component.html',
  styleUrl: './image-data.component.scss'
})
export class ImageDataComponent implements OnInit, AfterViewInit {
  image!: Image;

  selectedDefectClassId: FormControl<number> = new FormControl();

  private label!: Label;
  defectClasses: DefectClass[] = [];
  private rectangles: { x: number, y: number, width: number, height: number }[] = [];


  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private img = new Image();
  private scaleFactor = 1;

  constructor (
    private imageService: ImageService,
    private labelService: LabelService,
    private defectClassService: DefectClassService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.label = await this.labelService.getOneByImageId(this.image.id);

    if (
      this.label?.labelData &&
      Object.entries(this.label?.labelData)?.length
    ) {
      console.log(this.label.labelData)
      const labelData = this.label.labelData
      this.rectangles.push({
        x: labelData.xy[1] * this.scaleFactor,
        y: labelData.xy[2] * this.scaleFactor,
        width: labelData.xy[3] * this.scaleFactor,
        height: labelData.xy[4] * this.scaleFactor
      });
    }

    this.selectedDefectClassId.setValue(this.label.defectClassId);


    this.defectClasses = await this.defectClassService.getAll();
  }
  async ngAfterViewInit(): Promise<void> {
    this.canvas = <HTMLCanvasElement>document.getElementById('imageCanvas');
    this.context = this.canvas.getContext('2d')!;
    this.loadImage(
      this.imageService.getImageUrl(this.image.filename, this.image.uuidFile)
    );

    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));

  }

  private loadImage(src: string) {
    this.img.src = src;
    this.img.onload = () => {
      const containerWidth = 900;
      const scale = containerWidth / this.img.width;
      this.scaleFactor = scale;
      this.canvas.width = this.img.width * scale;
      this.canvas.height = this.img.height * scale;
      this.context.scale(scale, scale);
      this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
      this.drawAll();
    };
  }

  onMouseDown(event: MouseEvent) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startX = (event.clientX - rect.left) / this.scaleFactor;
    this.startY = (event.clientY - rect.top) / this.scaleFactor;
  }


  onMouseUp(event: MouseEvent) {
    if (this.isDrawing) {
      this.isDrawing = false;
      const rect = this.canvas.getBoundingClientRect();
      const endX = (event.clientX - rect.left) / this.scaleFactor;
      const endY = (event.clientY - rect.top) / this.scaleFactor;
      const width = endX - this.startX;
      const height = endY - this.startY;
      console.log({ x: this.startX, y: this.startY, width, height }, this.scaleFactor)
      this.rectangles = [{ x: this.startX, y: this.startY, width, height }];
      // this.drawAll();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDrawing) {
      const rect = this.canvas.getBoundingClientRect();
      const endX = (event.clientX - rect.left) / this.scaleFactor;
      const endY = (event.clientY - rect.top) / this.scaleFactor;
      this.context.clearRect(0, 0, this.canvas.width / this.scaleFactor, this.canvas.height / this.scaleFactor);
      this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
      // this.drawAll();
      this.drawRect(this.startX, this.startY, endX - this.startX, endY - this.startY);
    }
  }

  private drawRect(x: number, y: number, width: number, height: number) {
    this.context.beginPath();
    this.context.rect(x, y, width, height);
    this.context.strokeStyle = 'red';
    this.context.lineWidth = 2;
    this.context.stroke();
  }

  private drawAll() {
    for (const rect of this.rectangles) {
      this.drawRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  clearRectangles() {
    this.rectangles = [];
    this.context.clearRect(0, 0, this.canvas.width / this.scaleFactor, this.canvas.height / this.scaleFactor);
    this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
  }

  saveLabel() {
    const { x, y, height, width } = this.rectangles[0];

    // const X_center = (xy[3] / 2) + xy[1];
    // const Y_center = (xy[4] / 2) + xy[2];

    // const X_center_norm = X_center / width;
    // const Y_center_norm = Y_center / height;

    // const width_norm = xy[3] / width
    // const height_norm = xy[4] / height


    const labelData: LabelInterface = {
      xy: [ this.selectedDefectClassId.value, x, y, width, height],
    }
    this.labelService.update(this.label.id, {
      labelData,
      defectClassId: this.selectedDefectClassId.value
    });
  }


}
