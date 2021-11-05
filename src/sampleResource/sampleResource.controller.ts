import { ServerRoute, ResponseToolkit } from '@hapi/hapi';
import { sampleResourceService } from './sampleResource.service';
import {
  createValidator,
  deleteValidator,
  getValidator,
  updateValidator
} from './sampleResource.validator';
import http from '../common/http';
import config from '../config';
import constant from './sampleResource.constant';
import { ISampleResourceRequest } from './sampleResource.interface';
import logger from '../logger';

const create: ServerRoute = {
  method: http.Method.POST,
  path: `/${config.servicePath}/${constant.RESOURCE_PATH}`,
  options: {
    description: 'Create resource',
    tags: ['api', config.servicePath],
    validate: createValidator,
    handler: async (request: ISampleResourceRequest, h: ResponseToolkit) => {
      const data = await sampleResourceService.create(request.payload);
      return h.response(data).code(http.StatusCode.CREATED);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [http.StatusCode.CREATED]: {
            description: 'Created'
          }
        }
      }
    }
  }
};

const get: ServerRoute = {
  method: http.Method.GET,
  path: `/${config.servicePath}/${constant.RESOURCE_PATH}/{id}`,
  options: {
    description: 'Get resource',
    tags: ['api', config.servicePath],
    validate: getValidator,
    handler: async (request: ISampleResourceRequest, h: ResponseToolkit) => {
      const data = await sampleResourceService.get(request.params.id);
      return h.response(data).code(http.StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [http.StatusCode.CREATED]: {
            description: 'Created'
          }
        }
      }
    }
  }
};

const update: ServerRoute = {
  method: http.Method.PUT,
  path: `/${config.servicePath}/${constant.RESOURCE_PATH}/{id}`,
  options: {
    description: 'Update resource',
    tags: ['api', config.servicePath],
    validate: updateValidator,
    handler: async (request: ISampleResourceRequest, h: ResponseToolkit) => {
      const data = await sampleResourceService.update(
        request.params.id,
        request.payload
      );
      return h.response(data).code(http.StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [http.StatusCode.CREATED]: {
            description: 'Created'
          }
        }
      }
    }
  }
};

const updatePartial: ServerRoute = {
  method: http.Method.PATCH,
  path: `/${config.servicePath}/${constant.RESOURCE_PATH}/{id}`,
  options: {
    description: 'Update resource',
    tags: ['api', config.servicePath],
    validate: updateValidator,
    handler: async (request: ISampleResourceRequest, h: ResponseToolkit) => {
      const data = await sampleResourceService.update(
        request.params.id,
        request.payload
      );
      return h.response(data).code(http.StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [http.StatusCode.CREATED]: {
            description: 'Created'
          }
        }
      }
    }
  }
};

const deleteOne: ServerRoute = {
  method: http.Method.DELETE,
  path: `/${config.servicePath}/${constant.RESOURCE_PATH}/{id}`,
  options: {
    description: 'Delete resource',
    tags: ['api', config.servicePath],
    validate: deleteValidator,
    handler: async (request: ISampleResourceRequest, h: ResponseToolkit) => {
      const data = await sampleResourceService.delete(request.params.id);
      return h.response({ result: data }).code(http.StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [http.StatusCode.OK]: {
            description: 'Deleted'
          }
        }
      }
    }
  }
};

const error1: ServerRoute = {
  method: http.Method.GET,
  path: `/${config.servicePath}/${constant.RESOURCE_PATH}/error1`,
  options: {
    description: 'Get resource',
    tags: ['api', config.servicePath],
    handler: async (request: ISampleResourceRequest, h: ResponseToolkit) => {
      logger.info(request.payload as any);
      await sampleResourceService.raiseError();
      return h.response().code(http.StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [http.StatusCode.CREATED]: {
            description: 'Created'
          }
        }
      }
    }
  }
};

const error2: ServerRoute = {
  method: http.Method.GET,
  path: `/${config.servicePath}/${constant.RESOURCE_PATH}/error2`,
  options: {
    description: 'Get resource',
    tags: ['api', config.servicePath],
    handler: async (request: ISampleResourceRequest, h: ResponseToolkit) => {
      logger.info(request.payload as any);
      await sampleResourceService.raiseOriginalError();
      return h.response().code(http.StatusCode.OK);
    },
    plugins: {
      'hapi-swagger': {
        responses: {
          [http.StatusCode.CREATED]: {
            description: 'Created'
          }
        }
      }
    }
  }
};

const sampleResourceController: ServerRoute[] = [
  create,
  get,
  update,
  updatePartial,
  deleteOne,
  error1,
  error2
];
export default sampleResourceController;
