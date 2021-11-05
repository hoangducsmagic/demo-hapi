import { HttpHeaders } from './constant';
const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

export enum PositionErrorInput {
  HEADERS = 'HEADERS',
  PARAMS = 'PARAMS',
  PAYLOAD = 'PAYLOAD'
}

export const MongooseBase = {
  _id: Joi.string().required(),
  createdAt: Joi.date()
    .required()
    .example('2020-10-10T00:00:00.000Z'),
  updatedAt: Joi.date()
    .required()
    .example('2020-10-15T00:00:00.000Z')
};

export const jwtValidator = Joi.object({
  [HttpHeaders.AUTH]: Joi.string()
    .trim()
    .required()
}).options({ allowUnknown: true });

export const paramIdValidator = Joi.object({
  id: Joi.objectId()
    .required()
    .example('5f0fe465d994dc16c3c78bac')
});

export const InvalidInputResponse = (positionError: PositionErrorInput) =>
  Joi.object({
    statusCode: 400,
    error: 'Bad Request',
    message: `Invalid request ${positionError.toLowerCase()} input`
  });

export const jwtValidatorResponse = Joi.object({
  accessToken: Joi.string()
    .trim()
    .required(),
  idToken: Joi.string().trim(),
  refreshToken: Joi.string().trim()
});
