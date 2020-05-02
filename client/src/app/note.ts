export interface Note extends NewNote {
  _id: string;
  addDate: Date;
}


/**
 * When we create a new note, not all of the fields exist yet. Some of
 * them are left for the server to fill in.
 */
export interface NewNote {
  owner_id: string;
  body: string;
  status: NoteStatus;
  expireDate?: Date;
}


export type NoteStatus = 'active' | 'deleted';

/**
 * The length of a note's body should be less than or equal to this value.
 */
export const MAXIMUM_BODY_LENGTH = 1_000;

/**
 * The length of a note's body should be greater than or equal to this value.
 */
export const MINIMUM_BODY_LENGTH = 1;

