const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');  // Añadir la clase para que se vea el elemento
            observer.unobserve(entry.target);  // Dejar de observar el elemento una vez se haya hecho visible
        }
    });
}, {
    threshold: 0.2  // El elemento debe estar al menos 50% visible en el viewport
});

// Seleccionar todos los elementos con la clase `.fade-in` y observarlos
document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
});