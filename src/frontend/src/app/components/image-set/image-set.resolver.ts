import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { ImageSet } from '../../shared/interfaces';
import { ImageSetService } from '../../services/image-set.service';

export const ImageSetResolver: ResolveFn<ImageSet> = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  imageSetService: ImageSetService = inject(ImageSetService)
): Promise<ImageSet> => await imageSetService.getOne(+route.paramMap.get('id')!);