import { NgModule } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { HttpService } from "./shared/http.service";
import { MatTableModule } from "@angular/material/table";
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from '@angular/material/icon';

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing,module";
import { ImageSetsComponent } from "./components/image-sets/image-sets.component";
import { ImageSetComponent } from "./components/image-set/image-set.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { HttpClientModule } from "@angular/common/http";
import { ImageSetService } from "./services/image-set.service";
import { ImageService } from "./services/image.service";
import { ModelsComponent } from "./components/models/models.component";
import { ModelService } from "./services/model.service";
import { ModalConfirmComponent } from "./libs/components/confirm-modal/confirm-modal.component";
import { AddModelModalComponent } from "./components/models/add-model-modal/add-model-modal.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AddImageSetModalComponent } from "./components/image-sets/add-image-set-modal/add-image-set-modal.component";
import { ImageComponent } from "./image/image.component";
import { ImagesListComponent } from "./images-list/images-list.component";
import { ImageDataComponent } from "./image-data/image-data.component";
import { LabelService } from "./services/label.service";
import { DefectClassService } from "./services/defect-class.service";


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
        ImageDataComponent,
    ],
    imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        AppRoutingModule,
        RouterOutlet,
        MatTableModule,
        MatMenuModule,
        MatSelectModule,
        MatIconModule,
    ],
    providers: [
        HttpService,
        ImageSetService,
        ImageService,
        ModelService,
        LabelService,
        DefectClassService
    ],

    bootstrap: [AppComponent],

})
export class AppModule {}