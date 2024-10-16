import mongoose, { Schema, Document, Model } from 'mongoose';

interface IAction  {
  trx_id: string;
  block_time: string;
  block_num: number;
}

const ActionSchema: Schema = new Schema<IAction>({
  trx_id: { type: String, required: true, unique: true },
  block_time: { type: String, required: true },
  block_num: { type: Number, required: true }
});
type ActionModel = Model<IAction>

const Action = mongoose.model<IAction, ActionModel>('Action', ActionSchema);

export default Action;
