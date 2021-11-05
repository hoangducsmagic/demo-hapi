import { TrackingModel, TrackingDocument } from './tracking.model';
import { ITracking } from './tracking.interface';

const documentToObject = (document: TrackingDocument) =>
  document.toObject({ getters: true, virtuals: true, versionKey: false });

const findOneTracking = async (requestId: string) => {
  const trackingDoc = await TrackingModel.findOne({
    requestId: requestId
  }).exec();
  return trackingDoc && documentToObject(trackingDoc);
};

const findAndUpdate = async (requestId: string, data: ITracking) => {
  return await TrackingModel.findOneAndUpdate({ requestId: requestId }, data);
};

const create = async (data: ITracking) => {
  return await TrackingModel.create(data as any);
};

const integrationLogRepository = {
  findOneTracking,
  findAndUpdate,
  create
};

export default integrationLogRepository;
