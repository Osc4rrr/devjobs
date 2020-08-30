import axios from 'axios'; 
import Swal from 'sweetalert2';


document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    //limpiar alertas
    let alertas = document.querySelector('.alertas'); 
    if(alertas){
        limpiarAlertas(); 
    }

    if(skills){
        skills.addEventListener('click', agregarSkills); 

        //una vez que estamos en editar llamar funcion
        skillsSeleccionados();
    }

    const vacantesListado = document.querySelector('.panel-administracion'); 

    if(vacantesListado){ 
        vacantesListado.addEventListener('click', accionesListado); 
    }
}); 


const skills = new Set(); 

const agregarSkills = e => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            //quitar set y class
            skills.delete(e.target.textContent); 
            e.target.classList.remove('activo');
        }else{
            //agregar al set y agregar clase
            skills.add(e.target.textContent); 
            e.target.classList.add('activo');
        }
    }

    const skillsArray = [...skills]; 
    document.querySelector('#skills').value = skillsArray;
}


const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo')); 

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })

    //inyectarlo en gidden
    const skillsArray = [...skills]; 
    document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if(alertas.children.length > 0){
            alertas.removeChild(alertas.children[0]);
        }else if(alertas.children.length ===0){
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 1000);
}


//eliminar vacantes
const accionesListado = e => {
    e.preventDefault(); 

    //console.log(e.target.dataset)

    if(e.target.dataset.eliminar){
        Swal.fire({
            title: 'Confirmar Eliminacion?',
            text: "Esta accion no puede ser revertida!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar!', 
            cancelButtonText: 'No, Cancelar'
          }).then((result) => {
            if (result.value) {
                //enviar peticion con axios
                //eliminar
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`; 

                //axios para eliminar el registro
                axios.delete(url, {params: {url}})
                    .then(function(respuesta){
                        if(respuesta.status == 200){
                            Swal.fire(
                                'eliminado', 
                                respuesta.data, 
                                'success'
                            ); 

                            //eliminar del dom
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })

            }
          })
          .catch(() => {
              Swal.fire({
                type: 'error', 
                title: 'Hubo un problema', 
                text: 'No se pudo eliminar'
              })
          })

    }else if(e.target.tagName === 'A'){
        window.location.href = e.target.href; 
    }
}