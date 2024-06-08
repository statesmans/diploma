import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageSetsComponent } from './components/image-sets/image-sets.component';
import { ImageSetComponent } from './components/image-set/image-set.component';
import { ImageSetResolver } from './components/image-set/image-set.resolver';
import { ModelsComponent } from './components/models/models.component';


const routes: Routes = [
    {
        path: 'image-sets',
        // pathMatch: 'full'
        component: ImageSetsComponent,
    },
    {
        path: 'image-set/:id',
        component: ImageSetComponent,
        resolve: { imageSet: ImageSetResolver },
    },
    {
        path: 'models',
        component: ModelsComponent,
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
