// Preloader functionality
window.addEventListener('load', function () {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.classList.add('loaded');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function () {
  // Add smooth scroll behavior to scroll-top button
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    scrollTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Show/hide scroll-top button based on scroll position
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 300) {
        scrollTop.style.display = 'block';
      } else {
        scrollTop.style.display = 'none';
      }
    });
  }
});