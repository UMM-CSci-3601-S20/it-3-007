export interface Owner {
  _id: string;
  name: string;
  officeNumber?: string;
  email: string;
  building?: string;
  x500: string;
}

// x500 is the part of an email address before the @
