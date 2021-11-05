import { getNamespace } from 'cls-hooked';
import { ITracking } from './tracking.interface';
import trackingRepository from './tracking.repository';
import trackingUtil from './tracking.util';
import { Tracing } from '../common/constant';
import { Request } from '@hapi/hapi';

export const isEnableTracking = (): boolean => {
  return [
    'default',
    'local',
    'dev',
    'uat',
    'preprod',
    'prepro',
    'pre',
    'pt'
  ].includes(process.env.NODE_ENV || '');
};

export const initializeTracking = (hapiRequest: Request) => {
  if (isEnableTracking() && hapiRequest) {
    // @ts-ignore
    hapiRequest.app[Tracing.TRACKING] = [
      {
        name: 'start',
        time: new Date(),
        duration: 0,
        total: 0
      }
    ];
  }
};

export const track = async (name: string) => {
  const session = getNamespace(Tracing.TRACER_SESSION);
  if (isEnableTracking() && session) {
    const currentLogs = session.get(Tracing.TRACKING);
    if (currentLogs) {
      session.set(
        Tracing.TRACKING,
        trackingUtil.addTrackingLog(name, currentLogs)
      );
    }
  }
};

export const saveTracking = async (hapiRequest?: Request) => {
  if (isEnableTracking() && hapiRequest) {
    track('end');
    // @ts-ignore
    const currentLogs = hapiRequest.app[Tracing.TRACKING];
    if (currentLogs && currentLogs.length && currentLogs.length > 2) {
      // @ts-ignore
      const requestId = hapiRequest.app[Tracing.REQUEST_ID];
      const tracking: ITracking = {
        requestId,
        batchId: hapiRequest.headers[Tracing.TRACKING_BATCH_ID] || undefined,
        logs: currentLogs
      };
      await trackingRepository.create(tracking);
    }
    // @ts-ignore
    delete hapiRequest.app[Tracing.TRACKING];
  }
};
