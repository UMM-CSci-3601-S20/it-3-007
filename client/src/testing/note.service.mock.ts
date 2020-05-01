import { Injectable } from '@angular/core';
import { NotesService } from '../app/notes.service';
import { Note } from '../app/note';
import { of, Observable } from 'rxjs';

export const professorJohnsonsNote: Note = {
  _id: 'first_id',
  owner_id: 'rachel_id',
  body: 'This is the first note',
  posted: true,
};

export const professorJohnsonsDeletedNote: Note = {
  _id: 'fourth_id',
  owner_id: 'rachel_id',
  body: 'This is the fourth note',
  posted: false,
};

@Injectable()
export class MockNoteService extends NotesService {
  static testNotes: Note[] = [
    // Posted Notes
    professorJohnsonsNote,
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
    professorJohnsonsDeletedNote,
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

  constructor() {
    super(null);
  }

  getOwnerNotes(filters: {
    owner_id?: string,
    posted?: boolean,
  } = {}): Observable<Note[]> {
    let notesToReturn = MockNoteService.testNotes.slice();
    if (filters.owner_id) {
      notesToReturn = notesToReturn.filter(
        (note => note.owner_id === filters.owner_id),
      );
    }
    if (filters.posted === true || filters.posted === false) {
      notesToReturn = notesToReturn.filter(
        (note => note.posted === filters.posted),
      );
    }
    return of(notesToReturn);
  }

  getNotes() {
    return of(MockNoteService.testNotes);
  }

  deleteNote(id: string) {
    return of(true);
  }

  permanentlyDeleteNote(id: string) {
    return of(true);
  }

  restoreNote(id: string) {
    return of(true);
  }

  addNote(note) {
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
