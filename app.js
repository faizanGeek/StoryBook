const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const exphbs= require('express-handlebars')
const cookieParser=require('cookie-parser');
const session = require('express-session');


// Load User Model
require('./models/User');
require('./models/Story');

// Passport Config
require('./config/passport')(passport);

// Load Routes
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');

// Load Keys
const keys = require('./config/keys');


//handlebars helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} =require('./helpers/hbs');


// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose.connect(keys.mongoURI, {
  useMongoClient:true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//method override middleware
app.use(methodOverride('_method'));

//handlebars
app.engine('handlebars',exphbs({
  helpers:{
    truncate:truncate,
   stripTags: stripTags,
   formatDate:formatDate,
   select:select,
   editIcon:editIcon
  },
  defaultLayout:'main'
}));
app.set('view engine','handlebars');


app.use(cookieParser());
app.use(session({
  secret:'secret',
  resave:false,
  saveUninitialized:false
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());


//set global vairables
app.use((req,res,next)=>{
  res.locals.user=req.user || null ;
  next();
  });

//set static path
app.use(express.static(path.join(__dirname,'public')));


  // Use Routes
app.use('/auth', auth);
app.use('/', index);
app.use('/stories', stories);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});