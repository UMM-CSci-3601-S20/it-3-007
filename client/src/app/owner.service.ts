import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Owner } from './owner';
import { map } from 'rxjs/operators';

@Injectable()
export class OwnerService {
  // what the url will start with
  readonly ownerUrl: string = environment.API_URL + 'owner';

  constructor(private httpClient: HttpClient) {
  }

  getOwnerById(id: string): Observable<Owner> {
    return this.httpClient.get<Owner>(this.ownerUrl + '/' + id);
  }

  getOwnerByx500(x500: string): Observable<Owner> {
    return this.httpClient.get<Owner>(this.ownerUrl + '/x500/' + x500);
  }

  getOwnerByName(name: string): Observable<Owner> {
    return this.httpClient.get<Owner>(this.ownerUrl + '/' + name);
  }

  // Adds an owner to the collection
  addOwner(newOwner: Owner): Observable<string> {
    // Send post request to add a new owner with the owner data as the body.
    return this.httpClient.post<{ id: string }>(this.ownerUrl + '/new', newOwner).pipe(map(res => res.id));
  }
}
