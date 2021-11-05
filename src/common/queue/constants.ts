import { QueueOptions, JobOptions, RateLimiter, AdvancedSettings } from 'bull';
import config from '../../config';

const RateLimit: RateLimiter = {
  max: 5, // Max number of jobs processed
  duration: 2000, // per duration in milliseconds
  bounceBack: false // When jobs get rate limited, they stay in the waiting queue and are not moved to the delayed queue
};

const AdvSettings: AdvancedSettings = {
  lockDuration: 30000, // Key expiration time for job locks.
  lockRenewTime: 15000, // Interval on which to acquire the job lock
  stalledInterval: 30000, // How often check for stalled jobs (use 0 for never checking).
  maxStalledCount: 1, // Max amount of times a stalled job will be re-processed.
  guardInterval: 5000, // Poll interval for delayed jobs and added jobs.
  retryProcessDelay: 5000, // delay before processing next job in case of internal error.
  backoffStrategies: {}, // A set of custom backoff strategies keyed by name.
  drainDelay: 5 // A timeout for when the queue is in drained state (empty waiting for jobs).
};

const JobOpts: JobOptions = {
  // priority: number, // Optional priority value. ranges from 1 (highest priority) to MAX_INT  (lowest priority). Note that
  // using priorities has a slight impact on performance, so do not use it if not required.

  // delay: number, // An amount of milliseconds to wait until this job can be processed. Note that for accurate delays, both
  // server and clients should have their clocks synchronized. [optional].

  attempts: 1, // The total number of attempts to try the job until it completes.

  // repeat: RepeatOpts, // Repeat job according to a cron specification.

  // backoff: number | BackoffOpts, // Backoff setting for automatic retries if the job fails

  // lifo: boolean, // if true, adds the job to the right of the queue instead of the left (default false)
  // timeout: number, // The number of milliseconds after which the job should be fail with a timeout error [optional]

  // jobId: number | string, // Override the job ID - by default, the job ID is a unique
  // integer, but you can use this setting to override it.
  // If you use this option, it is up to you to ensure the
  // jobId is unique. If you attempt to add a job with an id that
  // already exists, it will not be added.

  removeOnComplete: true, // If true, removes the job when it successfully
  // completes. A number specified the amount of jobs to keep. Default behavior is to keep the job in the completed set.

  removeOnFail: true // If true, removes the job when it fails after all attempts. A number specified the amount of jobs to keep
  // Default behavior is to keep the job in the failed set.
  // stackTraceLimit: number, // Limits the amount of stack trace lines that will be recorded in the stacktrace.
};

const DefaultQueueOptions: QueueOptions = {
  limiter: RateLimit,
  redis: config.redis.uri,
  // prefix: string, // prefix for all queue keys.
  defaultJobOptions: JobOpts,
  settings: AdvSettings
};

export { DefaultQueueOptions };
