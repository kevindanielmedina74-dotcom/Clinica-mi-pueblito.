// ===== LOADER =====
// Fix: usar DOMContentLoaded + timeout de seguridad para que SIEMPRE desaparezca
function ocultarLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
}

// Se oculta cuando la página carga normalmente
window.addEventListener('load', () => {
  setTimeout(ocultarLoader, 1500); // reducido a 1.5s
});

// Seguridad: si después de 5s sigue visible, se oculta de todas formas
setTimeout(ocultarLoader, 5000);

// QR
window.addEventListener('load', () => {
  const qrImage = document.getElementById('qrCodeImage');
  if (qrImage) {
    const url = window.location.href;
    const encoded = encodeURIComponent(url);
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encoded}&margin=10`;
    qrImage.onerror = function () {
      this.src = `https://quickchart.io/qr?size=260&text=${encoded}&margin=1`;
    };
    qrImage.alt = 'QR - Clinica Mi Pueblito';
  }
});

// ===== TEMA CLARO/OSCURO =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('clinica-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('clinica-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// ===== MENÚ HAMBURGUESA =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ===== BOTÓN VOLVER ARRIBA =====
const btnTop = document.getElementById('btnTop');
window.addEventListener('scroll', () => {
  if (btnTop) {
    btnTop.classList.toggle('visible', window.scrollY > 300);
  }
});
if (btnTop) {
  btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== SLIDE FROM LEFT (Intersection Observer) =====
const slideEls = document.querySelectorAll('.slide-left');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 120);
    }
  });
}, { threshold: 0.15 });
slideEls.forEach(el => observer.observe(el));

// ===== ANIMACIÓN TARJETAS DESDE IZQUIERDA =====
const cards = document.querySelectorAll('.card');
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });
cards.forEach(card => cardObserver.observe(card));

// ===== CONTADOR ANIMADO =====
function animateCounters() {
  const counters = document.querySelectorAll('.count');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    if (isNaN(target)) return; // Fix: evitar NaN si falta el atributo data-target
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = Math.floor(current);
    }, 16);
  });
}

const counterSection = document.querySelector('.counters');
if (counterSection) {
  const counterObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateCounters(); counterObserver.disconnect(); }
  }, { threshold: 0.3 });
  counterObserver.observe(counterSection);
}

// ===== MODAL GENERAL =====
function openModal(title, body) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.textContent = body;
  if (modal) modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('open');
}

document.getElementById('modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

// ===== MODAL PACIENTE =====
function abrirModalPaciente(paciente) {
  const mp = document.getElementById('modalPaciente');
  const mpNombre = document.getElementById('mp-nombre');
  const detalle = document.getElementById('detallePaciente');
  if (mpNombre) mpNombre.textContent = `${paciente.nombres} ${paciente.apellidos}`;
  if (detalle) detalle.innerHTML = `
    <div class="detalle-item"><strong>Cédula</strong><span>${paciente.cedula}</span></div>
    <div class="detalle-item"><strong>Fecha Nac.</strong><span>${paciente.fechaNac}</span></div>
    <div class="detalle-item"><strong>Género</strong><span>${paciente.genero}</span></div>
    <div class="detalle-item"><strong>Teléfono</strong><span>${paciente.telefono}</span></div>
    <div class="detalle-item"><strong>Correo</strong><span>${paciente.correo || 'No indicado'}</span></div>
    <div class="detalle-item"><strong>Especialidad</strong><span>${paciente.especialidad}</span></div>
    <div class="detalle-item"><strong>Dirección</strong><span>${paciente.direccion || 'No indicada'}</span></div>
    <div class="detalle-item"><strong>Registrado</strong><span>${paciente.fecha}</span></div>
    <div class="detalle-item" style="grid-column:1/-1"><strong>Motivo de Consulta</strong><span>${paciente.motivo}</span></div>
  `;
  if (mp) mp.classList.add('open');
}

function cerrarModalPaciente() {
  document.getElementById('modalPaciente')?.classList.remove('open');
}

document.getElementById('modalPaciente')?.addEventListener('click', (e) => {
  if (e.target.id === 'modalPaciente') cerrarModalPaciente();
});

// ===== PACIENTES =====
let pacientesCache = [];

function pacientesLocalGet() {
  try { return JSON.parse(localStorage.getItem('clinica-pacientes') || '[]'); } catch (_) { return []; }
}
function pacientesLocalSet(arr) {
  try { localStorage.setItem('clinica-pacientes', JSON.stringify(arr)); } catch (_) {}
}

function cargarPacientes() {
  pacientesCache = pacientesLocalGet();
  // Intentar Firebase si existe (no bloquea)
  if (typeof window.cargarPacientesFirebase === 'function') {
    window.cargarPacientesFirebase();
  }
  return pacientesCache;
}

function getPacientes() {
  return pacientesCache;
}

function agregarPaciente(paciente) {
  paciente.id = Date.now();
  var arr = pacientesLocalGet();
  arr.unshift(paciente);
  pacientesLocalSet(arr);
  pacientesCache = arr;
  if (typeof window.agregarPacienteFirebase === 'function') {
    window.agregarPacienteFirebase(paciente);
  }
  return pacientesCache;
}

function borrarPaciente(id) {
  pacientesCache = pacientesLocalGet().filter(function (p) { return p.id !== id; });
  pacientesLocalSet(pacientesCache);
  if (typeof window.borrarPacienteFirebase === 'function') {
    window.borrarPacienteFirebase(id);
  }
  return pacientesCache;
}

// ===== VALIDACIÓN EN TIEMPO REAL =====
function validarCampo(id, errId, regla, msg) {
  const input = document.getElementById(id);
  const err = document.getElementById(errId);
  if (!input) return;

  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (regla(val)) {
      input.classList.remove('invalid'); input.classList.add('valid');
      if (err) err.textContent = '';
    } else {
      input.classList.remove('valid'); input.classList.add('invalid');
      if (err) err.textContent = val ? msg : 'Este campo es requerido.';
    }
  });
}

