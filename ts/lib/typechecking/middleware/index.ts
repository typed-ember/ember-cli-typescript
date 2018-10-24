import { Remote } from 'stagehand';
import { Application, Request, Response, NextFunction } from 'express';
import Project from 'ember-cli/lib/models/project';
import TypecheckWorker from '../worker';
import renderErrorPage from './render-error-page';

export const LIVE_RELOAD_PATH = '/ember-cli-live-reload.js';

export default class TypecheckMiddleware {
  constructor(private project: Project, private workerPromise: Promise<Remote<TypecheckWorker>>) {}

  public register(app: Application): void {
    app.use((...params) => this.handleRequest(...params));
  }

  private async handleRequest(request: Request, response: Response, next: NextFunction) {
    if (!request.accepts('html') || request.path === LIVE_RELOAD_PATH) {
      next();
      return;
    }

    let worker = await this.workerPromise;
    let { errors, failed } = await worker.getStatus();

    if (failed) {
      response.type('html');
      response.end(renderErrorPage(errors, this.environmentInfo()));
    } else {
      next();
    }
  }

  private environmentInfo(): string {
    let tsVersion = (this.project.require('typescript/package.json') as any).version;
    let ectsVersion = require(`${__dirname}/../../../../package`).version;

    return `typescript@${tsVersion}, ember-cli-typescript@${ectsVersion}`;
  }
}
