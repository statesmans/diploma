import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageSetService } from '../../../services/image-set.service';
import { ImageSet } from '../../../shared/interfaces';
import { ModelService } from '../../../services/model.service';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';

@Component({
  selector: 'app-add-model-modal',
  templateUrl: './add-model-modal.component.html',
  styleUrl: './add-model-modal.component.scss'
})
export class AddModelModalComponent implements OnInit {
  private editMode: boolean = false;
  private editor!: JSONEditor;
  private editorOptions: JSONEditorOptions = {
    mode: 'tree',
    onChange: () => {
      const updatedJson = this.editor.get();
      this.modelForm.patchValue({
        hyperparameter: updatedJson
      })
    }
  };
  private imageSets: ImageSet[] = [];
  @ViewChild('jsonEditorContainer', { static: true }) private jsonEditorContainer!: ElementRef;
  private modelForm!: FormGroup;
  private modelId!: string;
  constructor(
    private readonly fb: FormBuilder,
    private readonly modal: NgbActiveModal,
    private imageSetService: ImageSetService,
    private modelService: ModelService,
  ) {}

  private buildForm(): FormGroup {
    return this.fb.group({
      name: ["", [Validators.required, Validators.maxLength(64)]],
      trainingSet: [null, Validators.required],
      hyperparameter: [{}]
    });
  }

  private ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  async ngOnInit(): Promise<void> {
    this.modelForm = this.buildForm();

    this.imageSets = await this.imageSetService.getAll();
    const model = await this.modelService.getOne(this.modelId);

    if (model) {
      this.modelForm.patchValue(model);
    }

    this.editor = new JSONEditor(this.jsonEditorContainer.nativeElement, this.editorOptions);
    if (model.hyperparameter) {
      this.editor.set(this.modelForm.value.hyperparameter);
    }
  }

  async submit() {
    if (!this.modelForm.valid) return;

    if (this.editMode) {
      await this.modelService.update(this.modelId, this.modelForm.value);
    } else if (!this.editMode) {
      const trainingSet = +this.modelForm.value.trainSet;
      const hyperparameter = this.modelForm.value.hyperparameter;

      const model = {
        ...this.modelForm.value,
        ...( trainingSet ? { trainingSet } : {} ),
        ...( hyperparameter ? hyperparameter : {} ),
      };
      await this.modelService.create(model);
    }

    this.modal.close(true);
  }
}
