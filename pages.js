
import { supabase } from "./supabase.js";

// ==========================================
// Galaxy Digital Advertisers
// SERVICE DETAILS PAGE
// ==========================================


// ==========================================
// MOBILE NAVIGATION
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {

  menuToggle.addEventListener("click", () => {

    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );

  });

  mainNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mainNav.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");

    });

  });

  document.addEventListener("click", event => {

    if (
      !mainNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {

      mainNav.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");

    }

  });

}


// ==========================================
// FOOTER YEAR
// ==========================================

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


// ==========================================
// HTML SECURITY HELPER
// ==========================================

function escapeHTML(value) {

  return String(value ?? "").replace(/[&<>"']/g, character => ({

    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"

  })[character]);

}


// ==========================================
// PAGE ELEMENTS
// ==========================================

const serviceContainer = document.getElementById("serviceDetails");


// ==========================================
// SERVICE NOT FOUND
// ==========================================

function showNotFound() {

  if (!serviceContainer) return;

  serviceContainer.setAttribute("aria-busy", "false");

  serviceContainer.innerHTML = `

    <div class="info-box">

      <h2>Service Not Found</h2>

      <p>
        This service may have been removed,
        unpublished, or the link may be incorrect.
      </p>

      <a class="card-link" href="services.html">
        Return to Services →
      </a>

    </div>

  `;

}


// ==========================================
// SERVICE LOADING ERROR
// ==========================================

function showLoadingError() {

  if (!serviceContainer) return;

  serviceContainer.setAttribute("aria-busy", "false");

  serviceContainer.innerHTML = `

    <div class="info-box">

      <h2>Unable to Load Service</h2>

      <p>
        We could not load this service at the moment.
        Please try again later.
      </p>

      <a class="card-link" href="services.html">
        Return to Services →
      </a>

    </div>

  `;

}


// ==========================================
// FORMAT DATABASE LISTS
// ==========================================

function normalizeList(value) {

  if (Array.isArray(value)) {

    return value.filter(item =>
      typeof item === "string" && item.trim() !== ""
    );

  }

  if (typeof value === "string" && value.trim() !== "") {

    return [value];

  }

  return [];

}


// ==========================================
// LOAD SERVICE FROM SUPABASE
// ==========================================

async function loadService() {

  if (!serviceContainer) return;

  const params = new URLSearchParams(window.location.search);

  const slug = params.get("service");

  if (!slug || !slug.trim()) {

    showNotFound();
    return;

  }

  serviceContainer.setAttribute("aria-busy", "true");

  serviceContainer.innerHTML = `
    <p class="services-status">
      Loading service information...
    </p>
  `;

  try {

    const {
      data: service,
      error
    } = await supabase

      .from("services")

      .select(`
        id,
        slug,
        title,
        intro,
        description,
        benefits,
        requirements,
        is_published
      `)

      .eq("slug", slug.trim())
      .eq("is_published", true)

      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!service) {

      showNotFound();
      return;

    }

    // Update browser tab title.

    document.title =
      `${service.title} | Galaxy Digital Advertisers`;

    displayService(service);

    serviceContainer.setAttribute("aria-busy", "false");

    // Gallery loading is independent of service details.

    await loadServiceImages(service.id);

  } catch (error) {

    console.error("Service loading error:", error);

    showLoadingError();

  }

}


// ==========================================
// DISPLAY SERVICE INFORMATION
// ==========================================

