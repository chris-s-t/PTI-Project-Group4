const ships = [
  {
    name: "Destroyer 1",
    category: "Destroyer",
    desc: "Fast and aggressive",
    stats: ["Speed: 80", "Health: 60", "Fuel: 40"],
    img: "Assets/Ships and Stations/Destroyer 1.png",
  },
  {
    name: "Destroyer 2",
    category: "Destroyer",
    desc: "High firepower destroyer",
    stats: ["Speed: 70", "Health: 70", "Fuel: 50"],
    img: "Assets/Ships and Stations/Destroyer 2.png",
  },
  {
    name: "Cruiser 1",
    category: "Cruiser",
    desc: "Balanced warship",
    stats: ["Speed: 60", "Health: 80", "Fuel: 60"],
    img: "Assets/Ships and Stations/Cruiser 1.png",
  },
  {
    name: "Cruiser 2",
    category: "Cruiser",
    desc: "Heavy cruiser model",
    stats: ["Speed: 55", "Health: 90", "Fuel: 70"],
    img: "Assets/Ships and Stations/Cruiser 2.png",
  },
  {
    name: "Cruiser 3",
    category: "Cruiser",
    desc: "Reinforced cruiser",
    stats: ["Speed: 58", "Health: 85", "Fuel: 65"],
    img: "Assets/Ships and Stations/Cruiser 3.png",
  },
  {
    name: "Alien",
    category: "Alien",
    desc: "Stealth alien scout",
    stats: ["Speed: 95", "Health: 40", "Fuel: 80"],
    img: "Assets/Ships and Stations/Alien 3.png",
  },
  {
    name: "Frigate 1",
    category: "Frigate",
    desc: "Light attack frigate",
    stats: ["Speed: 45", "Health: 75", "Fuel: 55"],
    img: "Assets/Ships and Stations/Frigate 1.png",
  },
  {
    name: "Frigate 2",
    category: "Frigate",
    desc: "Light attack frigate",
    stats: ["Speed: 75", "Health: 55", "Fuel: 45"],
    img: "Assets/Ships and Stations/Frigate 2.png",
  },
];

function filterCategory(category) {
  const list = document.getElementById("shipList");
  list.innerHTML = "";
  ships
    .filter((s) => category === "All" || s.category === category)
    .forEach((ship) => {
      const div = document.createElement("div");
      div.className = "ship-option cursor-pointer relative";
      div.innerHTML = `
        <img src="${ship.img}" alt="${ship.name}">
        <p class="mt-2 text-center">${ship.name}</p>
      `;
      div.onclick = () => previewShip(ship.name, ship.desc, ...ship.stats, ship.img);
      list.appendChild(div);
    });
}

function previewShip(name, desc, stat1, stat2, stat3, imgSrc) {
  const preview = document.getElementById("shipPreview");
  const shipListContainer = document.getElementById("shipListContainer");

  document.getElementById("previewImage").src = imgSrc;
  document.getElementById("previewName").textContent = name;
  document.getElementById("previewDesc").textContent = desc;
  document.getElementById("stat1").textContent = stat1;
  document.getElementById("stat2").textContent = stat2;
  document.getElementById("stat3").textContent = stat3;

  shipListContainer.classList.remove("w-full");
  shipListContainer.classList.add("w-full", "lg:w-1/2");

  preview.classList.remove("hidden");
}

function startGame() {
  const selectedShip = {
    name: document.getElementById("previewName").textContent,
    desc: document.getElementById("previewDesc").textContent,
    stats: [
      document.getElementById("stat1").textContent,
      document.getElementById("stat2").textContent,
      document.getElementById("stat3").textContent
    ],
    img: document.getElementById("previewImage").src
  };

  localStorage.setItem("selectedShip", JSON.stringify(selectedShip));

  window.location.href = "main.html";
}

const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
const numStars = 100;

function resizeCanvas() {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

function createStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.5,
    });
  }
}

function updateStars() {
  for (let star of stars) {
    star.x += star.speedX;
    star.y += star.speedY;

    if (star.x < 0) star.x = canvas.width;
    if (star.x > canvas.width) star.x = 0;
    if (star.y < 0) star.y = canvas.height;
    if (star.y > canvas.height) star.y = 0;
  }
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 199, 255, ${star.opacity})`;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "white";
    ctx.fill();
  }
}

function animate() {
  updateStars();
  drawStars();
  requestAnimationFrame(animate);
}

window.onload = () => filterCategory("All");

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
window.addEventListener('load', () => {
  resizeCanvas();
  createStars();
  animate();
});

resizeCanvas();
createStars();
animate();