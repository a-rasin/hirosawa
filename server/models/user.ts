import { Schema, model, Document } from 'mongoose';

export interface User extends Document {
  username: string;
  hash: string;
  rawId?: string;
  publicKey?: string;
}

const userSchema = new Schema<User>({
  username: { type: String, required: true },
  hash: { type: String, required: true },
  rawId: { type: String, required: false },
  publicKey: { type: String, required: false },
});

export default model<User>('User', userSchema)
