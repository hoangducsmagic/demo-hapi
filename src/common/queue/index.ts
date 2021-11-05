import bull, { QueueOptions, JobOptions, Queue, Job } from 'bull';
import { DefaultQueueOptions } from './constants';
import { runJobCallBack } from './type';

class QueueAction {
  private queue: Queue<any>;

  constructor(queueName: string, options: QueueOptions = {}) {
    const queueOptions = Object.assign(DefaultQueueOptions, options);
    this.queue = new bull(queueName, queueOptions);
  }
  /**
   * getBullQueue
   */

  public getBullQueue = () => {
    return this.queue;
  };

  /**
   * addJob
   */
  public addJob = async (
    jobName: string,
    data: object,
    jobOption: JobOptions = {}
  ) => {
    return this.queue.add(jobName, data, jobOption);
  };

  /**
   * getJob
   */
  public getJob = async (jobId: string) => {
    return this.queue.getJob(jobId);
  };

  /**
   * processing
   */
  public processing = async (jobName: string, runJob?: runJobCallBack) => {
    return this.queue.process(jobName, (job: Job, done: bull.DoneCallback) => {
      try {
        runJob && runJob(job);
        done();
      } catch (error) {
        done(error);
      }
    });
  };

  public closeQueue = async () => {
    this.queue.close();
  };
}

export default QueueAction;
