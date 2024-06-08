import * as path from 'path';

export const MIGRATION_TABLE_NAME = 'migrations';
export const MIGRATION_PATH = path.join(__dirname + '/migrations/*.{ts,js}');
export const ENTITIES_PATHS = [path.join(__dirname + '/**/*.entity.{ts,js}')];


