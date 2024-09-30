let currentDate = new Date(2024, 8, 27); // Comienza en 27 de septiembre de 2024
const turnos = 3; // Total de turnos
const guardias = [];
let ultimoTurno = 0; // Variable para rastrear el último turno asignado

// Datos de ejemplo con nombres de los bomberos y su categorización
const bomberos = {
    porTurno: { 1: [], 2: [], 3: [] },
    porDia: { lunes: [], martes: [], miércoles: [], jueves: [], viernes: [] },
    porFinDeSemana: { A: [], B: [], C: [], D: [], E: [] },
};

// Inicializa los guardias con los nombres y turnos
function inicializarGuardias() {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const fecha = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const turno = (ultimoTurno % turnos) + 1; // Asigna el siguiente turno
        ultimoTurno = turno; // Actualiza el último turno

        const bomberosDeGuardia = Object.values(bomberos.porTurno)
            .flat()
            .filter(b => b.turno === turno)
            .concat(Object.values(bomberos.porDia[fecha.toLocaleString('es-ES', { weekday: 'long' })] || []));
        
        guardias.push({ fecha: fecha.toISOString().split('T')[0], bomberos: bomberosDeGuardia, turno });
    }
}

function crearCalendario() {
    const calendario = document.getElementById('calendar');
    const monthYearDisplay = document.getElementById('monthYear');
    
    calendario.innerHTML = '';
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    monthYearDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const diasDeLaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const filaDias = document.createElement('div');
    filaDias.classList.add('day-row');
    diasDeLaSemana.forEach(dia => {
        const diaElemento = document.createElement('div');
        diaElemento.classList.add('day');
        diaElemento.innerHTML = `<strong>${dia}</strong>`;
        filaDias.appendChild(diaElemento);
    });
    calendario.appendChild(filaDias);

    for (let i = 0; i < firstDay.getDay(); i++) {
        const dia = document.createElement('div');
        dia.classList.add('day');
        calendario.appendChild(dia);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dia = document.createElement('div');
        dia.classList.add('day');
        dia.innerHTML = `<h2>${i}</h2>`;

        const fechaActual = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const guardia = guardias.find(g => g.fecha === fechaActual.toISOString().split('T')[0]);
        
        if (guardia) {
            const nombres = guardia.bomberos.map(b => `${b.nombre} (${b.turnoDiaNoche})`).join(", ");
            dia.innerHTML += `<p>Turno ${guardia.turno}: ${nombres || "Nadie"}</p>`;
        } else {
            dia.innerHTML += `<p>Turno ${guardia.turno}: Nadie</p>`;
        }

        calendario.appendChild(dia);
    }

    const totalDías = lastDay.getDate() + firstDay.getDay();
    const filas = Math.ceil(totalDías / 7);
    const díasFaltantes = (7 * filas) - totalDías;

    for (let i = 0; i < díasFaltantes; i++) {
        const dia = document.createElement('div');
        dia.classList.add('day');
        calendario.appendChild(dia);
    }

    calendario.style.gridTemplateRows = `repeat(${filas + 1}, 1fr)`; // +1 para los días de la semana

    // Actualizar la lista de bomberos
    listarBomberos();
}

// Listar bomberos en el espacio entre el calendario y el formulario
function listarBomberos() {
    const listaBomberos = document.getElementById('listaBomberos');
    listaBomberos.innerHTML = '';

    Object.values(bomberos.porTurno).flat().forEach(bombero => {
        const item = document.createElement('div');
        item.textContent = bombero.nombre;
        
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = '❌'; // Cruz roja
        btnEliminar.classList.add('btn-eliminar');
        btnEliminar.addEventListener('click', () => eliminarBombero(bombero.nombre));

        item.appendChild(btnEliminar);
        listaBomberos.appendChild(item);
    });
}

// Eliminar un bombero
function eliminarBombero(nombre) {
    // Eliminar del array de bomberos
    Object.values(bomberos.porTurno).forEach(turno => {
        const index = turno.findIndex(b => b.nombre === nombre);
        if (index > -1) {
            turno.splice(index, 1);
        }
    });
    
    // Actualizar el calendario
    guardias.length = 0; // Limpiar el array de guardias
    inicializarGuardias(); // Reinicializar guardias
    crearCalendario(); // Crear el calendario nuevamente
}

// Cambiar de mes
function cambiarMes(incremento) {
    currentDate.setMonth(currentDate.getMonth() + incremento);
    guardias.length = 0; // Limpiar el array de guardias
    inicializarGuardias(); // Reinicializar guardias para el nuevo mes
    crearCalendario(); // Crear el calendario nuevamente
}

// Exportar a PDF
async function exportarAPDF() {
    const calendario = document.getElementById('calendar');
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesAño = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    // Usa html2canvas para capturar el calendario
    const canvas = await html2canvas(calendario);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190; // Ancho del PDF
    const pageHeight = pdf.internal.pageSize.height; // Altura de la página
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calcula la altura de la imagen
    let heightLeft = imgHeight;

    // Añadir mes y año al PDF
    pdf.setFontSize(16);
    pdf.text(mesAño, 10, 10); // Añadir texto del mes y año en la parte superior

    let position = 20; // Espacio para el texto

    // Añadir la imagen al PDF
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Si hay más espacio, añade una nueva página
    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save('calendario.pdf');
}

// Botones para cambiar de mes
document.getElementById('prevMonth').addEventListener('click', () => cambiarMes(-1));
document.getElementById('nextMonth').addEventListener('click', () => cambiarMes(1));

// Evento de exportar a PDF
document.getElementById('exportar').addEventListener('click', exportarAPDF);

// Actualiza los formularios para agregar nuevos bomberos
document.getElementById('addBomberoTurnoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombreTurno').value;
    const turno = parseInt(document.getElementById('turno').value);
    const turnoDiaNoche = document.getElementById('turnoDiaNoche').value;
    
    // Agregar el nuevo bombero al array
    if (turno) {
        bomberos.porTurno[turno].push({ nombre, turno, turnoDiaNoche });
    }

    // Reiniciar el formulario
    this.reset();

    // Actualizar el calendario
    guardias.length = 0; // Limpiar el array de guardias
    inicializarGuardias(); // Reinicializar guardias
    crearCalendario(); // Crear el calendario nuevamente
});

// Añadir nuevo bombero por día
document.getElementById('addBomberoDiaForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombreDia').value;
    const dia = document.getElementById('dia').value;
    const turnoDiaNoche = document.getElementById('turnoDiaNoche').value;

    // Agregar el nuevo bombero al array
    if (dia) {
        bomberos.porDia[dia].push({ nombre, turnoDiaNoche });
    }

    // Reiniciar el formulario
    this.reset();

    // Actualizar el calendario
    guardias.length = 0; // Limpiar el array de guardias
    inicializarGuardias(); // Reinicializar guardias
    crearCalendario(); // Crear el calendario nuevamente
});

// Añadir nuevo bombero por fin de semana
document.getElementById('addBomberoFinDeSemanaForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombreFinDeSemana').value;
    const grupo = document.getElementById('grupo').value;
    const turnoDiaNoche = document.getElementById('turnoDiaNoche').value;

    // Agregar el nuevo bombero al array
    if (grupo) {
        bomberos.porFinDeSemana[grupo].push({ nombre, turnoDiaNoche });
    }

    // Reiniciar el formulario
    this.reset();

    // Actualizar el calendario
    guardias.length = 0; // Limpiar el array de guardias
    inicializarGuardias(); // Reinicializar guardias
    crearCalendario(); // Crear el calendario nuevamente
});

// Inicializa el calendario
inicializarGuardias();
crearCalendario();
