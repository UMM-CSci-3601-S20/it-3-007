import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Owner } from './owner';
import { map } from 'rxjs/operators';
import * as jsPDF from 'jspdf';

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

  getPDF(name: string, x500: string): jsPDF {
    const url: string = environment.BASE_URL + '/' + x500;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    doc.setFontSize(18);
    doc.text(name + '\'s DoorBoard', (8.5 / 2), 4, { align: 'center' });
    doc.text(url, (8.5 / 2), 4.5, { align: 'center' });

    return doc;
  }
}
