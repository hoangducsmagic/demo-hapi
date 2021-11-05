import mongoose, { Document, Model, Schema } from 'mongoose';
import { ITrackingDocument } from './tracking.interface';

export type TrackingDocument = ITrackingDocument & Document;

export const TrackingLog = {
  _id: false,
  name: {
    required: true,
    type: String
  },
  time: {
    required: true,
    type: Number
  },
  duration: {
    required: true,
    type: Number
  },
  total: {
    required: true,
    type: Number
  }
};

const trackSchema: Schema = new Schema(
  {
    requestId: {
      type: String,
      required: true,
      index: true
    },
    batchId: {
      type: String,
      index: true
    },
    logs: {
      type: [TrackingLog],
      optional: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const TrackingModel: Model<TrackingDocument> = mongoose.model(
  'tracking',
  trackSchema,
  'tracking'
);
