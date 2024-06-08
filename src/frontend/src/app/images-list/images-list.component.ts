import { Component, Input, OnInit } from '@angular/core';
import { Image } from '../shared/interfaces';

@Component({
  selector: 'app-images-list',
  templateUrl: './images-list.component.html',
  styleUrl: './images-list.component.scss'
})
export class ImagesListComponent {
  @Input() images!: Image[]

  constructor () {}
}
