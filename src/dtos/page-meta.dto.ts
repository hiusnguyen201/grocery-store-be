import { IPageMetaDtoParameters } from 'src/constants/interfaces';

export const PAGE_KEY = 'page';

export class PageMetaDto {
  readonly page: number;

  readonly limit: number;

  readonly offset: number;

  readonly totalPage: number;

  readonly totalCount: number;

  readonly isNext: boolean;

  readonly isPrevious: boolean;

  readonly previousUrl: string | null;

  readonly nextUrl: string | null;

  constructor({ req, page, limit, totalCount }: IPageMetaDtoParameters) {
    this.page = +page;
    this.limit = +limit;
    this.totalCount = +totalCount;
    this.offset = (this.page - 1) * this.limit;
    this.totalPage = Math.ceil(this.totalCount / this.limit);
    this.isPrevious = this.page > 1;
    this.isNext = this.page < this.totalPage;

    const params = new URLSearchParams(req.query as Record<string, string>);

    if (this.isPrevious) {
      params.set(PAGE_KEY, String(this.page - 1));
      this.previousUrl = req.baseUrl + req.path + '?' + params.toString();
    }

    if (this.isNext) {
      params.set(PAGE_KEY, String(this.page + 1));
      this.nextUrl = req.baseUrl + req.path + '?' + params.toString();
    }
  }
}
