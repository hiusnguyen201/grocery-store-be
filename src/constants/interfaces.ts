import { Request } from 'express';

export interface IPageMetaDtoParameters {
  req: Request;
  page: number;
  limit: number;
  totalCount: number;
}
