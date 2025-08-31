// userAuth.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQcCGxrCgwlA8MM2vtZgVX28--Vuf7sFw",
  authDomain: "juegousuariosactivos.firebaseapp.com",
  projectId: "juegousuariosactivos",
  storageBucket: "juegousuariosactivos.firebasestorage.app",
  messagingSenderId: "896535330309",
  appId: "1:896535330309:web:9e96e6818c0288d93ae66c"
};

// Inicializar app Firebase solo una vez
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Obtener instancia Auth
const auth = getAuth(app);

// Esperar a que cambie el estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuario autenticado
    sessionStorage.setItem('uid', user.uid);
    console.log("Usuario autenticado con UID:", user.uid);
  } else {
    // No hay usuario, iniciar sesión anónima
    signInAnonymously(auth)
      .then(() => {
        console.log("Sesión anónima iniciada");
      })
      .catch((error) => {
        console.error("Error al autenticar anónimamente:", error);
        // Opcional: redirigir o mostrar error visible
      });
  }
});
