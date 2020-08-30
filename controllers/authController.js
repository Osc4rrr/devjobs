const passport = require('passport'); 
const Vacantes = require('../models/Vacantes');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto'); 
const { reset } = require('nodemon');

const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion', 
    failureRedirect: '/iniciar-sesion', 
    failureFlash: true, 
    badRequestMessage: 'Ambos Campos son obligatorios'
}); 

//revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req,res,next) => {
    //revisar usuario
    if(req.isAuthenticated()){
        return next();
    }

    //redireccionar
    res.redirect('/iniciar-sesion');
}


exports.mostrarPanel = async(req,res) => {
    //consultar usuario autenticado
    const vacantes = await Vacantes.find({autor:req.user._id}).lean();

    console.log(vacantes);
    

    res.render('administracion', {
        nombrePagina: 'Panel de administracion', 
        tagline: 'Crea y administra tus vacantes desde aqui', 
        cerrarSesion:true, 
        nombre: req.user.nombre,
        imagen:req.user.imagen,
        vacantes
    })
}


exports.cerrarSesion = (req,res) => {
    req.logout(); 
    req.flash('correcto', 'Cerraste Sesion correctamente');
    return res.redirect('/iniciar-sesion');
}



exports.formReestablecerPassword = (req,res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablecer Password', 
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password, escribe tu email'
    })
}


//genera el token en la tabla de usuario
exports.enviarToken = async (req,res) => {
    const usuario = await Usuarios.findOne({email: req.body.email}); 

    if(!usuario){
        req.flash('error', 'Cuenta no existe'); 
        return res.redirect('/iniciar-sesion')
    }

    //usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000; 

    //guardar el usuario
    await usuario.save();

    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    //enviar notificacion por email
    await enviarEmail.enviar({
        usuario, 
        subject: 'Password Reset',
        resetUrl, 
        archivo: 'reset'
    });


    req.flash('correcto', 'revisa tu email para las indicaciones'); 
    res.redirect('/iniciar-sesion');
}


//resstablecer pass en bd
exports.reestablecerPassword = async (req,res) =>{ 
    const usuario = await Usuarios.findOne({
        token: req.params.token, 
        expira: {
            $gt: Date.now()
        }
    }); 

    if(!usuario){ 
        req.flash('error', 'El formulario ya no es valido, intenta nuevamente');
        return res.redirect('/reestablecer-password');
    }

    //todo bien mostrar formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })
}


//almacena el nuevo password en la bd
exports.guardarPassword = async (req,res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token, 
        expira: {
            $gt: Date.now()
        }
    }); 

    //no existe o token invalido
    if(!usuario){ 
        req.flash('error', 'El formulario ya no es valido, intenta nuevamente');
        return res.redirect('/reestablecer-password');
    }

    //asignar nuevo pass y limpiar
    usuario.password = req.body.password;
    usuario.token = undefined; 
    usuario.expira = undefined;


    //agregar a bd
    await usuario.save();

    req.flash('correcto', 'Password modificado correctamente');
    res.redirect('/iniciar-sesion');


}
