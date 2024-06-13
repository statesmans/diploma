import { Component, OnInit } from '@angular/core';
import { Model } from '../../shared/interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { ModelService } from '../../services/model.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../libs/components/confirm-modal/confirm-modal.component';
import { AddModelModalComponent } from './add-model-modal/add-model-modal.component';
import { elementAt } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrl: './models.component.scss'
})
export class ModelsComponent implements OnInit {
  displayedColumns: string[] = ['name', 'trainingSet', 'testSet', 'createdAt', 'controls'];

  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 50;

  trainingStatuses: Record<string, boolean> = {}

  models: Model[] = []

  dataSource!: MatTableDataSource<Model>;

  constructor(
    private modelService: ModelService,
    private modal: NgbModal,
  ) {}

  async ngOnInit(): Promise<void> {      
    await this.updateModels();
  }


  async openAddModal() {
    const modal = this.modal.open(AddModelModalComponent, {
      centered: true,
    });

    modal.componentInstance.editMode = false;
    const confirmed = await modal.result;

    if (confirmed) {
      await this.updateModels();
    }
  }

  async openEditModal(modelId: string) {
    const modal = this.modal.open(AddModelModalComponent, {
      centered: true,
    });

    modal.componentInstance.editMode = true;
    modal.componentInstance.modelId = modelId;

    await modal.result;

    await this.updateModels();
  }

  async openDeleteModal(modelId: string) {
    const modal = this.modal.open(ModalConfirmComponent, {
      centered: true,
    });
    console.log(modelId)
    modal.componentInstance.content = {
      title: 'Confirm model deletion!',
      body: 'Are you sure you want to delete this model?',
      confirm: 'Yes',
      abort: 'No',
    };

    const confirmed = await modal.result;

    if (confirmed) {
      await this.modelService.delete(modelId);
      await this.updateModels();
    }
  }

  async updateModels() {
    this.dataSource = new MatTableDataSource( await this.modelService.getAll());

  }

  async startTraining(modelId: string) {
    await this.modelService.startTraining(modelId);
    // this.trainingStatuses[modelId] = true
  }
}
