export interface TagForm {
  isNew: boolean;
  tagName: string;
}

export interface TagData {
  _id: string;
  tagName: string;
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  updatedAt?: Date;
  createdAt?: Date;
}
