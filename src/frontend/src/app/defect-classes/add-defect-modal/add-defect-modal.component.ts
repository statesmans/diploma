import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DefectClassService } from '../../services/defect-class.service';

@Component({
  selector: 'app-add-defect-modal',
  templateUrl: './add-defect-modal.component.html',
  styleUrl: './add-defect-modal.component.scss'
})
export class AddDefectModalComponent implements OnInit {

  defectForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly modal: NgbActiveModal,
    private defectClassService: DefectClassService,
  ) {}

  buildForm(): FormGroup {
    return this.fb.group({
      name: ["", [Validators.required, Validators.maxLength(255)]],
    });
  }

  async ngOnInit(): Promise<void> {
    this.defectForm = this.buildForm();
  }

  async submit() {
    await this.defectClassService.create({
      ...this.defectForm.value
    });

    this.modal.close(true);
  }
}
