const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PatientSchema = new Schema({
  fname: {
    type: String,
    required: [true, 'Plz provide your name'],
  },
  frname: {
    type: String,
    required: [true, 'Plz provide father name'],
  },
  lname: {
    type: String,
    required: [true, 'Plz provide last name'],
  },
  ht: {
    type: Number,
    required: [true, 'Plz provide Height'],
  },
  gen: {
    type: String,
    enum: ['M', 'F', 'O'],
    required: [true, 'plz provide gender'],
  },
  st: {
    type: String,
    required: [true, 'plz provide state'],
  },
  adno: {
    type: Number,
    required: [true, 'plz provide aadhar no'],
  },
  mname: {
    type: String,
    required: [true, 'Plz provide mother name'],
  },
  phn: {
    type: Number,
    required: [true, 'plz provide phone no'],
  },
  wt: {
    type: Number,
    required: [true, 'Plz provide weight'],
  },
  add: {
    type: String,
    required: [true, 'plz provide address'],
  },
  zc: {
    type: Number,
    required: [true, 'A pin code is required'],
  },
  photo: {
    name: String,
    data: Buffer,
    contentType: String,
  },
  Patient_id: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
})

// AssignmentSchema.virtual("no", {
//   ref: "Order",
//   foreignField: "Order._id",
//   localField: "coupon",
//   justOne: true,
// });

module.exports = mongoose.model('Patient', PatientSchema)
