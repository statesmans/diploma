import { Component, OnInit } from '@angular/core';
import { DefectClassService } from '../services/defect-class.service';
import { MatTableDataSource } from '@angular/material/table';
import { DefectClass } from '../shared/interfaces';
import { ModalConfirmComponent } from '../libs/components/confirm-modal/confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddDefectModalComponent } from './add-defect-modal/add-defect-modal.component';

@Component({
  selector: 'app-defect-classes',
  templateUrl: './defect-classes.component.html',
  styleUrl: './defect-classes.component.scss'
})
export class DefectClassesComponent implements OnInit {
  
  dataSource!: MatTableDataSource<DefectClass>;
  displayedColumns: string[] = ['name', 'createdAt', 'controls'];

// the ids of two first defect which are mandatory and can't be deleted
  protectedDefectIds = [1, 2];
  constructor(
    private defectClassService: DefectClassService,
    private modal: NgbModal,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.updateClasses();
  }

  async openDeleteModal(defectId: number) {
    const modal = this.modal.open(ModalConfirmComponent, {
      centered: true,
    });

    modal.componentInstance.content = {
      title: 'Confirm defect deletion!',
      body: 'Are you sure you want to delete this defect?',
      confirm: 'Yes',
      abort: 'No',
    };

    const confirmed = await modal.result;

    if (confirmed) {
      await this.defectClassService.delete(defectId);
      await this.updateClasses();
    }
  }

  async updateClasses() {
    this.dataSource = new MatTableDataSource(await this.defectClassService.getAll())
  }

  async openAddModal() {
    const modal = this.modal.open(AddDefectModalComponent, {
      centered: true,
    });

    const confirmed = await modal.result;

    if (confirmed) {
      await this.updateClasses();
    }
  }
}
