// ==========================================
// GALAXY DIGITAL PARTNERS
// SHARED WEBSITE INTERACTIONS
// ==========================================


// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {

  function closeMenu() {
    mainNav.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }

  menuToggle.addEventListener("click", () => {

    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );

  });

  // Close menu after selecting a link.
  mainNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", closeMenu);

  });

  // Close menu when clicking outside it.
  document.addEventListener("click", event => {

    const clickedInsideMenu = mainNav.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu();
    }

  });

  // Close menu with Escape.
  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
      closeMenu();
    }

  });

}


// ==========================================
// FOOTER COPYRIGHT YEAR
// ==========================================

const year = document.getElementById("year");

if (year) {

  year.textContent = new Date().getFullYear();

}


// ==========================================
// SCROLL REVEAL ANIMATIONS
// ==========================================

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

  const revealObserver = new IntersectionObserver(

    (entries, observer) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        }

      });

    },

    {
      threshold: 0.12
    }

  );

  revealItems.forEach(item => {

    revealObserver.observe(item);

  });

} else {

  // Fallback for browsers without IntersectionObserver.
  revealItems.forEach(item => {

    item.classList.add("visible");

  });

}


// ==========================================
// ACTIVE NAVIGATION ON HOMEPAGE
// ==========================================

const sections = document.querySelectorAll("main section[id]");

const currentPage = window.location.pathname;

const isHomePage =
  currentPage.endsWith("/") ||
  currentPage.endsWith("/index.html");

if (
  isHomePage &&
  sections.length > 0 &&
  "IntersectionObserver" in window
) {

  const sectionObserver = new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        document.querySelectorAll(".nav-link").forEach(link => {

          const href = link.getAttribute("href");

          link.classList.toggle(
            "active",
            href === `#${entry.target.id}`
          );

        });

      });

    },

    {
      rootMargin: "-35% 0px -55% 0px"
    }

  );

  sections.forEach(section => {

    sectionObserver.observe(section);

  });

}


// ==========================================
// BACK TO TOP
// ==========================================

const backToTop = document.getElementById("backToTop");

if (backToTop) {

  backToTop.addEventListener("click", event => {

    event.preventDefault();

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  });

}


// ==========================================
// END
// ==========================================