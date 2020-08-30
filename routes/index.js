const express = require('express'); 
const router = express.Router(); 

const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');

const usuariosController = require('../controllers/usuariosController');

const authController = require('../controllers/authController');

module.exports = () => {

    router.get('/', homeController.mostrarTrabajos); 

    //crear vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    ); 

    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );

    //mostrar una vacante
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    //ediat vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    ); 
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );

    //eliminar vacantes
    router.delete('/vacantes/eliminar/:id', 
        vacantesController.eliminarVacante
    ); 

    //crear cuentas
    router.get('/crear-cuenta',usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario
    );

    //iniciar sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario); 
    //cerrar sesion
    router.get('/cerrar-sesion', 
        authController.verificarUsuario, 
        authController.cerrarSesion
    ); 

    //reestablecer pass email
    router.get('/reestablecer-password', 
        authController.formReestablecerPassword 
    ); 

    router.post('/reestablecer-password', 
        authController.enviarToken
    ); 

    //reestablecer pass bd
    router.get('/reestablecer-password/:token', authController.reestablecerPassword); 
    router.post('/reestablecer-password/:token', authController.guardarPassword);


    //administracion
    router.get('/administracion', 
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    //editar pefil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    ); 

    router.post('/editar-perfil', 
        authController.verificarUsuario, 
        //usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    ); 

    //recibir mensajes de candidatos
    router.post('/vacantes/:url', 
        vacantesController.subirCV, 
        vacantesController.contactar
    ); 


    //candidatos
    router.get('/candidatos/:id', 
        authController.verificarUsuario, 
        vacantesController.mostrarCandidatos
    ); 

    //buscador de vacantes
    router.post('/buscador', vacantesController.buscarVacantes);



    return router; 
}