if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

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

app.get('/', (req, res) => {
  res.render('coupon/home.ejs')
})

app.use('/', userRoutes)
app.use('/dashboard', dashboardRoute)
app.use('/generate-coupons', couponRoute)
app.use('/copoun/:comp_id', verifyRoute)
app.get('/final', async (req, res) => {
  res.render('users/finale')
})
module.exports = app
