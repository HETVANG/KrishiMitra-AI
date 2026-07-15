import { Schema, model } from 'mongoose';

const ForumSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    mediaUrl: { type: String }, // optional photo/video attachments
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Forum = model('Forum', ForumSchema);
