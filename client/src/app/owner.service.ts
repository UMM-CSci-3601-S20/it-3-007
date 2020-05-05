import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Owner } from './owner';
import { map } from 'rxjs/operators';

@Injectable()
export class OwnerService {
  // what the url will start with
  readonly ownerUrl: string = environment.API_URL + '/owner';

  constructor(private httpClient: HttpClient) {
  }

  getOwnerById(id: string): Observable<Owner> {
    return this.httpClient.get<Owner>(this.ownerUrl + '/' + id);
  }

  getOwnerByx500(x500: string): Observable<Owner> {
    return this.httpClient.get<Owner>(this.ownerUrl + '/x500/' + x500);
  }

  // Adds an owner to the collection
  addOwner(newOwner: Owner): Observable<string> {
    // Send post request to add a new owner with the owner data as the body.
    return this.httpClient.post<{ id: string }>(this.ownerUrl + '/new', newOwner).pipe(map(res => res.id));
  }

  getSignUrl(name: string, x500: string): string {
    const queryString: string = new URLSearchParams({ name, x500 }).toString();
    return `${environment.API_URL}/sign?${queryString}`;
  }
}
