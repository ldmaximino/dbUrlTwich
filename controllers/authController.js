const User = require("../models/User");
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require("dotenv").config();

const registerForm = (req,res) => {
    res.render("register");
}

const registerUser = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        req.flash("mensajes", errors.array());
        return res.redirect("/auth/register");
        //return res.json(errors.array());
    }

    const {userName, email, password} = req.body;
    try {
        let user = await User.findOne({email: email});
        //console.log(user);
        if(user) throw new Error('Ese correo ya está registrado!');
        user = new User({userName,email,password,tokenConfirm: uuidv4()}); //también se puede hacer así: user = new User(req.body);
        await user.save();
        
        //enviar correo electrónico con la confirmación de la cuenta
        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.userEMail,
                pass: process.env.passEMail
            }
        });

        await transport.sendMail({
            from: '"Leandro BackEnd 😶‍🌫️🎶😁" <leandro@backend.email>', // sender address
            to: user.email, // list of receivers
            subject: "Confirma tu cuenta ✔", // Subject line
            html: `<a href="${process.env.pathHeroku || 'http://localhost:5001/'}auth/confirmar/${user.tokenConfirm}">Confirma tu cuenta haciendo click aquí</a>`, // html body
        });

        req.flash("mensajes",[{msg: 'Revisa tu correo electrónico y valida la cuenta.'}]);
        res.redirect("/auth/login");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/auth/register");
        //res.send(error.message);
    }
}

const confirmarCuenta = async (req,res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({ tokenConfirm: token});
        if(!user) throw new Error("No existe ese usuario!");
    
        user.cuentaConfirmada=true;
        user.tokenConfirm=null;
        await user.save();
        req.flash("mensajes", [{msg: "Cuenta verificada. Puedes iniciar sesión."}]);
        res.redirect("/auth/login");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect("/auth/login");
        //res.send(error.message);
    }
}

const loginForm = (req,res) => {
    res.render("login");
}

const loginUser = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/login');
        //return res.json(errors.array());
    }

    const { email, password} = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) throw new Error("Ese email no existe.");
        if(!user.cuentaConfirmada) throw new Error("La cuenta no ha sido confirmada!");

        if(!await user.comparePassword(password)) throw new Error("Contraseña no válida!");

        //me está creando la sesión de usuario a través de passport
        req.login(user, function(err) {
            if(err) throw new Error("Error al crear la sesión con passport");
            return res.redirect("/");
        })

    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/login');
        //res.send(error.message);
    }
}

const cerrarSesion = (req,res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        return res.redirect('/auth/login');
      });
}

module.exports = {
    loginForm,
    loginUser,
    registerForm,
    registerUser,
    confirmarCuenta,
    cerrarSesion
}