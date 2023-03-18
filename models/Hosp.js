const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HospitalSchema = new Schema({
  hname: {
    type: String,
    required: [true, 'Plz provide your name'],
  },

  phn: {
    type: Number,
    required: [true, 'plz provide phone no'],
  },

  add: {
    type: String,
    required: [true, 'plz provide address'],
  },

  Hosp_id: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
})

module.exports = mongoose.model('Hosp', HospitalSchema)
