export interface Note {
  _id: string;
  owner_id: string;
  body: string;
  posted: boolean;
}

/**
 * The length of a note's body should be less than or equal to this value.
 */
export const MAXIMUM_BODY_LENGTH = 1_000;

/**
 * The length of a note's body should be greater than or equal to this value.
 */
export const MINIMUM_BODY_LENGTH = 1;
