import { NgModule } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { HttpService } from "./shared/http.service";
import { MatTableModule } from "@angular/material/table";
import { MatFormField, MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing,module";
import { ImageSetsComponent } from "./components/image-sets/image-sets.component";
import { ImageSetComponent } from "./components/image-set/image-set.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ImageSetService } from "./services/image-set.service";
import { ImageService } from "./services/image.service";
import { ModelsComponent } from "./components/models/models.component";
import { ModelService } from "./services/model.service";
import { ModalConfirmComponent } from "./libs/components/confirm-modal/confirm-modal.component";
import { AddModelModalComponent } from "./components/models/add-model-modal/add-model-modal.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddImageSetModalComponent } from "./components/image-sets/add-image-set-modal/add-image-set-modal.component";
import { ImageComponent } from "./image/image.component";
import { ImagesListComponent } from "./images-list/images-list.component";
import { ImageDataModalComponent } from "./image-data-modal/image-data-modal.component";
import { LabelService } from "./services/label.service";
import { DefectClassService } from "./services/defect-class.service";
import { ToastrModule } from "ngx-toastr";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { SelectionService } from "./services/selection.service";
import { DefectClassesComponent } from "./defect-classes/defect-classes.component";
import { AddDefectModalComponent } from "./defect-classes/add-defect-modal/add-defect-modal.component";
import { ErrorInterceptor } from "./shared/error.interceptor";


@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        ImageSetsComponent,
        ImageSetComponent,
        ModelsComponent,
        ModalConfirmComponent,
        AddModelModalComponent,
        AddImageSetModalComponent,
        ImageComponent,
        ImagesListComponent,
        ImageDataModalComponent,
        DefectClassesComponent,
        AddDefectModalComponent
    ],
    imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        AppRoutingModule,
        ToastrModule.forRoot(),
        RouterOutlet,
        MatTableModule,
        MatMenuModule,
        MatSelectModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatPaginatorModule,
    ],
    providers: [
        HttpService,
        ImageSetService,
        ImageService,
        ModelService,
        LabelService,
        DefectClassService,
        SelectionService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }

    ],

    bootstrap: [AppComponent],

})
export class AppModule {}
