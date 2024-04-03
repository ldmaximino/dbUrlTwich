const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const { create } = require('express-handlebars');
const csrf = require('csurf');
const User = require('./models/User');
const cors = require('cors');
require("dotenv").config();
//require("./database/config");
const clientDB = require('./database/config');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

const corsOptions = {
    credentials: true,
    origin: process.env.pathHeroku || "*",
    methods: ['GET','POST']
}
app.use(cors());

//crear sesión del sitio web
app.use(session({
    secret: process.env.secretSession,
    resave: false,
    saveUninitialized: false,
    name: "secretname-blabla",
    store: MongoStore.create({
        clientPromise: clientDB,
        dbName: process.env.dbName
    }),
    cookie: { 
        secure: process.env.Modo === 'production' ? true : false, 
        maxAge: 30 * 24 * 60 * 60 * 1000 }, // secure => false para desarrollo o true para producción - 30 días * 24 hs * 60 min * 60 seg * 1000 ms es lo que va a estar activa la sesión
}));

app.use(flash());

//Configuración de passport para crear y borrar sesiones
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user,done) => done(null, {id: user._id, userName: user.userName})); //el serializeUser crea la sesión y esta información se envía al req.user // userName sale del Schema de models/User.js
passport.deserializeUser(async(user,done)=> { //el deserializeUser borra la sesión
    //es necesario verificar si el usuario existe en la base de datos?
    const userDB = await User.findById(user.id);
    return done(null, {id: userDB._id, userName: userDB.userName});
});
//

const port = process.env.PORT || 5000;

const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"],
})

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.static(__dirname + "/public")); //este middleware marca la ruta a la carpeta public donde están todos los archivos del frontend
app.use(express.urlencoded({extended: true})); //este middleware representa el body-parser que permite hacer un req.body y leer los parámetros enviados en el request o petición

app.use(csrf()); //token para seguridad
app.use(mongoSanitize()); //limpia las solicitudes y evita ataques a mongodb

app.use((req,res,next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes = req.flash("mensajes");
    next();
})

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

app.listen(port, () => {
    console.log(`El servidor está encendido en http://localhost:${port} 🚀`);
})
