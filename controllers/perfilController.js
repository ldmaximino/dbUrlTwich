const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const User = require("../models/User");
const Jimp = require('jimp');

module.exports.formPerfil = async (req,res) => {
    try {
        const user = await User.findById(req.user.id);
        return res.render("perfil", {user: req.user, img: user.img});
    } catch (error) {
        req.flash("mensajes", [{msg: "Error de archivo"}]);
        return res.redirect("/perfil");
    }
}

module.exports.editarPerfil = async(req,res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, async(err,fields,files) => {
        try {
            if(err) {
                throw new Error("Falló la subida de imagen");
            }
            const file = files.myFile[0]; //myFile es el name del input en perfil.hbs

            if(file.originalFilename === "") {
                throw new Error("Debe seleccionar una imagen");
            }

            const imageTypes = ["image/jpeg", "image/png"];
            if(!imageTypes.includes(file.mimetype)) {
                throw new Error("Solo se admiten imágenes jpg, jpeg o png");
            }

            if(file.size > 5 * 1024 * 1024) {
                throw new Error("El tamaño máximo de la imagen debe ser de 5Mb");
            }

            const extension = file.mimetype.split("/")[1]; //el split busca la "/" y toma la segunda parte [1] del string
            const dirFile = path.join(__dirname,`../public/img/perfiles/${req.user.id}.${extension}`);

            fs.renameSync(file.filepath, dirFile); //el renameSync de fs toma la ubicación temporal (file.filepath) del archivo y lo pasa a la ubicación de destino (dirFile)

            //Redimensiona la imagen con Jimp
            const image = await Jimp.read(dirFile);
            image.resize(200,200).quality(90).writeAsync(dirFile);

            const user = await User.findById(req.user.id);
            user.img = `${req.user.id}.${extension}`;
            await user.save();

            req.flash("mensajes", [{msg: "La imagen se ha subido exitosamente"}]);
        } catch (error) {
            req.flash("mensajes", [{msg: error.message}]);
        } finally {
            return res.redirect("/perfil");
        }
    })
}