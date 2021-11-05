import { Request } from 'hapi';
import { IMongoBase } from '../common/interface';
export interface ISampleResource extends IMongoBase {
  name: string;
  amount: number;
}
export interface ISampleResourceRequest extends Request {
  payload: ISampleResource;
}
