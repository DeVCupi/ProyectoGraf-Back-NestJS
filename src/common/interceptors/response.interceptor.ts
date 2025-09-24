import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
      return next.handle().pipe(
        map((data) => {
          // Si el controlador ya devuelve un objeto con success, message, content, no tocarlo
          if (
            data &&
            typeof data === 'object' &&
            'success' in data &&
            'content' in data
          ) {
            return data;
          }
  
          // Si no, envolverlo automáticamente
          return {
            success: true,
            message: 'Operación exitosa',
            content: data,
          };
        }),
      );
    }
  }