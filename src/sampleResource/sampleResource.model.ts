import mongoose, { Document, Model, Schema } from 'mongoose';
import { ISampleResource } from './sampleResource.interface';
import constant from './sampleResource.constant';

export type SampleResourceDocument = ISampleResource & Document;

const deliveryOrderSchema: Schema = new Schema(
  {
    name: {
      type: String,
      index: true,
      required: true
    },
    amount: {
      type: Number,
      index: true,
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const SampleResourceModel: Model<SampleResourceDocument> = mongoose.model(
  constant.MODEL_NAME,
  deliveryOrderSchema,
  constant.MODEL_NAME
);
