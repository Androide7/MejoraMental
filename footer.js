'use strict';
document.addEventListener("DOMContentLoaded", function () {
    // Crear el footer
    const footer = document.createElement("footer");
    footer.className = "footer";
    footer.innerHTML = `
    <div class="footer-section">
      <h3>Johnn Betrayed 2025</h3>           
    </div>
    <div class="footer-section">
      <h3>Donación PayPal</h3>
      <div class="email-container">
        <span id="copyEmail" class="clickable">johnndeltaa@gmail.com</span>
        <span id="copyNotification" class="copy-notification">¡Copiado!</span>
      </div>
    </div>
    <div class="footer-section">
      <h3>Política de Privacidad</h3>
      <p><a href="#" id="privacyLink">Ver política</a></p>          
    </div>
  `;
    document.body.appendChild(footer);

    // Copiar email al portapapeles
    const copyEmail = document.getElementById("copyEmail");
    const notification = document.getElementById("copyNotification");

    copyEmail.addEventListener("click", function () {
        navigator.clipboard.writeText(copyEmail.textContent).then(() => {
            notification.classList.add("show");
            setTimeout(() => {
                notification.classList.remove("show");
            }, 1500);
        });
    });

    // Crear modal de política de privacidad
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "privacyOverlay";
    modalOverlay.innerHTML = `
      <div class="privacy-modal">
        <h2>Términos y Política de Privacidad</h2>
        <p>Esta página y sus juegos están diseñados con fines educativos y de entretenimiento. No se recopilan datos personales identificables sin consentimiento.</p>
        <p>Los puntajes o interacciones se almacenan solo con fines de competencia global dentro de la plataforma.</p>
        <p>Al utilizar nuestros juegos, aceptas estos términos.</p>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Mostrar/ocultar modal
    const privacyLink = document.getElementById("privacyLink");

    privacyLink.addEventListener("click", function (e) {
        e.preventDefault();
        modalOverlay.classList.add("visible");
    });

    modalOverlay.addEventListener("click", function (e) {
        if (!e.target.closest(".privacy-modal")) {
            modalOverlay.classList.remove("visible");
        }
    });
});
