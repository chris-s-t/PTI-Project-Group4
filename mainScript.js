const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let boat, obstacles, fuelPickups;
let keysPressed = {};

let shipCharacter = new Image();
shipCharacter.src = "Assets/Ships and Stations/Destroyer 1.png";
shipCharacter.onload = () => {
  gameLoop();
};

function initializeGame() {
  boat = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 100,
    height: 100,
    speed: 3,
    dx: 0,
    dy: 0,
    fuel: 1000,
    health: 100,
    hygiene: 100,
    acceleration: 0.1,
    maxSpeed: 5,
    friction: 0.95,
    rotation: 0,
    rotationSpeed: 2,
  };
  obstacles = [];
  fuelPickups = [];
  keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
  };
  document.getElementById("gameOverScreen").style.display = "none";
}

function generateObjects() {
  if (Math.random() < 0.02) {
    obstacles.push({
      x: boat.x + Math.random() * canvas.width - canvas.width / 2,
      y: boat.y + Math.random() * canvas.height - canvas.height / 2,
      size: 30 + Math.random() * 20,
    });
  }
  if (Math.random() < 0.01) {
    fuelPickups.push({
      x: boat.x + Math.random() * canvas.width - canvas.width / 2,
      y: boat.y + Math.random() * canvas.height - canvas.height / 2,
      size: 20,
    });
  }
}

function drawObjects() {
  ctx.fillStyle = "brown";
  obstacles.forEach((obstacle) => {
    ctx.fillRect(
      obstacle.x - boat.x + canvas.width / 2,
      obstacle.y - boat.y + canvas.height / 2,
      obstacle.size,
      obstacle.size
    );
  });

  ctx.fillStyle = "yellow";
  fuelPickups.forEach((fuel) => {
    ctx.beginPath();
    ctx.arc(
      fuel.x - boat.x + canvas.width / 2,
      fuel.y - boat.y + canvas.height / 2,
      fuel.size / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function drawBoat() {
  let hygieneFactor = boat.hygiene / 100;
  let colorIntensity = Math.floor(255 * hygieneFactor);

  ctx.save(); // Save the current state
  ctx.translate(canvas.width / 2, canvas.height / 2); // Move to the center
  ctx.rotate((boat.rotation * Math.PI) / 180);
  ctx.fillStyle = `rgba(0, 0, 0, ${0})`;
  ctx.drawImage(
    shipCharacter,
    -boat.width / 2,
    -boat.height / 2,
    boat.width,
    boat.height
  );
  ctx.fillRect(-boat.width / 2, -boat.height / 2, boat.width, boat.height); // Draw the boat centered at (0, 0)
  ctx.restore();
}

function updateBars() {
  document.getElementById("fuelBar").style.width = boat.fuel + "%";
  document.getElementById("healthBar").style.width = boat.health + "%";
  document.getElementById("hygieneBar").style.width = boat.hygiene + "%";
}

function updatePosition() {
  if (boat.fuel > 0) {
    boat.x += boat.dx;
    boat.y += boat.dy;
    boat.fuel -= (Math.abs(boat.dx) + Math.abs(boat.dy)) * 0.05;
    boat.hygiene = Math.max(0, boat.hygiene - 0.02);
    boat.fuel = Math.max(0, boat.fuel);
    boat.health = Math.max(0, boat.health);
    updateBars();
    if (boat.fuel < 20)
      document.getElementById("warning").style.display = "block";
    else document.getElementById("warning").style.display = "none";
  } else {
    document.getElementById("gameOverScreen").style.display = "flex";
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  generateObjects();
  updateBoatMovement();
  drawObjects();
  drawBoat();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  initializeGame();
  gameLoop();
}

function updateBoatMovement() {
  if (keysPressed["w"])
    boat.speed = Math.min(boat.speed + boat.acceleration, boat.maxSpeed);
  if (keysPressed["s"])
    boat.speed = Math.max(boat.speed - boat.acceleration, -boat.maxSpeed / 2);
  if (!keysPressed["w"] && !keysPressed["s"]) boat.speed *= boat.friction;

  if (Math.abs(boat.speed) < 0.05) boat.speed = 0;

  if (keysPressed["a"]) boat.rotation -= boat.rotationSpeed;
  if (keysPressed["d"]) boat.rotation += boat.rotationSpeed;

  let rad = ((boat.rotation - 90) * Math.PI) / 180;
  boat.x += Math.cos(rad) * boat.speed;
  boat.y += Math.sin(rad) * boat.speed;
}

window.onload = () => {
    const selectedShip = JSON.parse(localStorage.getItem("selectedShip"));

    if (selectedShip) {
        console.log("Ship loaded:", selectedShip);

        // Example: show ship info
        document.getElementById("shipName").textContent = selectedShip.name;
        document.getElementById("shipImage").src = selectedShip.img;
        // etc...
    } else {
        alert("No ship selected! Redirecting to menu...");
        window.location.href = "menu.html";
    }
};

document.addEventListener("keydown", (event) => {
  keysPressed[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keysPressed[event.key] = false;
});

initializeGame();
gameLoop();