// Validaciones formulario paciente
validarCampo('nombres',   'err-nombres',   v => v.length >= 2, 'Mínimo 2 caracteres.');
validarCampo('apellidos', 'err-apellidos', v => v.length >= 2, 'Mínimo 2 caracteres.');
validarCampo('cedula',    'err-cedula',    v => /^\d+$/.test(v) && v.length > 0, 'Solo se permiten números.');
validarCampo('fechaNac',  'err-fechaNac',  v => v !== '', 'Selecciona una fecha.');
validarCampo('telefono',  'err-telefono',  v => /^\d+$/.test(v) && v.length > 0, 'Solo se permiten números.');
validarCampo('correo',    'err-correo',    v => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo inválido.');
validarCampo('motivo',    'err-motivo',    v => v.trim().length > 0, 'Este campo es requerido.');

// Validaciones formulario contacto
validarCampo('c-nombre',  'err-c-nombre',  v => v.length >= 2,  'Mínimo 2 caracteres.');
validarCampo('c-correo',  'err-c-correo',  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Correo inválido.');
validarCampo('c-asunto',  'err-c-asunto',  v => v.length >= 3,  'Mínimo 3 caracteres.');
validarCampo('c-mensaje', 'err-c-mensaje', v => v.length >= 10, 'Mínimo 10 caracteres.');

// ===== FORMULARIO PACIENTE: GUARDAR =====
const formPaciente = document.getElementById('formPaciente');
if (formPaciente) {
  formPaciente.addEventListener('submit', (e) => {
    e.preventDefault();

    const campos = [
      { id: 'nombres',      err: 'err-nombres',      regla: v => v.length >= 2,                          msg: 'Mínimo 2 caracteres.' },
      { id: 'apellidos',    err: 'err-apellidos',    regla: v => v.length >= 2,                          msg: 'Mínimo 2 caracteres.' },
      { id: 'cedula',       err: 'err-cedula',       regla: v => /^\d+$/.test(v) && v.length > 0,       msg: 'Solo se permiten números.' },
      { id: 'fechaNac',     err: 'err-fechaNac',     regla: v => v !== '',                               msg: 'Selecciona una fecha.' },
      { id: 'genero',       err: 'err-genero',       regla: v => v !== '',                               msg: 'Selecciona un género.' },
      { id: 'telefono',     err: 'err-telefono',     regla: v => /^\d+$/.test(v) && v.length > 0,       msg: 'Solo se permiten números.' },
      { id: 'especialidad', err: 'err-especialidad', regla: v => v !== '',                               msg: 'Selecciona una especialidad.' },
      { id: 'motivo',       err: 'err-motivo',       regla: v => v.trim().length > 0,                   msg: 'Este campo es requerido.' },
    ];

    let valid = true;
    campos.forEach(c => {
      const input = document.getElementById(c.id);
      const err = document.getElementById(c.err);
      const val = input ? input.value.trim() : '';
      if (!c.regla(val)) {
        if (input) { input.classList.add('invalid'); input.classList.remove('valid'); }
        if (err) err.textContent = c.msg;
        valid = false;
      } else {
        if (input) { input.classList.remove('invalid'); input.classList.add('valid'); }
        if (err) err.textContent = '';
      }
    });

    if (!valid) return;

    const nuevo = {
      nombres:      document.getElementById('nombres').value.trim(),
      apellidos:    document.getElementById('apellidos').value.trim(),
      cedula:       document.getElementById('cedula').value.trim(),
      fechaNac:     document.getElementById('fechaNac').value,
      genero:       document.getElementById('genero').value,
      telefono:     document.getElementById('telefono').value.trim(),
      correo:       document.getElementById('correo').value.trim(),
      especialidad: document.getElementById('especialidad').value,
      direccion:    document.getElementById('direccion').value.trim(),
      motivo:       document.getElementById('motivo').value.trim(),
      fecha: new Date().toLocaleDateString('es-EC', { day:'2-digit', month:'2-digit', year:'numeric' })
    };

    agregarPaciente(nuevo);
    renderTabla(pacientesCache);
    limpiarForm();
    openModal('Registro Exitoso', `El paciente ${nuevo.nombres} ${nuevo.apellidos} fue registrado correctamente.`);
    // Auto-descargar Excel actualizado
    setTimeout(function(){ generarExcel(pacientesLocalGet()); }, 500);
  });
}

// ===== LIMPIAR FORMULARIO =====
function limpiarForm() {
  const ids = ['nombres','apellidos','cedula','fechaNac','genero','telefono','correo','especialidad','direccion','motivo'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('valid','invalid'); }
  });
  document.querySelectorAll('.msg-error').forEach(e => e.textContent = '');
}

