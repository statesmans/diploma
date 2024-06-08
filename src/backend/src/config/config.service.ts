import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import * as Joi from 'joi';


expand(dotenv.config());

const CONFIG_SCHEMA = Joi.object().keys({
  httpPort: Joi.number().integer().min(1).max(65535).required(),

  database: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().greater(0).required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
    name: Joi.string().required(),
    ssl: Joi.boolean().required(),
  }),

  azure: Joi.object().keys({
    connectionString: Joi.string().required(),
    containerName: Joi.string().required(),
  })
  
});

@Injectable()
export class ConfigService {
  constructor() {
    Joi.assert(this, CONFIG_SCHEMA, 'Invalid configuration');
  }

  httpPort = 13001;

  database = {
    host: process.env.APP_DB_HOST || 'localhost',
    port: Number(process.env.APP_DB_PORT) || 3306,
    user: process.env.APP_DB_USER || 'root',
    pass: process.env.APP_DB_PASS || '123456',
    name: process.env.APP_DB_NAME || 'cleareye',
    ssl: [1, '1', true, 'true'].includes(process.env.APP_DB_SSL || ''),
  };

  azure = {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'default',
  };
}
