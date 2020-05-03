import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Owner } from '../app/owner';
import { OwnerService } from '../app/owner.service';
import { AuthService } from 'src/app/authentication/auth.service';
import { professorJohnson } from './auth.service.mock';

export const professorJohnsonOwnerInfo: Owner = {
  _id: 'rachel_id',
  name: professorJohnson.name,
  officeNumber: '1234',
  email: professorJohnson.email,
  building: 'Science',
  x500: professorJohnson.nickname,
  sub: 'rachel_sub'
};

/**
 * A "mock" version of the `OwnerService` that can be used to test components
 * without having to create an actual service.
 */
@Injectable()
export class MockOwnerService extends OwnerService {
  static testOwners: Owner[] = [
    professorJohnsonOwnerInfo,
    {
      _id: 'joe_id',
      name: 'Joe Beaver',
      officeNumber: '5678',
      email: 'jbeaver@morris.umn.edu',
      building: 'Imholte',
      x500: 'jbeaver',
      sub: 'joe_sub'
    },
    {
      _id: 'james_id',
      name: 'James Flegel',
      officeNumber: '9012',
      email: 'fleg0003@morris.umn.edu',
      building: 'HFA',
      x500: 'fleg0003',
      sub: 'james_sub'
    },
    {
      _id: 'kyle_id',
      name: 'Kyle Fluto',
      officeNumber: '2716',
      email: 'fluto006@umn.edu',
      building: 'Science',
      x500: 'fluto006',
      sub: 'kyle_sub'
    }
  ];

  constructor() {
    super(null);
  }
  // no filters here yet, don't know what we want to have the database filter for us
  getOwners(filters: {  }): Observable<Owner[]> {
    // Just return the test owners regardless of what filters are passed in
    return of(MockOwnerService.testOwners);
  }

  getOwnerById(id: string): Observable<Owner> {
    // If the specified ID is for the first test owner,
    // return that owner, otherwise return `null` so
    // we can test illegal owner requests.
    if (id === MockOwnerService.testOwners[0]._id) {
      return of(MockOwnerService.testOwners[0]);
    } else {
      return of(null);
    }
  }

  getOwnerByx500(x500: string): Observable<Owner> {
    // If the specified ID is for the first test owner,
    // return that owner, otherwise return `null` so
    // we can test illegal owner requests.
    if (x500 === MockOwnerService.testOwners[0].x500) {
      return of(MockOwnerService.testOwners[0]);
    } else {
      return of(null);
    }
  }
}
