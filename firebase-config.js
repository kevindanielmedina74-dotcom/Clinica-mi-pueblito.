// ===== CONFIGURACION DE FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyD-n619sFipJG7suBudcF4XhZybG9M37Do",
  authDomain: "clinica-mi-pueblito.firebaseapp.com",
  projectId: "clinica-mi-pueblito",
  storageBucket: "clinica-mi-pueblito.firebasestorage.app",
  messagingSenderId: "453330398519",
  appId: "1:453330398519:web:ce8de6406f94af1cc73eb2",
  measurementId: "G-BKL9JFVJ4E"
};

var _db = null;
try {
  firebase.initializeApp(firebaseConfig);
  _db = firebase.firestore();
} catch (_) {}

function _get() { return JSON.parse(localStorage.getItem('clinica-pacientes') || '[]'); }
function _set(d) { localStorage.setItem('clinica-pacientes', JSON.stringify(d)); }

window.cargarPacientesFirebase = function () {
  var local = _get();
  if (_db) {
    Promise.race([
      _db.collection('pacientes').orderBy('fecha', 'desc').get(),
      new Promise(function (_, rej) { setTimeout(function () { rej('timeout'); }, 3000); })
    ]).then(function (snap) {
      var arr = snap.docs.map(function (d) { return { ...d.data(), id: d.id }; });
      _set(arr);
      if (window._onPacientesCargados) window._onPacientesCargados(arr);
    }).catch(function () {});
  }
  return local;
};

window.agregarPacienteFirebase = function (p) {
  if (_db) _db.collection('pacientes').add(Object.assign({}, p)).catch(function () {});
};

window.borrarPacienteFirebase = function (id) {
  if (_db) {
    _db.collection('pacientes').where('id', '==', id).get()
      .then(function (snap) { snap.forEach(function (d) { d.ref.delete(); }); })
      .catch(function () {});
  }
};
