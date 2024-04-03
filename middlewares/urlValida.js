const { URL} = require('url');
const urlValidar = (req, res, next) => {
    try {
        const { origin } = req.body;
        const urlFrontend = new URL(origin);
        if(urlFrontend.origin !== "null") {
            if (
                urlFrontend.protocol === "http:" ||
                urlFrontend.protocol === "https:"
            ) {
                return next();
            }
            throw new Error("Debe anteponer https://");
        }
        throw new error("URL no válida 😒");
    } catch (error) {
        if(error.message === "Invalid URL") {
            req.flash("mensajes", [{msg:"URL no válida"}]);
        } else {
            req.flash("mensajes", [{msg:error.message}]);
        }
        return res.redirect("/");
        //res.send("URL no válida!");
    }
};

module.exports = urlValidar;