function displayService(service) {

  if (!serviceContainer) return;

  const title = escapeHTML(service.title || "Service");

  const intro = escapeHTML(service.intro || "");

  const description = escapeHTML(service.description || "");

  const benefits = normalizeList(service.benefits);

  const requirements = normalizeList(service.requirements);


  const benefitsHTML = benefits.length

    ? benefits.map(item => `
        <li>${escapeHTML(item)}</li>
      `).join("")

    : "<li>Contact us to learn more.</li>";


  const requirementsHTML = requirements.length

    ? requirements.map(item => `
        <p>${escapeHTML(item)}</p>
      `).join("")

    : "<p>Please contact us for further information.</p>";


  const whatsappMessage = encodeURIComponent(
    `I am interested in ${service.title || "your service"}.`
  );

  const whatsappURL =
    `https://wa.me/923339970586?text=${whatsappMessage}`;


  serviceContainer.innerHTML = `

    <div class="detail-layout">

      <div class="detail-main">

        <div class="eyebrow">
          OUR SERVICES
        </div>

        <h1 class="service-detail-title">
          ${title}
        </h1>

        ${
          intro
            ? `<p class="service-detail-intro">${intro}</p>`
            : ""
        }

        <section class="detail-section">

          <h2>About This Service</h2>

          <p>
            ${description || "Contact us to learn more about this service."}
          </p>

        </section>

        <section class="detail-section">

          <h2>What We Offer</h2>

          <ul class="detail-list">
            ${benefitsHTML}
          </ul>

        </section>

        <section class="detail-section">

          <h2>Requirements and Eligibility</h2>

          <div class="detail-list">
            ${requirementsHTML}
          </div>

        </section>

      </div>

      <aside class="detail-sidebar">

        <h3>Interested in this service?</h3>

        <p>
          Contact Galaxy Digital Advertisers to discuss
          your website and potential opportunities.
        </p>

        <a
          class="btn-yellow"
          href="${whatsappURL}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact Us →
        </a>

      </aside>

    </div>

    <div id="serviceGallery"></div>

  `;

}


// ==========================================
// LOAD SERVICE IMAGES FROM SUPABASE
// ==========================================

async function loadServiceImages(serviceId) {

  const galleryContainer =
    document.getElementById("serviceGallery");

  if (!galleryContainer) return;

  try {

    const {
      data: images,
      error
    } = await supabase

      .from("service_images")

      .select(`
        id,
        image_path,
        title,
        description,
        sort_order
      `)

      .eq("service_id", serviceId)

      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    if (!images || images.length === 0) {

      galleryContainer.innerHTML = "";
      return;

    }

    const validImages = images.map(image => {

      const { data } = supabase.storage

        .from("service-images")

        .getPublicUrl(image.image_path);

      return {

        ...image,

        publicURL: data.publicUrl

      };

    });

    displayGallery(validImages, galleryContainer);

  } catch (error) {

    console.error("Gallery loading error:", error);

    galleryContainer.innerHTML = `

      <div class="info-box">

        <p>
          Gallery images are temporarily unavailable.
        </p>

      </div>

    `;

  }

}


// ==========================================
// DISPLAY SERVICE GALLERY
// ==========================================

function displayGallery(images, container) {

  const imageHTML = images.map((image, index) => {

    const imageURL = escapeHTML(image.publicURL);

    const imageTitle = escapeHTML(
      image.title || "Service Image"
    );

    const imageDescription = escapeHTML(
      image.description || ""
    );

    return `

      <div class="gallery-item">

        <img
          src="${imageURL}"
          alt="${imageTitle}"
          loading="lazy"
          data-gallery-index="${index}"
          tabindex="0"
          role="button"
          aria-label="Open ${imageTitle}"
        >

        ${
          image.title || image.description

            ? `

              <div class="gallery-caption">

                ${
                  image.title
                    ? `<h3>${imageTitle}</h3>`
                    : ""
                }

                ${
                  image.description
                    ? `<p>${imageDescription}</p>`
                    : ""
                }

              </div>

            `

            : ""
        }

      </div>

    `;

  }).join("");


  container.innerHTML = `

    <section class="service-gallery">

      <h2>Our Work & Gallery</h2>

      <div class="service-gallery-grid">

        ${imageHTML}

      </div>

    </section>

  `;


  // IMAGE INTERACTIONS

  container.querySelectorAll(".gallery-item img")
    .forEach(image => {

      image.addEventListener("click", () => {

        const index = Number(image.dataset.galleryIndex);

        openLightbox(images, index, image);

      });


      image.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {

          event.preventDefault();

          const index = Number(image.dataset.galleryIndex);

          openLightbox(images, index, image);

        }

      });


      image.addEventListener("error", () => {

        console.error("Image failed to load:", image.src);

        image.alt = "Image could not be loaded";

      });

    });

}


