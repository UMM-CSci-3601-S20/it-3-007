export interface Note extends NewNote {
  _id: string;
  addDate: Date;
}


/**
 * When we create a new note, not all of the fields exist yet. Some of
 * them are left for the server to fill in.
 */
export interface NewNote {
  body: string;
  expireDate: Date;
  status: NoteStatus;
}


export type NoteStatus = 'active' | 'deleted';
