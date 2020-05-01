import { Injectable } from '@angular/core';
import { NotesService } from '../app/notes.service';
import { Note } from '../app/note';
import { of, Observable } from 'rxjs';

@Injectable()
export class MockNoteService extends NotesService {

  static testNotes: Note[] = [
    // Posted Notes
    {
      _id: 'first_id',
      owner_id: 'rachel_id',
      body: 'This is the first note',
      addDate: new Date(),
      expireDate: null,
      status: 'active'
    },
    {
      _id: 'second_id',
      owner_id: 'joe_id',
      body: 'This is the second note',
      addDate: new Date(),
      expireDate: null,
      status: 'active'
    },
    {
      _id: 'third_id',
      owner_id: 'james_id',
      body: 'This is the third note',
      addDate: new Date(),
      expireDate: null,
      status: 'active'
    },

    // Trashed Notes
    {
      _id: 'fourth_id',
      owner_id: 'rachel_id',
      body: 'This is the fourth note',
      addDate: new Date(),
      expireDate: null,
      status: 'deleted'
    },
    {
      _id: 'fifth_id',
      owner_id: 'joe_id',
      body: 'This is the fifth note',
      addDate: new Date(),
      expireDate: new Date(),
      status: 'deleted'
    },
    {
      _id: 'sixth_id',
      owner_id: 'james_id',
      body: 'This is the 6th note',
      addDate: new Date(),
      expireDate: null,
      status: 'deleted'
    },
    {
      _id: 'seventh_id',
      owner_id: 'kyle_id',
      body: 'This is the 7th note',
      addDate: new Date(),
      expireDate: null,
      status: 'deleted'
    }
  ];

  public static FAKE_BODY = 'This is definitely the note you wanted';


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
    return of('I just put your note in the database and this is its new ID');
  }

  editNote(note: Note, id: string) {
    return of(id);
  }

  getNoteById(id: string) {
    return of ({
      _id: id,
      owner_id: 'rachel_id',
      body: MockNoteService.FAKE_BODY,
      addDate: new Date(),
      expireDate: null,
      status: 'active',
    } as Note);
  }

  getOwnerNotes(filters: {
    owner_id?: string,
    status?: string;
  } = {}) {
    let notesToReturn = MockNoteService.testNotes;

    if (filters.owner_id !== null && filters.owner_id !== undefined) {
      notesToReturn = notesToReturn
        .filter(note => note.owner_id === filters.owner_id);
    }

    if (filters.status !== null && filters.status !== undefined) {
      notesToReturn = notesToReturn
        .filter(note => note.status === filters.status);
    }

    return of(notesToReturn);
  }
}
