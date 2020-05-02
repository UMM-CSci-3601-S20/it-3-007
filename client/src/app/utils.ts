import { HttpErrorResponse } from '@angular/common/http';
import { OperatorFunction, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Return an RxJS operator similar to catchError, except that it only
 * triggers if the error is an HttpErrorResponse with a given status code.
 *
 * (For example, you can use this operator to only handle not-found errors,
 * while letting other errors pass through.)
 */
export function handleHttpError<T, U>(
  status: number,
  handler: (err: HttpErrorResponse, caught: Observable<T>) => Observable<U>
): OperatorFunction<T, T | U> {
  return catchError((error: HttpErrorResponse, caught: Observable<T>) => {
    if (error.status === status) {
      return handler(error, caught);
    }
    return throwError(error);
  });
}
