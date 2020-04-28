export interface Note {
  _id: string;
  owner_id: string;
  body: string;
  addDate: Date;
  expireDate: Date;
  status: string;
}
