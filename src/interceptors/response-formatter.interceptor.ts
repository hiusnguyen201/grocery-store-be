import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data?.data) return data;

        const { list = [], meta = {} } = data?.data;
        let formatter = { ...data, timestamp: new Date().toISOString() };
        if (Object.keys(meta).length > 0) {
          formatter = {
            ...formatter,
            data: list,
            meta,
          };
        }

        return formatter;
      }),
    );
  }
}
