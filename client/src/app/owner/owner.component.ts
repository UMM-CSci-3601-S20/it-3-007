import { Component, OnInit, OnDestroy, AfterViewInit, Inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Owner } from '../owner';
import { OwnerService } from '../owner.service';
import { Observable } from 'rxjs';
import { NotesService } from '../notes.service';
import { Note } from '../note';
import { Location, } from '@angular/common';
import { AuthService, REDIRECT_URL } from '../authentication/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, switchMap, tap, take, flatMap, share } from 'rxjs/operators';
import { handleHttpError } from '../utils';

/**
 * You can give NgxPrint some CSS to apply to the div to be printed. (But you
 * actually have to use a JavaScript object shaped like a CSS rule-set.)
 */
type NgxPrintStyle = {
  [selector: string]: {
    [rule: string]: string
  }
};

@Component({
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.scss']
})
// This class has access to the owner of the doorboard, and all the posts that said owner has made
export class OwnerComponent implements OnInit, AfterViewInit {
  constructor(
    private route: ActivatedRoute,
    private _location: Location,
    private snackBar: MatSnackBar,
    public auth: AuthService,
    private notesService: NotesService,
    private ownerService: OwnerService,
  ) {}

  notes: Observable<Note[]>;
  owner: Observable<Owner>;
  id: Observable<string>;
  name: Observable<string>;
  x500: Observable<string>;

  /**
   * This is some CSS to be applied to the door sign when it's printed out.
   */
  readonly printStyle: NgxPrintStyle = {
    '*': {
      'text-align': 'center',
      'font-family': 'sans-serif',
      'font-weight': 'bold',
    },

    p: {
      'font-size': 'xx-large',
    },
  }

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
