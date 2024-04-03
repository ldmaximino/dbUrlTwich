const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const userSchema = new Schema({
    userName: {
        type: String,
        lowercase: true,
        required:true
    },
    email: {
        type: String,
        lowercase:true,
        required:true,
        unique:true,
        index: {unique:true}
    },
    password: {
        type: String,
        required:true
    },
    tokenConfirm: {
        type: String,
        default:null
    },
    cuentaConfirmada: {
        type: Boolean,
        default:false
    },
    img: {
        type: String,
        default: null
    }
});

//Grabar la contraseña 'Hasheada' la contraseña con pre.save
//se utiliza una function en vez de arrow function porque function permite aplicar el this en el ámbito que se encuentra.
userSchema.pre('save', async function(next){
    const user = this;
    if(!user.isModified('password')) return next;

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password,salt);
        user.password = hash;
        next();
    } catch (error) {
        console.log(error);
        next();
    }
})

//Compara la contraseña ingresada por el usuario en el login (canditePassword)  con la contraseña 'Hasheada' que está guardada en la base de datos (this.password)
userSchema.methods.comparePassword = async function(canditePassword) {
    //console.log(canditePassword,this.password);
    return await bcrypt.compare(canditePassword, this.password); //retorna un true or false comparando si la contraseña de la base de datos coincide con la ingresada por el usuario en el login
}

module.exports = mongoose.model('User',userSchema); //en mongoDB se va a guardar la colección en lowercase y plural, o sea, "users"
