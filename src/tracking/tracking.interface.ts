import { IMongoBase } from '../common/interface';

export interface ITrackingLog {
  name: string;
  time: Date;
  duration: number;
  total: number;
}

export interface ITracking {
  requestId: string;
  batchId?: string;
  logs: ITrackingLog[];
}

export interface ITrackingDocument extends IMongoBase, ITracking {}
