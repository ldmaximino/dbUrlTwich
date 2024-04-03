const Url = require('../models/Url');
const { v4: uuidv4 } = require('uuid');

const leerUrls = async (req,res) => {
    //console.log(req.user); //muestra por consola los datos del usuario que fueron enviados al req.user a través de passport (app.js buscar serializeUser)
    try {
        const urls = await Url.find({user: req.user.id}).lean();
        res.render("home", {urls: urls});
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
};

const agregarUrl = async (req,res) => {
    //console.log(req.body); //se pueden obtener los datos del body por el middleware app.use(express.urlencoded({extended:true}));
    const { origin } = req.body;
    try {
        const url = new Url({origin: origin, shortUrl: uuidv4(), user: req.user.id});
        await url.save();
        req.flash("mensajes", [{msg: 'URL Agregada'}]);
        return res.redirect('/');
    } catch (error) {
        //console.log(error);
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
};

const eliminarUrl = async (req,res) => {
    const { id } = req.params;
    const { origin } = req.body;
    try {
        //await Url.findByIdAndDelete(id);
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)) {
            throw new Error("Esa URL no pertenece al usuario!!");
        }
        await url.deleteOne({origin});
        req.flash("mensajes", [{msg: 'URL Eliminada'}]);
        return res.redirect('/');
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
};


const editarUrlForm = async(req,res) => {
    const { id } = req.params;
    try {
        const url = await Url.findById(id).lean();
        if(!url.user.equals(req.user.id)) {
            throw new Error("Esa URL no pertenece al usuario!!");
        }
        res.render("home", {url});
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
};

const editarUrl = async (req,res) => {
    const { id } = req.params;
    const { origin } = req.body;
    try {
        //await Url.findByIdAndUpdate(id, {origin: origin});
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)) {
            throw new Error("Esa URL no pertenece al usuario!!");
        }
        await url.updateOne({origin});
        req.flash("mensajes", [{msg: 'URL actualizada'}]);
        return res.redirect("/");
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
};

const redireccionamiento = async(req,res) => {
    const { shortUrl } = req.params;
    try {
        const urlDB = await Url.findOne({ shortUrl: shortUrl});
        //console.log(urlDB);
        if(urlDB) res.redirect(urlDB.origin);
    } catch (error) {
        req.flash("mensajes", [{msg: "No existe esta url configurada"}]);
        return res.redirect('/auth/login');
    }
}

module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrlForm,
    editarUrl,
    redireccionamiento
}