import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Note } from '../note';
import { Owner } from '../owner';
import { NotesService } from '../notes.service';
import { OwnerService } from '../owner.service';
import { AuthService } from '../authentication/auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss']
})
export class AddNoteComponent implements OnInit {

  addNoteForm: FormGroup;

  note: Note;

  owner: Owner;
  getOwnerSub: Subscription;
  getx500Sub: Subscription;
  x500: string;

  constructor(private fb: FormBuilder, private noteService: NotesService, private snackBar: MatSnackBar,
      private router: Router, private ownerService: OwnerService, private auth: AuthService) {
  }

  addNoteValidationMessages = {
    body: [
      {type: 'required', message: 'Body is required'},
      {type: 'minlength', message: 'Body must be at least 2 characters long'},
      {type: 'maxlength', message: 'Body cannot be more than 300 characters long'}
    ]
  };

  createForms() {

    // add note form validations
    this.addNoteForm = this.fb.group({
      body: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(300),
      ])),
    });
  }

  async retrieveOwner(): Promise<void> {
    this.getx500Sub = await this.auth.getUser$().subscribe(returned  => {
      this.x500 = returned.nickname;
    });
    this.getOwnerSub = this.ownerService.getOwnerByx500(this.x500).subscribe(returnedOwner => {
      this.owner = returnedOwner;
    }, err => {
      console.log(err);
    });
  }

  ngOnInit() {
    this.createForms();
    this.retrieveOwner();
  }

  submitForm() {
    let newNote: Note = this.addNoteForm.value;
    newNote.owner_id = this.owner._id;
    newNote.posted = true;
    this.noteService.addNote(newNote).subscribe(newID => {
      this.snackBar.open('Successfully added note', null, {
        duration: 2000,
      });
      this.router.navigate(['']);
    }, err => {
      this.snackBar.open('Failed to add the note', null, {
        duration: 2000,
      });
    });
  }

}
