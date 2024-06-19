import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageSetModule } from './image-set/image-set.module';
import { ConfigService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENTITIES_PATHS, MIGRATION_PATH, MIGRATION_TABLE_NAME } from './defenitions';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigModule } from './config/config.module';
import { ModelsModule } from './models/models.module';
import { ImageModule } from './image/image.module';
import { LabelModule } from './label/label.module';
import { AzureService } from './azure/azure.service';
import { ImagesController } from './image/images/images.controller';
import { DefectClassModule } from './defect-class/defect-class.module';

@Module({
  imports: [
    ConfigModule,
 
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.database.host,
        ssl: config.database.ssl,
        port: config.database.port,
        username: config.database.user,
        password: config.database.pass,
        database: config.database.name,
        entities: [...ENTITIES_PATHS],
        migrationsTableName: MIGRATION_TABLE_NAME,
        namingStrategy: new SnakeNamingStrategy(),
        migrationsRun: true,
        migrations: [MIGRATION_PATH],
      }),
      inject: [ConfigService],
    }),
    ImageSetModule,
    ModelsModule,
    LabelModule,
    ImageModule,
    DefectClassModule,
  ],
  controllers: [AppController, ImagesController],
  providers: [
    AppService, AzureService
  ],
})
export class AppModule {}
