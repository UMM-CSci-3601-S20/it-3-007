import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Note, NewNote } from './note';
import { Observable, throwError, of, OperatorFunction } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { handleHttpError } from './utils';


@Injectable({
  providedIn: 'root'
})

export class NotesService {

  readonly noteUrl: string = environment.API_URL + '/notes';
  readonly addNoteUrl: string = environment.API_URL + '/new/notes'
  readonly deleteNoteUrl: string = environment.API_URL + '/notes/delete'

  constructor(private httpClient: HttpClient) {}


  getOwnerNotes(filters: { owner_id?: string, status?: string } = {}): Observable<Note[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters.owner_id) {
      httpParams = httpParams.set('owner_id', filters.owner_id);
    }
    if (filters.status) {
      httpParams = httpParams.set('status', filters.status);
    }
    return this.httpClient.get<Note[]>(this.noteUrl, {
      params: httpParams,
    });
  }


  addNote(newNote: NewNote): Observable<string> {
    return this.httpClient.post<{id: string}>(environment.API_URL + 'new/notes', newNote).pipe(map(res => res.id));
  }

  /**
   * Delete a note by ID from the database.
   *
   * @return true if the note was deleted, and false if the note wasn't
   *   deleted (eg, if the ID you gave didn't correspond to a note in the
   *   database.)
   *
   * Usually, you can just ignore the return value.
   */
  deleteNote(id: string): Observable<boolean> {
    const response =
      this.httpClient.delete(`${this.noteUrl}/${encodeURI(id)}`);

    // Note that functions without arguments will just ignore any inputs given
    // to them.
    return response.pipe(
      map(() => true),
      handleHttpError(404, () => of(false)),
    );
  }

  permanentlyDeleteNote(id: string): Observable<boolean> {
    const response =
      this.httpClient.delete(`${this.deleteNoteUrl}/${encodeURI(id)}`);

    return response.pipe(
      map(() => true),
      handleHttpError(404, () => of(false)),
    );
  }

  restoreNote(id: string): Observable<boolean> {
    const response =
      this.httpClient.post(`${this.noteUrl}/${encodeURI(id)}`, null);

    return response.pipe(
      map(() => true),
      handleHttpError(404, () => of(false)),
    );
  }



  editNote(editNote: Note, id: string): Observable<string> {
    return this.httpClient.post<{id: string}>(this.noteUrl + '/edit/' + id, editNote).pipe(map(res => res.id));
  }

  getNoteById(id: string): Observable<Note> {
    return this.httpClient.get<Note>(this.noteUrl + '/' + id);
  }

  filterNotes(notes: Note[], filters: {
    status?: string
  }): Note[] {
    if (filters.status) {
      notes = notes.filter(note => note.status === filters.status);
    }
    return notes;
  }
  // We could simplify that if statement using a ==, but I've left it
  // in its expanded form for explicitness' sake.
}
