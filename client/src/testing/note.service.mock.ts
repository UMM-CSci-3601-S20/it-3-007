import { Injectable } from '@angular/core';
import { NotesService } from '../app/notes.service';
import { Note } from '../app/note';
import { of } from 'rxjs';

@Injectable()
export class MockNoteService extends NotesService {

  static testNotes: Note[] = [
    // Posted Notes
    {
      _id: 'first_id',
      owner_id: 'rachel_id',
      body: 'This is the first note',
      posted: true
    },
    {
      _id: 'second_id',
      owner_id: 'joe_id',
      body: 'This is the second note',
      posted: true
    },
    {
      _id: 'third_id',
      owner_id: 'james_id',
      body: 'This is the third note',
      posted: true
    },

    // Trashed Notes
    {
      _id: 'fourth_id',
      owner_id: 'rachel_id',
      body: 'This is the fourth note',
      posted: false
    },
    {
      _id: 'fifth_id',
      owner_id: 'joe_id',
      body: 'This is the fifth note',
      posted: false
    },
    {
      _id: 'sixth_id',
      owner_id: 'james_id',
      body: 'This is the 6th note',
      posted: false
    },
    {
      _id: 'seventh_id',
      owner_id: 'kyle_id',
      body: 'This is the 7th note',
      posted: false
    }
  ];

  public static FAKE_BODY = 'This is definitely the note you wanted';

  // This field gets set whenever you call addNote.
  public mostRecentlyPostedNote: Note;

  constructor() {
    super(null);
  }

  getNotes() {
    return of(MockNoteService.testNotes);
  }

  deleteNote(id: string) {
    return of(true);
  }

  addNote(note) {
    this.mostRecentlyPostedNote = note;
    return of('I just put your note in the database and this is its new ID');
  }

  editNote(note: Note, id: string) {
    return of(id);
  }

  getNoteById(id: string) {
    return of({
      _id: id,
      owner_id: 'rachel_id',
      body: MockNoteService.FAKE_BODY,
      posted: true,
    });
  }
}
