import TypecheckWorker from '.';
import { launch } from 'stagehand/lib/adapters/child-process';

launch(new TypecheckWorker());
