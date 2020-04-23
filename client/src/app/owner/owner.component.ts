import { Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Owner } from '../owner';
import { OwnerService } from '../owner.service';
import { Observable } from 'rxjs';
import { NotesService } from '../notes.service';
import { Note } from '../note';
import {Location} from '@angular/common';
import { AuthService, REDIRECT_URL } from '../authentication/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, concatMap, switchMap, catchError, tap, take, flatMap, share } from 'rxjs/operators';
import { handleHttpError } from '../utils';

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
// This class has access to the owner of the doorboard, and all the posts that said owner has made
export class OwnerComponent implements OnInit, AfterViewInit {
  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private _location: Location,
    private notesService: NotesService,
    private ownerService: OwnerService,
    private snackBar: MatSnackBar
  ) {}

  notes: Observable<Note[]>;
  owner: Observable<Owner>;
  id: Observable<string>;
  name: Observable<string>;
  x500: Observable<string>;

  retrieveNotes(): void {
    this.notes = this.owner.pipe(
      switchMap(owner => this.notesService.getOwnerNotes({owner_id: owner._id, posted: true})),
      map(notes => notes.reverse()),
      share(),
    );
  }

  deleteNote(id: string): void {
    this.notesService.deleteNote(id).subscribe(() => {
      this.retrieveNotes();
    });
  }

  ngOnInit(): void {
    this.x500 = this.auth.getUser$().pipe(map(returned => returned.nickname));

    this.owner = this.x500.pipe(
      switchMap(x500 => this.ownerService.getOwnerByx500(x500)),
      handleHttpError(404, () => this.newOwner()),
      share(),
    );

    this.retrieveNotes();
  }

  ngAfterViewInit(): void {
    this._location.replaceState(new URL(REDIRECT_URL).pathname);
  }

  savePDF(): void {
    this.owner.pipe(take(1)).subscribe(owner => {
      this.ownerService.getPDF(owner.name, owner.x500).save('DoorBoard.pdf');
    });
  }

  newOwner(): Observable<Owner> {
    return this.auth.getUser$().pipe(
      take(1),
      map(user => ({
        x500: user.nickname,
        email: user.email,
        name: user.name,
        _id: null,
        officeNumber: null,
        building: null
      })),
      flatMap(newOwner =>
        this.ownerService.addOwner(newOwner).pipe(
          map(newId => ({ ...newOwner, _id: newId })),
          tap({
            next: () => this.newUserSucceededSnackBar(),
            error: () => this.newUserFailedSnackBar(),
          }),
        )
      ),
    );
  }

  newUserSucceededSnackBar() {
    this.snackBar.open('Successfully created a new owner', null, {
      duration: 2000,
    });
  }

  newUserFailedSnackBar() {
    this.snackBar.open('Failed to create a new owner', null, {
      duration: 2000,
    });
  }
}
