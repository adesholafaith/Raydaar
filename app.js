
// const icon_menu = document.querySelector(".icon-menu");
// const nav = document.querySelector(".header-nav nav");

// icon_menu.onclick =() => {
//     if (nav.style.transform == "translateX(0%)") {
//         nav.style.transform = "translateX(-150%)";
//         icon_menu.src = "./images/icon-hamburger.svg";
//     } else {
//         nav.style.transform = "translateX(0%)";
//         icon_menu.src = "./images/icon-close.svg";
//     }
// };

document.addEventListener("DOMContentLoaded", function () {
  

  const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".header-nav nav");

let lastScroll = 0;

// Hamburger click toggle
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  nav.classList.toggle("active");
});

// Hide on scroll
window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll) {
    // scrolling down
    hamburger.classList.add("hide");
  } else {
    // scrolling up
    hamburger.classList.remove("hide");
  }

  lastScroll = currentScroll <= 0 ? 0 : currentScroll;
});

// Close menu when a link is clicked
document.querySelectorAll(".header-nav nav ul li a").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    nav.classList.remove("active");
  });
});


  // ====== Text Rotator ======
  const texts = [
    "Welcome to Raydaar!",
    "Design. Strategy. Growth.",
    "Don't miss our latest updates",
    "Follow us on social media",
    "Let's work together"
  ];

  let index = 0;
  const textDisplay = document.getElementById("text-display");
  if (textDisplay) {
    function changeText() {
      textDisplay.textContent = texts[index];
      index = (index + 1) % texts.length;
    }
    changeText();
    setInterval(changeText, 3000);
  }


  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if(entry.target.classList.contains('about-wrapper-left')){
                entry.target.classList.add('slide-in-left-show');
            } 
            if(entry.target.classList.contains('about-wrapper-right')){
                entry.target.classList.add('slide-in-right-show');
            }
        }
    });
}, { threshold: 0.2 }); 

document.querySelectorAll('.about-wrapper-left, .about-wrapper-right').forEach(el => {
    observer.observe(el);
});


// ====== Radar Section Activation on Scroll ======
const radarSection = document.querySelector('.radar');

