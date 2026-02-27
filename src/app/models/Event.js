import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  title: { type: String, required: true },
  thumbnail: { type: String },
  date: { type: String, required: true },
  year: { type: Number, required: true },
  coordinates: { type: Object, default: null },
  category: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model('Event', eventSchema, 'events');
