
const Vacante = require('../models/Vacantes');


exports.mostrarTrabajos = async (req,res, next) =>{
    const vacantes = await Vacante.find().lean();

    if(!vacantes) return next(); 
    res.render('home', {
        nombrePagina: 'devjobs', 
        tagline: 'Encuentra y publica trabajo para desarrolladores web', 
        barra: true, 
        boton: true, 
        vacantes
    })
}