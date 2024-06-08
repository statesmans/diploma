import { Controller, Get } from '@nestjs/common';
import { DefectClassService } from './defect-class.service';

@Controller('defect-class')
export class DefectClassController {
    
    constructor (
        private defectClassService: DefectClassService,
    ) {}
    
    @Get()
    async getAll() {
        console.log(await this.defectClassService.getAll())
        return await this.defectClassService.getAll();
    }
}