if (radarSection) {
  const canvas = radarSection.querySelector("#radar");
  const labelsContainer = radarSection.querySelector("#radar-labels");
  if (!canvas || !labelsContainer) return;

  const beep = new Audio('sounds/beep.wav');
  beep.volume = 0.2;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  let radarRadius = Math.min(w, h) / 2 - 60;
  let angle = 0; // sweep angle
  let blips = []; // array of {r, theta, alpha, beeped}
  let animationRunning = false;

  // ===== Add a blip along the sweep line =====
  function addBlip() {
    const r = Math.random() * 200;
    const theta = angle; // align with current sweep angle
    blips.push({
      r,
      theta, 
      alpha: 1,
      beeped: false
    });
  }

  // ===== Draw Grid =====
  function drawGrid() {
    ctx.strokeStyle = "#1845e7";
    ctx.lineWidth = 2;
    for (let r = 50; r <= 200; r += 50) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - 200, cy);
    ctx.lineTo(cx + 200, cy);
    ctx.moveTo(cx, cy - 200);
    ctx.lineTo(cx, cy + 200);
    ctx.stroke();
  }

  // ===== Draw Sweep =====
  function drawSweep() {
    const sweepLength = 200;
    const rad = (angle * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + sweepLength * Math.cos(rad), cy + sweepLength * Math.sin(rad));
    ctx.strokeStyle = "rgba(24, 69, 231, 1)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // ===== Draw Blips =====
  function drawBlips() {
    blips = blips.filter(b => b.alpha > 0);
    blips.forEach(b => {
      // Calculate x,y based on r and theta
      const rad = (b.theta * Math.PI) / 180;
      const x = cx + b.r * Math.cos(rad);
      const y = cy + b.r * Math.sin(rad);

      ctx.fillStyle = `rgba(24, 69, 231,${b.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      b.alpha -= 0.01;

      // Play beep when sweep "hits" the blip (within 2 degrees)
      if (!b.beeped && Math.abs((angle % 360) - b.theta) < 2) {
        beep.currentTime = 0;
        beep.play().catch(e => {});
        b.beeped = true;
      }
    });
  }

  // ===== Animation Loop =====
  function animate() {
    if (!animationRunning) return;

    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    drawGrid();
    drawBlips();
    drawSweep();

    angle = (angle + 1) % 360;

    requestAnimationFrame(animate);
  }

  // ===== Intersection Observer =====
  let isSectionVisible = false;
  let blipInterval = null;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isSectionVisible = true;

        if (!animationRunning) {
          animationRunning = true;
          animate();
        }

        if (!blipInterval) {
          // add a new sweep-aligned blip every 2 seconds
          blipInterval = setInterval(() => {
            addBlip();
          }, 2000);
        }

      } else {
        isSectionVisible = false;
        if (blipInterval) {
          clearInterval(blipInterval);
          blipInterval = null;
        }
        animationRunning = false;
      }
    });
  }, { threshold: 0.3 });

  observer.observe(radarSection);

  // ===== Pause beeps when tab is hidden =====
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && blipInterval) {
      clearInterval(blipInterval);
      blipInterval = null;
    } else if (!document.hidden && isSectionVisible && !blipInterval) {
      blipInterval = setInterval(addBlip, 2000);
    }
  });
}


  // ====== Typing effect ======
  const element = document.getElementById("typeText");
  if (element) {
    const fullText = element.innerHTML.trim();
    const clone = element.cloneNode(true);
    clone.style.visibility = "hidden";
    clone.style.position = "absolute";
    clone.style.border = "none";
    document.body.appendChild(clone);
    const exactHeight = clone.offsetHeight;
    document.body.removeChild(clone);
    element.style.height = exactHeight + "px";
    element.innerHTML = "";
    let i = 0;
    function type() {
      element.innerHTML = fullText.slice(0, i);
      i++;
      if (i <= fullText.length) setTimeout(type, 30);
    }
    setTimeout(type, 1000);
  }

  // ====== Zoom on scroll ======
  const zoomElements = document.querySelectorAll('.zoom-scroll');
  if (zoomElements.length) {
    const observer = new IntersectionObserver(entries => { 
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.2 });
    zoomElements.forEach(el => observer.observe(el));
  }

  // ====== Radar labels ======
  const wrapper = document.querySelector('.radar');
  const labelsContainer = document.getElementById('radar-labels');
  if (wrapper && labelsContainer) {
    const firstRing = [
      { text: "Strategy", angle: 80 },
      { text: "Design", angle: 255 },
      { text: "Solutions", angle: 75 },
      { text: "Website Design", angle: 100 },
      { text: "Alignment", angle: 105 },
      { text: "Growth", angle: 115 },
      { text: "Consulting", angle: 130 },
    ];
    const secondRing = [
      { text: "Analytics", angle: 125 },
      { text: "Creativity", angle: 245 },
      { text: "Transformation", angle: 250 },
      { text: "Branding", angle: 260 },
      { text: "Marketing", angle: 270 },
      { text: "Execution", angle: 290 }
    ];

    function loadOrGenerateRandomness(key, labels) {
      let saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      const generated = labels.map(() => ({ wobble: (Math.random() * 20 - 10) * (Math.PI / 180), radiusOffset: 0.9 + Math.random() * 0.2 }));
      localStorage.setItem(key, JSON.stringify(generated));
      return generated;
    }

    const firstRingRandomness = loadOrGenerateRandomness("firstRingPositions", firstRing);
    const secondRingRandomness = loadOrGenerateRandomness("secondRingPositions", secondRing);

    function placeRing(labels, randomness, baseMultiplier) {
      const rect = wrapper.getBoundingClientRect();
      const radius = rect.width / 2;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      labels.forEach((label, i) => {
        const r = randomness[i];
        let angleRad = (label.angle - 90) * (Math.PI / 180);
        angleRad += r.wobble;
        const finalRadius = radius * baseMultiplier * r.radiusOffset;
        const x = centerX + finalRadius * Math.cos(angleRad);
        const y = centerY + finalRadius * Math.sin(angleRad);
        const el = document.createElement("div");
        el.textContent = label.text;
        el.classList.add("radar-label");
        el.style.animationDuration = `${1.5 + Math.random()}s`;
        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        labelsContainer.appendChild(el);
      });
    }

    function placeLabels() {
      labelsContainer.innerHTML = "";
      placeRing(firstRing, firstRingRandomness, 0.70);
      placeRing(secondRing, secondRingRandomness, 0.60);
    }

    placeLabels();
    window.addEventListener("resize", placeLabels);
  }

  // ====== Scroll to top button ======
  const btn = document.querySelector(".top");
  if (btn) {
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }





const cards = document.querySelectorAll("#cards-section .card");
const section = document.getElementById("cards-section");
const totalCards = cards.length;

window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    // Scroll progress inside section (0 to 1)
    let progress = (scrollTop - sectionTop) / sectionHeight;
    progress = Math.max(0, Math.min(progress, 1));

    // Which card should be active
    const index = Math.floor(progress * totalCards);

    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add("active");
        } else {
            card.classList.remove("active");
        }
    });
});



//EmailJS for form submission
    (function() {
        emailjs.init("rxrXGaa54jshSE5q1");
    })();

    document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault();

    emailjs.sendForm("service_xox84yg", "template_7y36qlp", this)
        .then(() => {
        alert("Message sent successfully!");
        }, (error) => {
        alert("Failed to send message: " + JSON.stringify(error));
        });
    });


const navBtn = document.querySelector(".nav-btn");

const swapNavBtn = () => {
  if (window.innerWidth <= 600) {
    navBtn.classList.add("hamburger-icon");
    navBtn.textContent = " ";
  } else {
    navBtn.classList.remove("hamburger");
    navBtn.textContent = "Contact";
  }
};

swapNavBtn();
window.addEventListener("resize", () => swapNavBtn());


}); // end DOMContentLoaded

