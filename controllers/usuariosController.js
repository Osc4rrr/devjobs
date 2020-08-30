
const Usuarios = require('../models/Usuarios');
const multer = require('multer'); 
const shortid = require('shortid');

exports.subirImagen = (req,res, next) => {
    upload(req, res, function(error){
        if(error){ 
            //console.log(error);
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande, maximo 100 kb');
                }else{
                    req.flash('error', error.message);
                }
            }else{
                req.flash('error', error.message);
            }

            res.redirect('/administracion');
            return;
        }else{
            return next();
        }
    }); 
}


exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'crea tu cuenta en devJobs', 
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
    });
}

//opciones de multer
const configMulter ={ 
    limits: {fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles')
        }, 
        filename: (req,file,cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);  
        }
    }), 
    fileFilter(req,file,cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            //callbar se ejecuta como true o false, true cuando la imagen se acepta
            cb(null, true); 
        }else{
            cb(new Error('Formato no valido'));
        }
    }
}; 

const upload = multer(configMulter).single('imagen'); 

exports.crearUsuario = async (req,res) => {
    //crear usuario
    const usuario = new Usuarios(req.body); 

    try {
        await usuario.save(); 
        res.redirect('/iniciar-sesion');
    } catch (error) {

        //console.log(error);
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}


exports.validarRegistro = (req,res, next) => {

    //sanitizar los campos
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    //validar campos
    req.checkBody('nombre', 'El nombre es obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);
    
    const errores = req.validationErrors(); 

    
    if(errores){
        //si hay errores
        req.flash('error', errores.map(error => error.msg))

        res.render('crear-cuenta', {
            nombrePagina: 'crea tu cuenta en devJobs', 
            tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta', 
            mensajes: req.flash()
        });
        
        return;
    }

    //si toda la validacion es correcta

    next();
}



exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion DevJobs'
    }); 
}


exports.formEditarPerfil = (req,res)=>{ 

    //console.log(req.user);
    res.render('editar-perfil', {
        nombrePagina: 'Editar tu perfil en devjobs', 
        usuario: req.user.toObject(), 
        cerrarSesion:true, 
        nombre: req.user.nombre, 
        imagen: req.user.imagen
    }); 
}


//guardar cambios editar perfil
exports.editarPerfil = async (req,res) => {
    const usuario = await Usuarios.findById(req.user.id); 

    usuario.nombre = req.body.nombre; 
    usuario.email = req.body.email;

    if(req.body.password){ 
        usuario.password = req.body.password;
    }

    if(req.file){
        usuario.imagen = req.file.filename
    }

    await usuario.save();

    req.flash('correcto', 'Perfil editado correctamente');

    //redirect 
    res.redirect('/administracion');
}


//sanitizar y validar el formulario de editar cliente
exports.validarPerfil = (req,res, next) => {

    //sanitizar
    req.sanitizeBody('nombre').escape(); 
    req.sanitizeBody('email').escape();
    
    if(req.body.password){ 
        req.sanitizeBody('password').escape();
    }


    //validar

    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty(); 
    req.checkBody('email', 'el correo no puede ir vacio').notEmpty(); 

    const errores = req.validationErrors(); 

    if(errores){
        req.flash('error', errores.map(error => error.msg)); 
        res.render('editar-perfil', {
            nombrePagina: 'Editar tu perfil en devjobs', 
            usuario: req.user.toObject(), 
            cerrarSesion:true, 
            nombre: req.user.nombre, 
            imagen:req.user.imagen,
            mensajes: req.flash()
        }); 
    }

    next(); 
}