// ===== RENDERIZAR TABLA =====
function renderTabla(data) {
  const body = document.getElementById('bodyPacientes');
  const contador = document.getElementById('contadorPacientes');
  if (!body) return;

  if (contador) contador.textContent = `${data.length} paciente${data.length !== 1 ? 's' : ''} registrado${data.length !== 1 ? 's' : ''}`;

  if (data.length === 0) {
    body.innerHTML = '<tr id="filaVacia"><td colspan="8" class="empty-row"><i class="fas fa-user-slash"></i><br/>No hay pacientes registrados aún.</td></tr>';
    return;
  }

  body.innerHTML = data.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${p.nombres} ${p.apellidos}</strong></td>
      <td>${p.cedula}</td>
      <td>${p.genero}</td>
      <td>${p.telefono}</td>
      <td><span class="badge">${p.especialidad}</span></td>
      <td>${p.fecha}</td>
      <td>
        <button class="btn-ver" onclick='verPaciente(${p.id})'><i class="fas fa-eye"></i> Ver</button>
        <button class="btn-del" onclick='eliminarPaciente(${p.id})'><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function verPaciente(id) {
  const p = getPacientes().find(x => x.id === id);
  if (p) abrirModalPaciente(p);
}

function eliminarPaciente(id) {
  if (!confirm('¿Seguro que deseas eliminar este paciente?')) return;
  borrarPaciente(id);
  renderTabla(filtrarLista(document.getElementById('buscarPaciente')?.value || '', pacientesCache));
  setTimeout(function(){ generarExcel(pacientesLocalGet()); }, 500);
}

function filtrarLista(termino, lista) {
  if (!termino) return lista;
  const t = termino.toLowerCase().trim();
  return lista.filter(p => {
    const nombreCompleto = `${p.nombres || ''} ${p.apellidos || ''}`.toLowerCase();
    return nombreCompleto.includes(t);
  });
}

// ===== BUSCADOR =====
function ejecutarBusqueda() {
  const input = document.getElementById('buscarPaciente');
  const termino = input?.value.trim() || '';
  const todos = getPacientes();

  if (!termino) {
    renderTabla(todos);
    return;
  }

  const encontrados = filtrarLista(termino, todos);
  renderTabla(encontrados);

  setTimeout(() => {
    document.querySelectorAll('#bodyPacientes tr').forEach(fila => {
      fila.classList.add('fila-resaltada');
    });
  }, 50);
}

function limpiarBusqueda() {
  const input = document.getElementById('buscarPaciente');
  if (input) input.value = '';
  renderTabla(getPacientes());
}

document.getElementById('buscarPaciente')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') ejecutarBusqueda();
});

