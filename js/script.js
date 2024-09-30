let currentDate = new Date(2024, 8, 27); // Comienza en 27 de septiembre de 2024
const fechaReferencia = new Date(2024, 8, 1); // 1 de septiembre de 2024

const turnos = 3; // Total de turnos
const guardias = [];
let ultimoTurno = 0; // Variable para rastrear el último turno asignado

const bomberos = {
    porTurno: { 1: [], 2: [], 3: [] },
    porDia: { lunes: [], martes: [], miércoles: [], jueves: [], viernes: [] },
    porFinDeSemana: { A: [], B: [], C: [], D: [], E: [] },
};

const weekendGroups = ["A", "B", "C", "D", "E"]; // Grupo A comenzó el 01 de septiembre de 2024
let lastWeekendGroup = 0; // Grupo A está de guardia inicialmente

// Inicializa los guardias con los nombres y turnos
function obtenerTurno(fecha) {
    const unDiaEnMilisegundos = 1000 * 60 * 60 * 24;
    const diferenciaEnDias = Math.floor((fecha - fechaReferencia) / unDiaEnMilisegundos);
    const turno = (diferenciaEnDias % turnos) + 1; // Ciclo de 3 turnos (1, 2, 3)
    return turno;
}
// Inicializa los guardias con los nombres y turnos
function inicializarGuardias() {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const fecha = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const turno = obtenerTurno(fecha); // Cambia esto para usar la nueva función

        const diaSemana = fecha.getDay(); // 0 es domingo, 6 es sábado

        let bomberosDeGuardia = [];
        if (diaSemana === 0 || diaSemana === 6) { // Sábado o domingo
            const weekendGroup = weekendGroups[lastWeekendGroup % weekendGroups.length];
            bomberosDeGuardia = bomberos.porFinDeSemana[weekendGroup] || [];

            // Agregar bomberos de turno para el día actual
            const turnoBomberos = Object.values(bomberos.porTurno)
                .flat()
                .filter(b => b.turno === turno);

            bomberosDeGuardia = bomberosDeGuardia.concat(turnoBomberos); // Combinar ambos grupos
            lastWeekendGroup++; // Incrementar el índice del grupo de fin de semana
        } else {
            bomberosDeGuardia = Object.values(bomberos.porTurno)
                .flat()
                .filter(b => b.turno === turno)
                .concat(Object.values(bomberos.porDia[fecha.toLocaleString('es-ES', { weekday: 'long' })] || []));
        }

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

        // Agregar nombres de bomberos de fin de semana
        const weekendGroup = (fechaActual.getDay() === 0 || fechaActual.getDay() === 6) 
            ? weekendGroups[Math.floor((fechaActual.getDate() - 1) / 7) % weekendGroups.length] 
            : '';

        const weekendBomberos = bomberos.porFinDeSemana[weekendGroup] || [];
        const turnoBomberos = guardia ? guardia.bomberos.filter(b => b.turno !== undefined) : []; // Filtrar por bomberos de turno

        // Formato para mostrar bomberos
        const turnoNombres = turnoBomberos.map(b => `${b.nombre} (${b.turnoDiaNoche || "Noche"})`).join(", ");
        const weekendNombres = weekendBomberos.map(b => `${b.nombre}`).join(", ");
        
        // Mostrar los nombres en el calendario
        if (guardia) {
            if (turnoBomberos.length > 0) {
                dia.innerHTML += `<p>Turno ${guardia.turno}: ${turnoNombres}</p>`;
            } else {
                dia.innerHTML += `<p>Turno ${guardia.turno}: Nadie</p>`;
            }
        } else {
            dia.innerHTML += `<p>Turno: Nadie</p>`;
        }

        if (weekendGroup && weekendBomberos.length > 0) {
            dia.innerHTML += `<p>Grupo de Guardia ${weekendGroup}: ${weekendNombres}</p>`;
        } else if (weekendGroup) {
            dia.innerHTML += `<p>Grupo de Guardia ${weekendGroup}: Nadie</p>`;
        }

        // Agregar bomberos de guardia diaria solo para lunes a viernes
        if (fechaActual.getDay() >= 1 && fechaActual.getDay() <= 5) { // Lunes a Viernes
            const diaNombre = fechaActual.toLocaleString('es-ES', { weekday: 'long' });
            const guardiaDiaria = Object.values(bomberos.porDia[diaNombre] || []);
            if (guardiaDiaria.length > 0) {
                const guardiaNombres = guardiaDiaria.map(b => `${b.nombre} (${b.turnoDiaNoche || "Noche"})`).join(", ");
                dia.innerHTML += `<p>Guardia diaria: ${guardiaNombres}</p>`;
            } else {
                dia.innerHTML += `<p>Guardia diaria: Nadie</p>`;
            }
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
        btnEliminar.textContent = '❌';
        btnEliminar.classList.add('btn-eliminar');
        btnEliminar.addEventListener('click', () => eliminarBombero(bombero.nombre));

        item.appendChild(btnEliminar);
        listaBomberos.appendChild(item);
    });
}

// Eliminar un bombero
function eliminarBombero(nombre) {
    Object.values(bomberos.porTurno).forEach(turno => {
        const index = turno.findIndex(b => b.nombre === nombre);
        if (index > -1) {
            turno.splice(index, 1);
        }
    });

    guardias.length = 0;
    inicializarGuardias();
    crearCalendario();
}

// Cambiar de mes
function cambiarMes(incremento) {
    currentDate.setMonth(currentDate.getMonth() + incremento);
    guardias.length = 0;
    inicializarGuardias();
    crearCalendario();
}

// Exportar a PDF
async function exportarAPDF() {
    const calendario = document.getElementById('calendar');
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesAño = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const canvas = await html2canvas(calendario);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 190;
    const pageHeight = pdf.internal.pageSize.height;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    pdf.setFontSize(16);
    pdf.text(mesAño, 10, 10);

    let position = 20;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save('calendario.pdf');
}

document.getElementById('prevMonth').addEventListener('click', () => cambiarMes(-1));
document.getElementById('nextMonth').addEventListener('click', () => cambiarMes(1));

document.getElementById('exportar').addEventListener('click', exportarAPDF);

document.getElementById('addBomberoTurnoForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombreTurno').value;
    const turno = parseInt(document.getElementById('turno').value);
    const turnoDiaNoche = document.getElementById('turnoDiaNoche').value;

    if (turno) {
        bomberos.porTurno[turno].push({ nombre, turno, turnoDiaNoche });
    }

    this.reset();
    guardias.length = 0;
    inicializarGuardias();
    crearCalendario();
});

document.getElementById('addBomberoDiaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombreDia').value;
    const dia = document.getElementById('dia').value;

    if (bomberos.porDia[dia]) {
        bomberos.porDia[dia].push({ nombre });
    }

    this.reset();
    guardias.length = 0;
    inicializarGuardias();
    crearCalendario();
});

document.getElementById('addBomberoFinDeSemanaForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombreFinDeSemana').value;
    const grupo = document.getElementById('grupo').value;

    if (bomberos.porFinDeSemana[grupo]) {
        bomberos.porFinDeSemana[grupo].push({ nombre });
    }

    this.reset();
    guardias.length = 0;
    inicializarGuardias();
    crearCalendario();
});

inicializarGuardias();
crearCalendario();
