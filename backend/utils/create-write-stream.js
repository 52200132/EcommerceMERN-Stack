import { createWriteStream, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import morgan from 'morgan';

const createLogsDirIfNotExists = () => {
  const logsDir = join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir);
  }
};

export const setUpWriteStream = (app, routeName) => {
  createLogsDirIfNotExists();
  const logStream = createWriteStream(join(process.cwd(), `logs/${routeName}.log`), { flags: 'a' });
  app.use(morgan('combined', { stream: logStream }));
};

export const setUpConsoleLogging = (app) => {
  app.use(morgan('dev'));
}
