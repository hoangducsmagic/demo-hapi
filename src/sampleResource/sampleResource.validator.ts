//import { object, string, number } from '@hapi/joi';
//import Joi from '@hapi/joi';
const Joi = require('@hapi/joi');
import { RouteOptionsValidate } from '@hapi/hapi';

const idParamValiator = Joi.object({
  id: Joi.string().required()
});

const createValidator: RouteOptionsValidate = {
  payload: Joi.object({
    name: Joi.string().required(),
    amount: Joi.number()
      .integer()
      .required()
  })
};

const updateValidator: RouteOptionsValidate = {
  params: idParamValiator,
  payload: Joi.object({
    name: Joi.string().required(),
    amount: Joi.number()
      .integer()
      .required()
  })
};

const getValidator: RouteOptionsValidate = {
  params: idParamValiator
};

const deleteValidator: RouteOptionsValidate = {
  params: idParamValiator
};

export { createValidator, updateValidator, getValidator, deleteValidator };
