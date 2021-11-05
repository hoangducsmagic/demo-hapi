import { Job } from 'bull';

type runJobCallBack = (job: Job) => Promise<void | any>;

export { runJobCallBack };
