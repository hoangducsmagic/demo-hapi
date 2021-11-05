//import logger from '../logger';
import { ISampleResource } from './sampleResource.interface';
import { AppError } from '../common/error/AppError';
import { ERROR_CODE } from '../common/errors';
import sampleResourceRepository from './sampleResource.repository';
import { SampleResourceDocument } from './sampleResource.model';
// import { track } from '../tracking/tracking.service';

export class SampleResourceService {
  public async create(data: ISampleResource): Promise<SampleResourceDocument> {
    try {
      return await sampleResourceRepository.create(data);
    } catch (error) {
      throw new AppError(ERROR_CODE.INVALID_REQUEST, error);
    }
  }

  public async get(id: string): Promise<SampleResourceDocument> {
    const data = await sampleResourceRepository.getById(id);
    if (!data) {
      throw new AppError(ERROR_CODE.NOT_FOUND);
    }
    return data;
  }

  public async update(
    id: string,
    data: ISampleResource
  ): Promise<SampleResourceDocument> {
    const updated = await sampleResourceRepository.findOneAndUpdate(id, data);
    if (!updated) {
      throw new AppError(ERROR_CODE.HAVE_NO_UPDATED);
    }
    return updated;
  }

  public async updatePartial(
    id: string,
    data: SampleResourceDocument
  ): Promise<SampleResourceDocument> {
    const resource = await sampleResourceRepository.getById(id);
    if (!resource) {
      throw new AppError(ERROR_CODE.NOT_FOUND);
    }
    try {
      resource.name = data.name;
      resource.amount = data.amount;
      resource.save();
    } catch (error) {
      throw new AppError(ERROR_CODE.INTERNAL_ERROR, error);
    }
    return resource;
  }

  public async delete(id: string): Promise<boolean> {
    const updated = await sampleResourceRepository.deleteOne(id);
    if (!updated) {
      throw new AppError(ERROR_CODE.HAVE_NO_UPDATED);
    }
    return updated;
  }

  public async updateTopicMessage(
    data: ISampleResource
  ): Promise<ISampleResource> {
    return data;
  }

  public async raiseError(): Promise<void> {
    throw new AppError(ERROR_CODE.HAVE_NO_UPDATED);
  }

  public async raiseOriginalError(): Promise<void> {
    throw new Error(ERROR_CODE.HAVE_NO_UPDATED);
  }
}

export const sampleResourceService = new SampleResourceService();
