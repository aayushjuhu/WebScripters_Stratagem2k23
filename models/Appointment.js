const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PatientSchema = new Schema({
  Hospital_id: {
    type: Schema.Types.ObjectId,
  },
  Patient_id: {
    type: Schema.Types.ObjectId,
    ref: 'patient',
  },
})

// AssignmentSchema.virtual("no", {
//   ref: "Order",
//   foreignField: "Order._id",
//   localField: "coupon",
//   justOne: true,
// });

module.exports = mongoose.model('Patient', PatientSchema)