// Cargar tabla al iniciar
if (document.getElementById('bodyPacientes')) {
  window._onPacientesCargados = function (arr) {
    pacientesCache = arr;
    var termino = document.getElementById('buscarPaciente')?.value.trim();
    renderTabla(termino ? filtrarLista(termino, arr) : arr);
  };
  cargarPacientes();
  renderTabla(pacientesCache);
}

// ===== ADMIN: OCULTAR TABLA EN MÓVIL =====
(function () {
  var tabla = document.querySelector('.admin-table');
  var msg = document.querySelector('.admin-msg');
  function checkWidth() {
    if (!tabla || !msg) return;
    if (window.innerWidth < 1024) {
      tabla.style.display = 'none';
      msg.style.display = 'block';
    } else {
      tabla.style.display = '';
      msg.style.display = 'none';
    }
  }
  checkWidth();
  window.addEventListener('resize', checkWidth);
})();

// ===== EXPORTAR A EXCEL (.xlsx) =====
function exportarExcel() {
  if (typeof XLSX === 'undefined') {
    openModal('Error', 'La librería Excel no ha cargado. Intenta recargar la página.');
    return;
  }
  var pacientes = getPacientes();
  if (pacientes.length === 0) {
    openModal('Sin datos', 'No hay pacientes registrados para exportar.');
    return;
  }
  generarExcel(pacientes);
}

function generarExcel(pacientes) {
  if (typeof XLSX === 'undefined') {
    return;
  }
  var data = [['#','Nombres','Apellidos','Cédula','Fecha Nac.','Género','Teléfono','Correo','Especialidad','Dirección','Motivo','Fecha Registro']];
  pacientes.forEach(function(p,i){
    data.push([
      i+1, p.nombres, p.apellidos, p.cedula, p.fechaNac, p.genero,
      p.telefono, p.correo||'', p.especialidad, p.direccion||'', p.motivo, p.fecha
    ]);
  });
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{wch:4},{wch:14},{wch:14},{wch:12},{wch:12},{wch:10},{wch:12},{wch:24},{wch:16},{wch:20},{wch:30},{wch:14}];
  XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
  var nombre = 'Pacientes_ClinicaMiPueblito_'+new Date().toISOString().slice(0,10)+'.xlsx';
  XLSX.writeFile(wb, nombre);
}

// ===== FORMULARIO CONTACTO =====
const formContacto = document.getElementById('formContacto');
if (formContacto) {
  formContacto.addEventListener('submit', (e) => {
    e.preventDefault();
    const campos = [
      { id: 'c-nombre',  err: 'err-c-nombre',  regla: v => v.length >= 2,  msg: 'Mínimo 2 caracteres.' },
      { id: 'c-correo',  err: 'err-c-correo',  regla: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Correo inválido.' },
      { id: 'c-asunto',  err: 'err-c-asunto',  regla: v => v.length >= 3,  msg: 'Mínimo 3 caracteres.' },
      { id: 'c-mensaje', err: 'err-c-mensaje', regla: v => v.length >= 10, msg: 'Mínimo 10 caracteres.' },
    ];
    let valid = true;
    campos.forEach(c => {
      const input = document.getElementById(c.id);
      const err = document.getElementById(c.err);
      const val = input ? input.value.trim() : '';
      if (!c.regla(val)) {
        if (input) { input.classList.add('invalid'); input.classList.remove('valid'); }
        if (err) err.textContent = c.msg;
        valid = false;
      } else {
        if (input) { input.classList.remove('invalid'); input.classList.add('valid'); }
        if (err) err.textContent = '';
      }
    });
    if (!valid) return;

    const nombre  = document.getElementById('c-nombre')?.value.trim()  || '';
    const correo  = document.getElementById('c-correo')?.value.trim()  || '';
    const asunto  = document.getElementById('c-asunto')?.value.trim()  || '';
    const mensaje = document.getElementById('c-mensaje')?.value.trim() || '';

    const texto = `Hola, Clínica Mi Pueblito.%0A%0ANombre: ${encodeURIComponent(nombre)}%0ACorreo: ${encodeURIComponent(correo)}%0AAsunto: ${encodeURIComponent(asunto)}%0AMensaje: ${encodeURIComponent(mensaje)}`;
    const whatsappUrl = `https://wa.me/50289741725?text=${texto}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    openModal('✅ Mensaje Enviado', 'Se abrió WhatsApp con tu mensaje listo para enviarlo.');
    formContacto.reset();
    formContacto.querySelectorAll('input, textarea').forEach(el => el.classList.remove('valid','invalid'));
  });
}