// ==========================================
// IMAGE LIGHTBOX
// ==========================================

let currentGallery = [];

let currentImageIndex = 0;

let previousFocusedElement = null;


function openLightbox(images, index, sourceElement) {

  closeLightbox();

  currentGallery = images;

  currentImageIndex = index;

  previousFocusedElement = sourceElement;


  const overlay = document.createElement("div");

  overlay.className = "service-lightbox";

  overlay.setAttribute("role", "dialog");

  overlay.setAttribute("aria-modal", "true");

  overlay.setAttribute("aria-label", "Image gallery");


  overlay.innerHTML = `

    <button
      class="lightbox-close"
      aria-label="Close gallery"
      type="button"
    >
      &times;
    </button>

    <button
      class="lightbox-prev"
      aria-label="Previous image"
      type="button"
    >
      &#10094;
    </button>

    <div class="lightbox-content">

      <img
        class="lightbox-image"
        src=""
        alt=""
      >

      <p class="lightbox-caption"></p>

    </div>

    <button
      class="lightbox-next"
      aria-label="Next image"
      type="button"
    >
      &#10095;
    </button>

  `;


  document.body.appendChild(overlay);

  document.body.classList.add("lightbox-open");


  overlay.querySelector(".lightbox-close")
    .addEventListener("click", closeLightbox);

  overlay.querySelector(".lightbox-prev")
    .addEventListener("click", showPreviousImage);

  overlay.querySelector(".lightbox-next")
    .addEventListener("click", showNextImage);


  overlay.addEventListener("click", event => {

    if (event.target === overlay) {
      closeLightbox();
    }

  });


  updateLightboxImage();

  overlay.querySelector(".lightbox-close").focus();

  document.addEventListener("keydown", handleLightboxKeyboard);

}


// ==========================================
// UPDATE LIGHTBOX IMAGE
// ==========================================

function updateLightboxImage() {

  const overlay = document.querySelector(".service-lightbox");

  if (!overlay || !currentGallery.length) return;

  const image = currentGallery[currentImageIndex];

  const lightboxImage =
    overlay.querySelector(".lightbox-image");

  const caption =
    overlay.querySelector(".lightbox-caption");


  lightboxImage.src = image.publicURL;

  lightboxImage.alt = image.title || "Service Image";

  caption.textContent =
    image.title || image.description || "";


  const previousButton =
    overlay.querySelector(".lightbox-prev");

  const nextButton =
    overlay.querySelector(".lightbox-next");


  const hasMultipleImages = currentGallery.length > 1;

  previousButton.hidden = !hasMultipleImages;

  nextButton.hidden = !hasMultipleImages;

}


// ==========================================
// PREVIOUS IMAGE
// ==========================================

function showPreviousImage() {

  if (!currentGallery.length) return;

  currentImageIndex =

    (currentImageIndex - 1 + currentGallery.length)
    % currentGallery.length;

  updateLightboxImage();

}


// ==========================================
// NEXT IMAGE
// ==========================================

function showNextImage() {

  if (!currentGallery.length) return;

  currentImageIndex =

    (currentImageIndex + 1)
    % currentGallery.length;

  updateLightboxImage();

}


// ==========================================
// CLOSE LIGHTBOX
// ==========================================

function closeLightbox() {

  const overlay = document.querySelector(".service-lightbox");

  if (overlay) {
    overlay.remove();
  }

  document.body.classList.remove("lightbox-open");

  document.removeEventListener(
    "keydown",
    handleLightboxKeyboard
  );

  // Return keyboard focus to the image that opened the gallery.

  if (previousFocusedElement?.isConnected) {
    previousFocusedElement.focus();
  }

  previousFocusedElement = null;

}


// ==========================================
// LIGHTBOX KEYBOARD CONTROLS
// ==========================================

function handleLightboxKeyboard(event) {

  if (event.key === "Escape") {

    closeLightbox();

  }

  if (event.key === "ArrowLeft") {

    event.preventDefault();

    showPreviousImage();

  }

  if (event.key === "ArrowRight") {

    event.preventDefault();

    showNextImage();

  }

}


// ==========================================
// START
// ==========================================

loadService();
