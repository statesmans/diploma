import { Component, OnInit } from '@angular/core';
import { Model } from '../../shared/interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { ModelService } from '../../services/model.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfirmComponent } from '../../libs/components/confirm-modal/confirm-modal.component';
import { AddModelModalComponent } from './add-model-modal/add-model-modal.component';
import { debounceTime, distinctUntilChanged, elementAt, Subscription } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageSetService } from '../../services/image-set.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrl: './models.component.scss'
})
export class ModelsComponent implements OnInit {
  color: ThemePalette = 'primary';
  dataSource!: MatTableDataSource<Model>;
  displayedColumns: string[] = ['name', 'trainingSet', 'createdAt', 'controls'];
  mode: ProgressSpinnerMode = 'indeterminate';
  searchControl: FormControl = new FormControl();
  searchControlSub$?: Subscription;
  trainingStatuses: Record<string, boolean> = {}
  value = 50;
  constructor(
    private modelService: ModelService,
    private imageSetService: ImageSetService, 
    private modal: NgbModal,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  goToTrainingSet(trainigSetId: number) {
    this.router.navigate(['/image-set', trainigSetId]);
  }

  ngOnDestroy(): void {
    this.searchControlSub$?.unsubscribe();
  }

  async ngOnInit(): Promise<void> {      
    await this.updateModels();

    this.searchControlSub$ = this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Set the debounce time (300ms in this case)
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.updateModels(value);
      });
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

  async openDeleteModal(modelId: string) {
    const modal = this.modal.open(ModalConfirmComponent, {
      centered: true,
    });

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

  async openEditModal(modelId: string) {
    const modal = this.modal.open(AddModelModalComponent, {
      centered: true,
    });

    modal.componentInstance.editMode = true;
    modal.componentInstance.modelId = modelId;

    await modal.result;

    await this.updateModels();
  }

  async startTraining(modelId: string) {
    const model = this.dataSource.data.find(m => m.id === modelId);

    const trainingSet = await this.imageSetService.getOne(model!.trainingSet);

    if (trainingSet.imagesCount === 0) {
      this.toastr.error('You cannot start training with an empty training set', 'Error');
      return;
    }

    await this.modelService.startTraining(modelId);
  }

  async updateModels(search?: string) {
    this.dataSource = new MatTableDataSource( await this.modelService.getAll(search));

  }
}
