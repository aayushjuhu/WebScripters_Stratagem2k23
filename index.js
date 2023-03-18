if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const express = require('express')
const app = express()
const couponRoute = require('./route/CouponRoute')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const userRoutes = require('./route/user')
const { urlencoded } = require('body-parser')
const passport = require('passport')
const localpassport = require('passport-local')
const User = require('./models/user')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const verifyRoute = require('./route/verify')
const dashboardRoute = require('./route/dashboard')
const cors = require('cors')
const multer = require('multer')
const FormData = require('form-data')
const axios = require('axios')
const upload = multer()
const Patient = require('./models/Patient')
const Hospital = require("./models/Hosp");
const Appointment = require("./models/Appointment");
app.use(
  cors({
    origin: '*',
  }),
)
app.use(express.json())
app.use(bodyParser.json())

var jsonParser = bodyParser.json()

app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.engine('ejs', engine)
app.set('views', path.join(__dirname, 'views'))
app.use(methodOverride('_method'))
const dbUrl = process.env.ATLAS
const secret = process.env.SECRET || 'thisshouldbeabettersecret'

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
})

store.on('error', function (e) {
  console.log('Session Store Error', e)
})

const sessionConfig = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localpassport(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')

  next()
})

app.use(express.static(__dirname + '/public'))

app.get('/', async (req, res) => {
  res.render('users/index')
})

app.use('/', userRoutes)
app.use('/dashboard', dashboardRoute)
app.use('/generate-coupons', couponRoute)
app.use('/copoun/:comp_id', verifyRoute)
app.get('/final', async (req, res) => {
  res.render('users/finale')
})
app.get('/users/photo', async (req, res) => {
  res.render('users/photo')
})
app.get('/verify/user/:id', async (req, res) => {
  const id = req.params.id
  res.render('users/verify', {id})
})
const FLASK_API_URL = 'http://localhost:5000/upload-photo'
app.post('/upload-photo/:id', upload.single('photo'), async (req, res) => {
  const photo = req.file
  console.log('Received photo:', photo)
  const photo2 = await Patient.find({Patient_id: req.params.id})
  // Send photo to Flask API
  const formData = new FormData()
  formData.append('photo', photo.buffer, { filename: photo.originalname })
  console.log(photo2);
  formData.append('photo2', photo2[0].photo.data, { filename: photo2[0].photo.name })
  axios
    .post(FLASK_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      if (response.data == 'Match not found') {
        res.sendStatus(400)
      } else {
        console.log('Photo sent to Flask API successfully')
        res.sendStatus(200) // Send response indicating success
      }
    })
    .catch((error) => {
      console.error('Error sending photo to Flask API:', error)
      res.sendStatus(500) // Send response indicating error
    })
})
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads')
  },
  filename: function (req, file, callback) {
    callback(
      null,
      'Patient_' +
        req.params.id +
        '-' +
        Date.now() +
        path.extname(file.originalname),
    )
  },
})
const upload1 = multer({ storage: storage })

// Define a route to handle file uploads
app.post('/upload/:id', upload1.single('photo'), async (req, res) => {
  // Read the file into memory
  const data = fs.readFileSync(req.file.path)
  const id = req.params.id
  // Create a new Photo document
  const photo = {
    name: req.file.originalname,
    data: data,
    contentType: req.file.mimetype,
  }
  try {
    const pi = await patient.updateOne(
      { Patient_id: id },
      { $set: { photo: photo } },
    )
  } catch (error) {
    console.log('error')
  }
  res.send('success')
  // Save the photo to the database
})


app.post("/appointments", async (req, res) => {
	const { hospital_id, patient_id } = req.body;

	// Validate hospital_id and patient_id
	if (!hospital_id || !patient_id) {
		return res
			.status(400)
			.json({ error: "hospital_id and patient_id are required" });
	}

	// Check if hospital exists
	const hospital = await Hospital.find({ Hosp_id: hospital_id });
	if (!hospital) {
		return res.status(400).json({ error: "Invalid hospital_id" });
	}

	// Check if patient exists
	const patient = await Patient.find({ Patient_id: patient_id });
	if (!patient) {
		return res.status(400).json({ error: "Invalid patient_id" });
	}

	// Create appointment
	const appointment = new Appointment({
		hospital_id: hospital_id,
		patient_id: patient_id
	});
	await appointment.save();

	return res
		.status(200)
		.json({ message: "Appointment created successfully" });
});


module.exports = app

