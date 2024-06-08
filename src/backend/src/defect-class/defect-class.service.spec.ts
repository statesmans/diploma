import { Test, TestingModule } from '@nestjs/testing';
import { DefectClassService } from './defect-class.service';

describe('DefectClassService', () => {
  let service: DefectClassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefectClassService],
    }).compile();

    service = module.get<DefectClassService>(DefectClassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
