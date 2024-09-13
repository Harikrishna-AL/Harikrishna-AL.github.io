// Scroll animation for fading in sections
const fadeInElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeInElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
        }
    });
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});


window.addEventListener('scroll', fadeInOnScroll);

// Trigger initial fade-in for elements already in view
document.addEventListener('DOMContentLoaded', fadeInOnScroll);
