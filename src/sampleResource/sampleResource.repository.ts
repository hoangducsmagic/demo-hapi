import {
  SampleResourceDocument,
  SampleResourceModel
} from './sampleResource.model';
import { ISampleResource } from './sampleResource.interface';

const create = async (
  sampleResource: ISampleResource
): Promise<SampleResourceDocument> => {
  const newSampleResource = await SampleResourceModel.create(sampleResource);
  return newSampleResource;
};

const getById = async (id: string): Promise<SampleResourceDocument | null> => {
  const sampleResource = await SampleResourceModel.findById(id).exec();
  return sampleResource;
};

const getPlainById = async (id: string): Promise<ISampleResource | null> => {
  const sampleResource = await SampleResourceModel.findById(id)
    .lean()
    .exec();
  return sampleResource;
};

const findOneAndUpdate = async (
  id: string,
  dataToUpdate: ISampleResource,
  isForceCreate: boolean = false
): Promise<SampleResourceDocument | null> => {
  const sampleResource = await SampleResourceModel.findOneAndUpdate(
    { _id: id },
    dataToUpdate,
    { upsert: isForceCreate, new: true }
  );
  return sampleResource;
};

const deleteOne = async (id: string): Promise<boolean> => {
  const result = await SampleResourceModel.deleteOne({ _id: id });
  return !!result.ok && !!result.n && result.n > 0;
};

const sampleResourceRepository = {
  create,
  getById,
  getPlainById,
  findOneAndUpdate,
  deleteOne
};

export default sampleResourceRepository;
