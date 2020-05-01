import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { NewNote, Note, MAXIMUM_BODY_LENGTH, MINIMUM_BODY_LENGTH } from '../note';

import { Owner } from '../owner';
import { NotesService } from '../notes.service';
import { OwnerService } from '../owner.service';
import { AuthService } from '../authentication/auth.service';
import { of, Observable, combineLatest } from 'rxjs';
import { catchError, map, switchMap, flatMap } from 'rxjs/operators';


@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss']
})
export class AddNoteComponent implements OnInit {

  addNoteForm: FormGroup;

  note: Note;

  owner: Observable<Owner>;
  x500: Observable<string>;

  constructor(private fb: FormBuilder, private noteService: NotesService, private snackBar: MatSnackBar,
              private router: Router, private ownerService: OwnerService, private auth: AuthService) {
  }

  addNoteValidationMessages = {
    body: [
      {type: 'required', message: 'Body is required'},
      {type: 'minlength', message: `Body must be at least ${MINIMUM_BODY_LENGTH} characters long`},
      {type: 'maxlength', message: `Body cannot be more than ${MAXIMUM_BODY_LENGTH} characters long`},
    ]
  };

  createForms() {

    // add note form validations
    this.addNoteForm = this.fb.group({
      body: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(MINIMUM_BODY_LENGTH),
        Validators.maxLength(MAXIMUM_BODY_LENGTH),
      ])),
    });
  }

  ngOnInit() {
    this.x500 = this.auth.getUser$().pipe(map(user => user.nickname));

    this.owner = this.x500.pipe(
      switchMap(x500 => this.ownerService.getOwnerByx500(x500)),
      catchError(error => {
        console.log(error);
        return of(undefined);
      }),
    );

    this.createForms();
  }

  submitForm() {

    combineLatest([of(this.addNoteForm.value), this.owner]).pipe(
      map(([newNote, owner]) => ({
        ...newNote,
        status: active,
        owner_id: owner._id,
      })),
      flatMap(newNote => {
        return this.noteService.addNote(newNote);
      }),
    ).subscribe(() => {
      this.showGoodSnackBar();
      this.router.navigate(['']);
    }, err => {
      this.showBadSnackBar();
    });
  }

  showGoodSnackBar(): void {
    this.snackBar.open('Successfully added note', null, {
      duration: 2000,
    });
  }

  showBadSnackBar(): void {
    this.snackBar.open('Failed to add the note', null, {
      duration: 2000,
    });
  }
}
