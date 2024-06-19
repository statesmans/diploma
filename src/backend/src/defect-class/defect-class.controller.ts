import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DefectClassService } from './defect-class.service';
import { CreateDefectClassDto } from './dto/defect-class.dto';

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

    @Post()
    async create(
        @Body() body: CreateDefectClassDto
    ) {
        return await this.defectClassService.create(body);
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number
    ) {
        await this.defectClassService.softDelete(id);
    }
}
