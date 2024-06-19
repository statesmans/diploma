import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface ModalConfirmContent {
  title: string;
  body: string;
  confirm: string;
  abort: string;
}

@Component({
  selector: 'lib-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ModalConfirmComponent {
  private content!: ModalConfirmContent;

  constructor(private modal: NgbActiveModal) {}

  private close(confirmed: boolean): void {
    this.modal.close(confirmed);
  }
}
