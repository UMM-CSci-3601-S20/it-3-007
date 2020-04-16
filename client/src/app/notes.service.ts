import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Note } from './note';
import { Observable, throwError, of, OperatorFunction } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class NotesService {

  readonly noteUrl: string = environment.API_URL + 'notes';
  readonly addNoteUrl: string = environment.API_URL + 'new/notes'
  readonly deleteNoteUrl: string = environment.API_URL + 'notes/delete'

  constructor(private httpClient: HttpClient) {}

  // getNotes() {
  //   return this.httpClient.get<Note[]>(this.noteUrl);
  // }

  getOwnerNotes(filters: { owner_id?: string, posted?: boolean } = {}): Observable<Note[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters.owner_id) {
      httpParams = httpParams.set('owner_id', filters.owner_id);
    }
    if (filters.posted === true || filters.posted === false) {
      httpParams = httpParams.set('posted', filters.posted.toString());
    }
    return this.httpClient.get<Note[]>(this.noteUrl, {
      params: httpParams,
    });
  }

  addNote(newNote: Note): Observable<string> {
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
    const response = this.httpClient.delete(`${this.noteUrl}/${encodeURI(id)}`)

    // Note that functions without arguments will just ignore any inputs given
    // to them.
    return response.pipe(
      map(() => true),
      this.handleHttpError(404, () => of(false)),
    );
  }

  permanentlyDeleteNote(id: string): Observable<boolean> {
    type PermDeleteResponse = 'removed from trash' | 'failed to remove from trash';

    const response = this.httpClient.delete(
      this.deleteNoteUrl + '/' + encodeURI(id),
      {
        responseType: 'text',
      },
    ) as Observable<PermDeleteResponse>;

    return response.pipe(map(theResponse => theResponse === 'removed from trash'));
  }

  restoreNote(id: string): Observable<boolean> {
    type RestoreResponse = 'restored note' | 'failed to restore note';

    const response = this.httpClient.post(
      this.noteUrl + '/' + encodeURI(id),
      {
        responseType: 'text',
      },
    ) as Observable<RestoreResponse>;

    return response.pipe(map(theResponse => theResponse === 'restored note'));
  }



  editNote(editNote: Note, id: string): Observable<string> {
    return this.httpClient.post<{id: string}>(this.noteUrl + '/edit/' + id, editNote).pipe(map(res => res.id));
  }

  getNoteById(id: string): Observable<Note> {
    return this.httpClient.get<Note>(this.noteUrl + '/' + id);
  }

  filterNotes(notes: Note[], filters: {
    posted?: boolean
  }): Note[] {
    // Filter by trash field
    if (filters.posted === true) {
      console.log('posted notes');

      notes = notes.filter(note => {
        return note.posted.valueOf() === true;
      });
    }
    return notes;
  }

  /**
   * Return an RxJS operator similar to catchError, except that it only
   * triggers if the error is an HttpErrorResponse with a given status code.
   *
   * (For example, you can use this operator to only handle not-found errors,
   * while letting other errors pass through.)
   */
  private handleHttpError<T, U>(
    status: number,
    handler: (err: HttpErrorResponse, caught: Observable<T>) => Observable<U>
  ): OperatorFunction<T, T | U> {
    return catchError((error: HttpErrorResponse, caught: Observable<T>) => {
      if (error.status === status) {
        return handler(error, caught);
      }
      return throwError(error);
    });
  }
}
