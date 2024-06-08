import { Test, TestingModule } from '@nestjs/testing';
import { DefectClassController } from './defect-class.controller';

describe('DefectClassController', () => {
  let controller: DefectClassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefectClassController],
    }).compile();

    controller = module.get<DefectClassController>(DefectClassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
