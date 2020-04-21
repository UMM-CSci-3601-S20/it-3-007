import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Note, MAXIMUM_BODY_LENGTH, MINIMUM_BODY_LENGTH } from '../note';
import { NotesService } from '../notes.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {Location} from '@angular/common';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  editNoteForm: FormGroup;

  note: Note;
  id: string;
  getNoteSub: Subscription;

  constructor(
    private fb: FormBuilder,
    private _location: Location,
    private noteService: NotesService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute) {
  }

  editNoteValidationMessages = {
    body: [
      {type: 'required', message: 'Body is required'},
      {type: 'minlength', message: `Body must be at least ${MINIMUM_BODY_LENGTH} characters long`},
      {type: 'maxlength', message: `Body cannot be more than ${MAXIMUM_BODY_LENGTH} characters long`}
    ]
  };

  createForms() {

    // edit note form validations
    this.editNoteForm = this.fb.group({
      body: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(MINIMUM_BODY_LENGTH),
        Validators.maxLength(MAXIMUM_BODY_LENGTH),
      ])),
    });

  }

   ngOnInit() {
    this.createForms();
    this.route.paramMap.subscribe((pmap) => {
      this.id = pmap.get('id');
      if (this.getNoteSub) {
        this.getNoteSub.unsubscribe();
      }
      this.getNoteSub = this.noteService.getNoteById(this.id).subscribe(retrievedNote => this.
        editNoteForm.get('body').setValue(retrievedNote.body));
    });
  }

  submitForm() {
    this.noteService.editNote(this.editNoteForm.value, this.id).subscribe(newID => {
      this.snackBar.open('Successfully edited note', null, {
        duration: 2000,
      });
      this._location.back();
    }, err => {
      this.snackBar.open('Failed to edit the note', null, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (this.getNoteSub) {
      this.getNoteSub.unsubscribe();
    }
  }

}
