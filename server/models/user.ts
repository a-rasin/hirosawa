import { Schema, model, Document } from 'mongoose';

export interface User extends Document {
  username: string;
  hash: string;
}

const userSchema = new Schema<User>({
  username: { type: String, required: true },
  hash: { type: String, required: true },
});

export default model<User>('User', userSchema)
