import { ITrackingLog } from './tracking.interface';

const addTrackingLog = (
  name: string,
  logs: ITrackingLog[] = []
): ITrackingLog[] => {
  const time = new Date();
  if (logs.length > 0) {
    const lastLog: ITrackingLog = logs[logs.length - 1];
    const d = time.getTime() - new Date(lastLog.time).getTime();
    const t = lastLog.total + d;

    logs.push({
      name,
      time,
      duration: d,
      total: t
    });
  } else {
    logs.push({
      name,
      time,
      duration: 0,
      total: 0
    });
  }
  return logs;
};

const trackingUtil = {
  addTrackingLog
};

export default trackingUtil;
