import { TestBed } from '@angular/core/testing';

import { InterceptorService } from './interceptor.service';
import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('InterceptorService', () => {
  let service: InterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {provide: AuthService}
      ]
    });
    service = TestBed.inject(InterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
