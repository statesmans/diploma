import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageSetService } from '../../../services/image-set.service';
import { ImageSet } from '../../../shared/interfaces';
import { ModelService } from '../../../services/model.service';

@Component({
  selector: 'app-add-model-modal',
  templateUrl: './add-model-modal.component.html',
  styleUrl: './add-model-modal.component.scss'
})
export class AddModelModalComponent implements OnInit {
  editMode: boolean = false;
  modelId!: string;

  modelForm!: FormGroup;
  imageSets: ImageSet[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly modal: NgbActiveModal,
    private imageSetService: ImageSetService,
    private modelService: ModelService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.modelForm = this.buildForm();

    this.imageSets = await this.imageSetService.getAll();
    console.log(this.modelForm)
    this.modelForm.valueChanges.subscribe(v => {
      console.log(v)
    });
  }

  async submit() {
    if (!this.modelForm.valid) return;

    if (this.editMode) {
      await this.modelService.update(this.modelId, this.modelForm.value);
    } else if (!this.editMode) {
      const trainingSet = +this.modelForm.value.trainSet;
      const testSet = +this.modelForm.value.testSet;

      const model = {
        ...this.modelForm.value,
        ...( trainingSet ? { trainingSet } : {} ),
        ...( testSet ? { testSet } : {} ),
      };
      await this.modelService.create(model);
    }

    this.modal.close(true);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      name: ["", [Validators.required, Validators.maxLength(64)]],
      trainSet: [null, Validators.required],
      testSet: [null, Validators.required],
    });
  }
}
