let canvas, ctx, zoom;
let player = {};
let camera = {};
let hitbox = {};
const keys = {};
let speed = 4;
let frameCount = 0;

// Booleans
let inCutscene = false;
let facingLeft = false;
let interactCooldown = false;
let zKeyPressed = false;
let isGameInitialized;
let isGameLoopRunning = false;
let isInventoryVisible = false; //inventory wip
let isShopVisible = false;
let isPlayerDead = false; // <-- New flag for death state
let isGodModeActive = false; // Initialize God Mode as off
let interactable = false;

// Images
const playerImg = new Image();
const zPromptImg = new Image();
const exclamationActiveImg = new Image();
const mapImg = new Image();
const itemPath = "/Assets/Items/";

// Map & Tilesets
let mapNum, mapData, tileWidth, tileHeight, previousMap, scaleFactor;
let isMapTransitionDialogActive = false;
let mapLayers = [];
let tilesetsData = [];
let collisions = [];
let tilesetImages = {};

// Item Data
import itemData from "./itemData.js";

// Time Interval
let timeout = null;
let totalGameMinutes = 0;
let currentDayNumber = 1;
let clockInterval = null;
let statInterval = null;

// Asset Paths Map \\
const ASSET_PATHS = {
  player: (charId) =>
    `/Assets/Characters/Mini${charId.replaceAll(" ", "")}.png`,
  zPrompt: "/Assets/Buttons/z-icon.png",
  exclamationActive: "/Assets/GUI/Exclamation_Red.png", // <-- Path to the death screen image
  mapJson: (mapNumber) => {
    if (mapNumber === "1") {
      return `/Assets/Maps/map1.tmj`;
    } else {
      return `/Assets/Maps/map${mapNumber}.tmj`;
    }
  },
  tilesetDefinition: (fileName) => `/Assets/Tilesets/${fileName}`,
  tilesetImage: (fileName) => `/Assets/Tilesets/${fileName}`,
};

// Game Functions \\
function fixMapPosition(x, y) {
  player.x = x;
  player.y = y;
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function cutsceneToggle(
  cutsceneDuration,
  cooldownDuration,
  message,
  imageUrl,
  title = ""
) {
  // Pause player movement and interaction
  speed = 0;
  interactCooldown = true;
  inCutscene = true;

  window.dispatchEvent(
    new CustomEvent("showBox", {
      detail: {
        message,
        imageUrl,
        imageDuration: cutsceneDuration,
        title,
      },
    })
  );

  // After cutsceneDuration, allow movement again
  setTimeout(() => {
    speed = 4;
    inCutscene = false;
  }, cutsceneDuration);

  // After cooldownDuration, allow interaction again
  setTimeout(() => {
    interactCooldown = false;
  }, cooldownDuration);
}

function updatePlayerPosition() {
  const lastX = player.x;
  const lastY = player.y;

  let moved = false;

  if (keys["ArrowUp"] || keys["w"]) {
    player.y -= speed;
    player.frameY = 1;
    moved = true;
  }
  if (keys["ArrowDown"] || keys["s"]) {
    player.y += speed;
    player.frameY = 1;
    moved = true;
  }
  if (keys["ArrowLeft"] || keys["a"]) {
    player.x -= speed;
    player.frameY = 1;
    moved = true;
    facingLeft = true;
  }
  if (keys["ArrowRight"] || keys["d"]) {
    player.x += speed;
    player.frameY = 1;
    moved = true;
    facingLeft = false;
  }
  if (keys["z"] && !zKeyPressed) {
    zKeyPressed = true;
  }

  hitbox.x = player.x + player.hitbox.offsetX;
  hitbox.y = player.y + player.hitbox.offsetY;

  // Check for collision and interactables
  interactable = false;
  for (let collision of collisions) {
    if (isColliding(hitbox, collision)) {
       if (
        collision.type === "shop" ||
        collision.type === "fishing" ||
        collision.type === "sleep" ||
        collision.type === "donate" ||
        collision.type === "digging" ||
        collision.type === "shower"
      ) {
        interactable = true;

        // Only trigger this ONCE when entering
        if (!collision.inside) {
          collision.inside = true;
          window.dispatchEvent(
            new CustomEvent("toggleInteractPrompt", {
              detail: {
                visible: true,
                type: collision.type
              }
            })
          );
        }
      }
      if (collision.type === "wall") {
        player.x = lastX;
        player.y = lastY;
        hitbox.x = lastX + player.hitbox.offsetX;
        hitbox.y = lastY + player.hitbox.offsetY;
        moved = false;
        break;
      } else if (collision.type === "interact") {
        // Handle interaction logic here
      } else if (collision.type === "fishing") {
        // Fishing behavior
        if (zKeyPressed && !interactCooldown && !inCutscene) {
          let rarity = Math.floor(Math.random() * 100);
          statChange("stamina", -2);
          if (rarity == 99) {
            statChange("happiness", 10);
            statChange("score", 1000);
            moneyChange(1000);
            addItem("catfish", 1);
            cutsceneToggle(
              1000,
              2000,
              "You caught a RARE catfish!",
              `${itemPath}catfish.png`,
              "Fishing Successful!"
            );
          } else if (rarity <= 98 && rarity > 48) {
            statChange("happiness", 5);
            statChange("score", 750);
            moneyChange(1200);
            addItem("fish", 1);
            cutsceneToggle(
              1000,
              2000,
              "You caught a common fish!",
              `${itemPath}fish.png`,
              "Fishing Successful!"
            );
          } else if (rarity <= 48 && rarity > 18) {
            statChange("happiness", 5);
            statChange("score", 500);
            moneyChange(100);
            addItem("moorish_idol", 1);
            cutsceneToggle(
              1000,
              2000,
              "You caught a Moorish Idol!",
              `${itemPath}moorish_idol.png`,
              "Fishing Successful!"
            );
          } else if (rarity <= 18 && rarity > 8) {
            statChange("happiness", 5);
            statChange("health", -10);
            statChange("score", 250);
            moneyChange(100);
            addItem("catfish", 1);
            cutsceneToggle(
              3000,
              4000,
              "You caught a Shark... and got bitten in the process.",
              `${itemPath}apple.png`,
              "Fishing Successful?"
            );
          } else if (rarity <= 8) {
            statChange("happiness", 5);
            statChange("score", 100);
            moneyChange(100);
            addItem("cat", 1);
            cutsceneToggle(
              1000,
              2000,
              "You caught a cat?",
              `${itemPath}battlekets.png`,
              "Fishing Successful?"
            );
          }
        }
      } else if (collision.type === "digging") {
        // Digging behavior
        if (zKeyPressed && !interactCooldown && !inCutscene) {
           let rarity = Math.floor(Math.random() * 100);
          statChange("stamina", -2);
          statChange("hygiene", -2);
          if (rarity == 99) {
            statChange("happiness", 10);
            statChange("score", 1000);
            moneyChange(5000);
            cutsceneToggle(
              1000,
              2000,
              "You dug a CHEST!!!",
              `${itemPath}chest.png`,
              "digging Successful!"
            );
          } else if (rarity <= 98 && rarity > 48) {
            statChange("happiness", 5);
            statChange("score", 750);
            moneyChange(100);
            addItem("crab", 1);
            cutsceneToggle(
              1000,
              2000,
              "You got a crab.",
              `${itemPath}crab.png`,
              "digging Successful!"
            );
          } else if (rarity <= 48 && rarity > 18) {
            statChange("happiness", 5);
            statChange("score", 500);
            moneyChange(1000);
            cutsceneToggle(
              1000,
              2000,
              "You dug a gold coin!",
              `${itemPath}goldcoin.png`,
              "digging Successful!"
            );
          } else if (rarity <= 18 && rarity > 8) {
            statChange("happiness", 5);
            addItem("fossil", 1);
            statChange("score", 250);
            moneyChange(4000);
            cutsceneToggle(
              1000,
              2000,
              "You dug a FOSSIL!!!",
              `${itemPath}fossil.png`,
              "Digging Successfull"
            );
          } else if (rarity <= 8) {
            statChange("happiness", 5);
            statChange("score", 100);
            moneyChange(100);
            addItem("cat", 1);
            cutsceneToggle(
              1000,
              2000,
              "You dug a cat?",
              `${itemPath}battlekets.png`,
              "digging Successful?"
            );
          }
        }
      } 
      else if (collision.type === "donate") {
        // Doante behavior
        if (zKeyPressed && !interactCooldown && !inCutscene) {
          let rarity = Math.floor(Math.random() * 100);
          statChange("stamina", -4);
          statChange("hygiene", -4);
          if (rarity == 99) {
            statChange("happiness", 30);
            statChange("stamina", -5);
            statChange("hygiene", -10);
            moneyChange(50000);
            cutsceneToggle(
              3000,
              4000,
              "You let your intrusive thoughts win and stole instead.",
              "Assets/Emojis/E14.png",
              "Charity!"
            );

          } else if (rarity <= 65) {
            moneyChange(-1000);
            statChange("happiness", -5)
            statChange("stamina", -5)
            cutsceneToggle(
              1000,
              2000,
              "You got stolen... for charity!",
              "Assets/Emojis/E6.png",
              "Charity?"
            );
          } else {
            moneyChange(-100);
            statChange("happiness", 10);
            cutsceneToggle(
              1000,
              2000,
              "You gave your money for charity",
              "Assets/Emojis/E33.png",
              "Charity"
            );
          }
        }
      } 
      else if (collision.type === "sleep") {

        if (zKeyPressed && !interactCooldown && !inCutscene) {
          // jadi hitam
          window.dispatchEvent(new Event("showSleepOverlay"));

          cutsceneToggle(
            5000, // duration sleep
            6000, // cooldown
            "You tidy up and rest for a bit...",
            "Assets/Emojis/E35.png",
            "Sleep"
          );

          statChange("food", -5);
          statChange("hygiene", 30);
          statChange("stamina", 50);
          statChange("happiness", 30);
          statChange("score", 100);

          // Bangun
          setTimeout(() => {
            // hitam hilang
            window.dispatchEvent(new Event("hideSleepOverlay"));

            let currentDayMinutes = totalGameMinutes % (24 * 60);
            let minutesLeftToday = 24 * 60 - currentDayMinutes;

            let minutesToAdd = minutesLeftToday + 8 * 60;
            totalGameMinutes += minutesToAdd;

            // Esok hari
            currentDayNumber++;
            updateGameClock();
          }, 5000);
        }
      }
      else if (collision.type === "shower") {

        if (zKeyPressed && !interactCooldown && !inCutscene) {
          cutsceneToggle(
            1000, 
            2000,
            "you got a shower",
            "Assets/Emojis/E12.png"
          );
          
          statChange("hygiene", 100);
          statChange("happiness", 30);
          statChange("score", 100);
        }
      }

      else if (collision.type === "shop") {
        //open shop
        if (zKeyPressed && !interactCooldown && !inCutscene && !isShopVisible) {
          isShopVisible = true;
          inCutscene = true;
          interactCooldown = true;
          speed = 0;

          window.dispatchEvent(
            new CustomEvent("toggleShop", {
              detail: { visible: true }
            })
          );

          setTimeout(() => {
            interactCooldown = false;
          }, 1000);
        }
        //close shop
        if (zKeyPressed && !interactCooldown && inCutscene && isShopVisible) {
          setTimeout(() => {
            isShopVisible = false;
          }, 1000);
          inCutscene = false;
          speed = 4;
          window.dispatchEvent(
            new CustomEvent("toggleShop", {
              detail: { visible: false }
            })
          );
        }
      

      } else if (collision.type === "mapTransition") {
        if (!collision.inside && !isMapTransitionDialogActive) {
          collision.inside = true;
          speed = 0;
          isMapTransitionDialogActive = true;
          showMapTransitionDialog(collision.targetMap);
          return;
        }
      } 
    } else {
        collision.inside = false;
    }
    if (moved) {
      player.frameTimer++;
      if (player.frameTimer >= player.frameDelay) {
        player.frameX = (player.frameX + 1) % (player.maxFrame + 1);
        player.frameTimer = 0;
      }
    } else {
      player.frameX = 0;
    }
    if (isColliding(hitbox, collision)) {
      if (collision.type === "teleport" && !collision.inside) {
        collision.inside = true;

        // 💾 Simpan spawn data ke global var (bukan localStorage)
        window.__spawnData = {
          x: collision.targetX,
          y: collision.targetY,
        };

        window.dispatchEvent(
          new CustomEvent("showMapTransitionDialog", {
            detail: {
              nextMap: collision.targetMap.replace("map", ""), // Kirim hanya "2"
              spawnX: collision.targetX,
              spawnY: collision.targetY,
            },
          })
        );

        return;
      }
    }
  }
  if (!interactable) {
    window.dispatchEvent(
      new CustomEvent("toggleInteractPrompt", {
        detail: { visible: false },
      })
    );
  }
  camera.update();
}

function drawPlayer() {
  scaleFactor = 3;
  const drawX = player.x - player.hitbox.offsetX;
  const drawY = player.y - player.hitbox.offsetY;
  const drawWidth = player.width * scaleFactor;
  const drawHeight = player.height * scaleFactor;

  ctx.save();

  if (facingLeft) {
    ctx.translate(drawX + drawWidth, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(
      playerImg,
      player.frameX * player.width,
      player.frameY * player.height,
      player.width,
      player.height,
      0,
      0,
      drawWidth,
      drawHeight
    );
  } else {
    ctx.translate(drawX, drawY);
    ctx.drawImage(
      playerImg,
      player.frameX * player.width,
      player.frameY * player.height,
      player.width,
      player.height,
      0,
      0,
      drawWidth,
      drawHeight
    );
  }

  ctx.restore();
}

function drawMap() {
  /* Debugging
  console.log("drawMap() called.");
  console.log("Is ctx valid?", !!ctx);
  console.log("Canvas element:", canvas);
  console.log("Canvas width:", canvas.width, "Canvas height:", canvas.height);
  */
  if (!ctx || !mapLayers.length || !Object.keys(tilesetImages).length) {
    console.warn(
      "Function [drawMap]: Failed. Missing ctx layers, or tilesets.",
      { ctx, mapLayers, tilesetImages }
    );
    return;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(zoom, zoom);
  ctx.translate(-camera.x, -camera.y);

  //console.log("Canvas width:", canvas.width, "Canvas height:", canvas.height, "Zoom:", zoom, "Camera:", camera.x, camera.y);
  //console.log("Global tileWidth:", tileWidth, "Global tileHeight:", tileHeight);

  mapLayers.forEach((layer) => {
    if (layer.type === "tilelayer" && layer.visible) {
      const mapTileWidth = mapData.width;

      for (let i = 0; i < layer.data.length; i++) {
        const gid = layer.data[i];
        if (gid === 0) continue;

        const currentTileset = Object.values(tilesetImages).find(
          (ts) => gid >= ts.firstgid && gid < ts.firstgid + ts.tilecount
        );
        if (!currentTileset || !currentTileset.image) {
          console.warn(
            `Skipping GID ${gid} in Layer '${layer.name}' (index ${i}): No loaded tileset image found for this GID.`
          );
          continue;
        }

        const tileIndex = gid - currentTileset.firstgid;
        const tileXInTileset =
          (tileIndex % currentTileset.columns) * currentTileset.tilewidth;
        const tileYInTileset =
          Math.floor(tileIndex / currentTileset.columns) *
          currentTileset.tileheight;

        const col = i % mapTileWidth;
        const row = Math.floor(i / mapTileWidth);

        const drawX = col * tileWidth;
        const drawY = row * tileHeight;

        ctx.drawImage(
          currentTileset.image,
          tileXInTileset,
          tileYInTileset,
          currentTileset.tilewidth,
          currentTileset.tileheight,
          drawX,
          drawY,
          tileWidth,
          tileHeight
        );
      }
    }
  });

  for (let box of collisions) {
    if (
      box.type === "sleep" ||
      box.type === "fishing" ||
      box.type === "digging" ||
      box.type === "donate" ||
      box.type === "digging" ||
      box.type === "shop"
    ) {
      ctx.strokeStyle = "blue";
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
  }
  ctx.restore();
}

async function loadTilesetAndImage(tilesetSource, firstgid) {
  try {
    const response = await fetch(ASSET_PATHS.tilesetDefinition(tilesetSource));
    if (!response.ok) {
      throw new Error(
        `Failed to load tileset definition ${tilesetSource}: ${response.statusText}`
      );
    }
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const errorNode = xmlDoc.querySelector("parsererror");
    if (errorNode) {
      console.error("Error parsing XML:", errorNode.textContent);
      throw new Error(`Failed to parse XML for tileset ${tilesetSource}`);
    }

    const imageElement = xmlDoc.querySelector("image");
    if (!imageElement) {
      throw new Error(
        `Image element not found in tileset XML for ${tilesetSource}`
      );
    }
    const actualImagePathFromTsx = imageElement.getAttribute("source");

    const tilesetElement = xmlDoc.querySelector("tileset");
    if (!tilesetElement) {
      throw new Error(
        `Tileset element not found in tileset XML for ${tilesetSource}`
      );
    }

    const tilewidth = parseInt(tilesetElement.getAttribute("tilewidth"));
    const tileheight = parseInt(tilesetElement.getAttribute("tileheight"));
    const columns = parseInt(tilesetElement.getAttribute("columns"));
    const tilecount = parseInt(tilesetElement.getAttribute("tilecount"));

    if (
      isNaN(tilewidth) ||
      isNaN(tileheight) ||
      isNaN(columns) ||
      isNaN(tilecount)
    ) {
      throw new Error(
        `Missing or invalid numerical attributes in tileset XML for ${tilesetSource}`
      );
    }

    const imageFileName = actualImagePathFromTsx.split("/").pop();
    const fullPublicPathToImage = ASSET_PATHS.tilesetImage(imageFileName);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        tilesetImages[firstgid] = {
          image: img,
          tilewidth: tilewidth,
          tileheight: tileheight,
          columns: columns,
          tilecount: tilecount,
          firstgid: firstgid,
        };
        resolve();
      };
      img.onerror = (e) =>
        reject(
          new Error(
            `Failed to load tileset image ${fullPublicPathToImage}: ${e.message}`
          )
        );
      img.src = fullPublicPathToImage;
    });
  } catch (error) {
    console.error(
      `Error loading tileset or image for ${tilesetSource}:`,
      error
    );
    throw error;
  }
}

function gameLoop() {
  if (!ctx) {
    console.warn("gameLoop skipped: ctx not ready");
    return;
  }

  frameCount++;
  // if (frameCount % 60 === 0) {
  //   console.log(`🎮 gameLoop running, frame ${frameCount}`);
  // }
  collisions.forEach((collision) => {
    if (collision.type === "teleport" && !isColliding(hitbox, collision)) {
      collision.inside = false;
    }
  });
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayerPosition();
  camera.update(); // ⬅ jangan lupa panggil ini!
  drawMap();
  drawPlayer();

  requestAnimationFrame(gameLoop);
}
function moneyChange(amount) {
  let changeMoney = parseInt(localStorage.getItem("playerMoney"));
  changeMoney += amount;
  localStorage.setItem("playerMoney", changeMoney);

  window.dispatchEvent(
    new CustomEvent("updatePlayerMoney", { detail: { value: changeMoney } })
  );
}

function handlePlayerDeath() {
  if (isPlayerDead) return;
  isPlayerDead = true;
  inCutscene = true;
  speed = 0;

  clearInterval(clockInterval);
  clearInterval(statInterval);

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "black";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 2s ease-in-out";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "1";
  }, 100);

  setTimeout(() => {
    const deathText = document.createElement("h1");
    deathText.textContent = "YOU DIED";
    deathText.style.color = "red";
    deathText.style.textAlign = "center";
    deathText.style.fontSize = "5rem";
    deathText.style.fontFamily = "sans-serif";
    deathText.style.opacity = "0";
    deathText.style.transition = "opacity 2s ease-in";
    deathText.style.marginBottom = "20px";
    overlay.appendChild(deathText);

    const stats = JSON.parse(localStorage.getItem("playerStats"));
    const finalScore = stats.score.currentStat;
    const scoreText = document.createElement("h2");
    scoreText.textContent = "Final Score : " + finalScore;
    scoreText.style.color = "white";
    scoreText.style.textAlign = "center";
    scoreText.style.fontSize = "2.5rem";
    scoreText.style.fontFamily = "sans-serif";
    scoreText.style.opacity = "0";
    scoreText.style.transition = "opacity 2s ease-in";
    scoreText.style.marginBottom = "30px";
    overlay.appendChild(scoreText);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.opacity = "0";
    buttonContainer.style.transition = "opacity 2s ease-in";
    overlay.appendChild(buttonContainer);

    const mainMenuButton = document.createElement("button");
    mainMenuButton.textContent = "Main Menu";
    mainMenuButton.style.padding = "10px 20px";
    mainMenuButton.style.fontSize = "1.5rem";
    mainMenuButton.style.margin = "0 10px";
    mainMenuButton.style.cursor = "pointer";
    mainMenuButton.onclick = () => {
      localStorage.removeItem("totalGameMinutes");
      localStorage.removeItem("currentDayNumber");
      window.location.href = "/";
    };
    buttonContainer.appendChild(mainMenuButton);

    setTimeout(() => {
      deathText.style.opacity = "1";
      scoreText.style.opacity = "1";
      buttonContainer.style.opacity = "1";
    }, 500);
  }, 2200);
}

function statChange(statName, amount) {
  if (isPlayerDead) return;

  let stats = JSON.parse(localStorage.getItem("playerStats"));
  stats[statName].currentStat += amount;

  if (stats[statName].currentStat < 0) {
    stats[statName].currentStat = 0;
  }

  localStorage.setItem("playerStats", JSON.stringify(stats));

  window.dispatchEvent(
    new CustomEvent("updatePlayerStatus", {
      detail: { type: statName, value: stats[statName].currentStat },
    })
  );

  const criticalStats = ["food", "stamina", "hygiene", "happiness", "health"];
  if (criticalStats.includes(statName) && stats[statName].currentStat <= 0) {
    handlePlayerDeath();
  }
}

function updateGameClock() {
  totalGameMinutes++;

  const hours = Math.floor(totalGameMinutes / 60) % 24;
  const minutes = totalGameMinutes % 60;
  const formattedTime =
    (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;

  // --- DAILY EVENTS --- \\
  if (totalGameMinutes % (24 * 60) === 0 && totalGameMinutes !== 0) {
    currentDayNumber++;
  }

  window.dispatchEvent(
    new CustomEvent("updateClock", {
      detail: {
        time: formattedTime,
        day: `Day ${currentDayNumber}`,
        hours: hours,
        minutes: minutes,
      },
    })
  );

  localStorage.setItem("totalGameMinutes", totalGameMinutes.toString());
  localStorage.setItem("currentDayNumber", currentDayNumber.toString());
}

//--------------------------------------------------------------//
//-------------- Primary Initialization Function ---------------//
//--------------------------------------------------------------//
window.isGameInitialized = false;
window.initGameMap = async function (
  canvasElement,
  currentMapNum,
  playerSavedStats,
  playerCharacterId,
  playerPreviousMapParam,
  options = {},
) {
  console.log("🚀 previousMap param:", playerPreviousMapParam);
  console.log("📦 parsed previousMap number:", previousMap);
  if (isGameInitialized) {
    console.log("♻️ Re-initializing map...");
    window.cleanupGameMap?.();
  }
  isGameInitialized = true; // Mark as initialized

  window.dispatchEvent(new CustomEvent("updatePlayerAvatar", {
    detail: {
      characterId: playerCharacterId
    }
  }));

  console.log(
    "initGameMap STARTING. Canvas:",
    canvasElement,
    "MapNum:",
    currentMapNum
  );
  canvas = canvasElement;
  ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("Failed to get 2D rendering context for canvas.");
    return;
  }

  mapNum = String(currentMapNum);
  previousMap = playerPreviousMapParam.match(/\d+/)[0];
  console.log("Initializing Map:", mapNum, "Previous Map:", previousMap);

  player = {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    frameX: 0,
    frameY: 0,
    maxFrame: 3,
    frameDelay: 10000,
    frameTimer: 0,
    hitbox: { offsetX: 22, offsetY: 28, width: 18, height: 40 },
    stats: playerSavedStats,
  };
  zoom = 1;

  hitbox = {
    x: player.x + player.hitbox.offsetX,
    y: player.y + player.hitbox.offsetY,
    width: player.hitbox.width,
    height: player.hitbox.height,
  };

  camera = {
    x: 0,
    y: 0,
    update: () => {
      if (!mapData || !tileWidth || !tileHeight) {
        console.warn("⚠️ Camera update skipped: mapData/tile size not ready.");
        return;
      }

      const mapWidth = mapData.width * tileWidth;
      const mapHeight = mapData.height * tileHeight;

      let targetX = player.x + player.width / 2 - canvas.width / (2 * zoom);
      let targetY = player.y + player.height / 2 - canvas.height / (2 * zoom);

      targetX = Math.max(0, Math.min(targetX, mapWidth - canvas.width / zoom));
      targetY = Math.max(
        0,
        Math.min(targetY, mapHeight - canvas.height / zoom)
      );

      camera.x = targetX;
      camera.y = targetY;
    },
  };

  collisions = [];

  // --- IMAGE INIT --- \\
  const imageLoadPromises = [];
  imageLoadPromises.push(
    new Promise((resolve) => {
      playerImg.onload = resolve;
      playerImg.src = ASSET_PATHS.player(playerCharacterId);
    })
  );
  imageLoadPromises.push(
    new Promise((resolve) => {
      zPromptImg.onload = resolve;
      zPromptImg.src = ASSET_PATHS.zPrompt;
    })
  );
  imageLoadPromises.push(
    new Promise((resolve) => {
      exclamationActiveImg.onload = resolve;
      exclamationActiveImg.src = ASSET_PATHS.exclamationActive;
    })
  );

  // --- CLOCK INIT --- \\
  if (clockInterval) {
    clearInterval(clockInterval);
  }
  totalGameMinutes = parseInt(localStorage.getItem("totalGameMinutes") || "0");
  currentDayNumber = parseInt(localStorage.getItem("currentDayNumber") || "1");

  clockInterval = setInterval(() => {
    if (inCutscene) return;
    updateGameClock();
  }, 1000);

  // --- STAT DEGRADATION --- \\
  statInterval = setInterval(() => {
    if (inCutscene) return;
    if (isGodModeActive) return;
    statChange("food", -1);
    statChange("stamina", -1);
    statChange("hygiene", -1);
    statChange("happiness", -1);
    statChange("health", 0);
  }, 10000);

  // --- MAP INIT --- \\
  try {
    const response = await fetch(ASSET_PATHS.mapJson(mapNum));
    if (!response.ok) {
      throw new Error(
        `Failed to load map TMJ for map${mapNum}: ${response.statusText}`
      );
    }
    mapData = await response.json();
    console.log(`Map data for map${mapNum}.tmj loaded.`, mapData);

    tileWidth = mapData.tilewidth;
    tileHeight = mapData.tileheight;
    mapLayers = mapData.layers;
    tilesetsData = mapData.tilesets;

    mapData.tilesets.forEach((ts) => {
      imageLoadPromises.push(loadTilesetAndImage(ts.source, ts.firstgid));
    });

    collisions = [];

    mapLayers.forEach((layer) => {
      if (layer.type === "tilelayer" && layer.id === 2) {
        const mapTileWidth = mapData.width;

        for (let i = 0; i < layer.data.length; i++) {
          const tileValue = layer.data[i];
          if (tileValue >= 1) {
            const col = i % mapTileWidth;
            const row = Math.floor(i / mapTileWidth);

            const collisionObject = {
              x: col * tileWidth,
              y: row * tileHeight,
              width: tileWidth,
              height: tileHeight,
              type: "wall",
            };

            collisions.push(collisionObject);
          }
        }
      } else if (layer.type === "objectgroup" && layer.visible) {
        layer.objects.forEach((obj) => {
          const collisionObject = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            type: obj.type || "wall",
            properties: obj.properties,
          };

          // Posisi awal player
          if (obj.name === "player_start" && mapNum === previousMap) {
            playerStartX = obj.x;
            playerStartY = obj.y;
          }

          // Map transition
          if (obj.type === "mapTransition") {
            const targetMap =
              obj.properties?.targetMap || obj.name.replace("exit_to_", "");
            collisions.push({
              ...collisionObject,
              type: "mapTransition",
              targetMap: targetMap,
              inside: false,
            });
          }

          // Interaksi lain (fishing, digging, dll)
          else if (
            ["fishing", "digging", "sleep", "buying"].includes(obj.type)
          ) {
            collisions.push(collisionObject);
          }
        });
      }
      const tileActions = {
        // 🚪 Teleport tiles
        33: { type: "teleport", map: "map2", x: 300, y: 250 },
        770: { type: "teleport", map: "map2", x: 1100, y: 400 },
        502: { type: "teleport", map: "map1", x: 1100, y: 550 },
        477: { type: "teleport", map: "map3", x: 615, y: 90 },
        486: { type: "teleport", map: "map4", x: 300, y: 750 },
        411: { type: "teleport", map: "map2", x: 470, y: 270 },
        58: { type: "teleport", map: "map5", x: 1100, y: 435 },
        333: { type: "teleport", map: "map1", x: 200, y: 550 },

        // 🎣 Interaction tiles
        2: { type: "fishing" },
        531: { type: "digging" },
        3: { type: "sleep" },
        4: { type: "shop" },
        5:{type: "shower"},
        6:{type: "donate"}
      };

      if (layer.type === "tilelayer" && layer.id === 3) {
        const mapTileWidth = mapData.width;

        for (let i = 0; i < layer.data.length; i++) {
          const tileValue = layer.data[i];
          if (tileValue >= 1) {
            const col = i % mapTileWidth;
            const row = Math.floor(i / mapTileWidth);

            const obj = {
              x: col * tileWidth,
              y: row * tileHeight,
              width: tileWidth,
              height: tileHeight,
              type: "custom", // default type
            };

            const action = tileActions[tileValue];
            if (action) {
              obj.type = action.type;

              if (action.type === "teleport") {
                obj.targetMap = action.map;
                obj.targetX = action.x;
                obj.targetY = action.y;
              }
            }

            collisions.push(obj);
          }
        }
      }
    });
    if (options.spawnX !== undefined && options.spawnY !== undefined) {
      player.x = options.spawnX;
      player.y = options.spawnY;
      console.log("📦 Manual spawn dari URL:", player.x, player.y);
    } else {
      // fallback jika masuk manual ke map
      const fallback = {
        1: { x: 200, y: 550 },
        2: { x: 470, y: 270 },
        3: { x: 615, y: 90 },
        4: { x: 300, y: 750 },
        5: { x: 1100, y: 435 },
      }[mapNum];

      if (fallback) {
        player.x = fallback.x;
        player.y = fallback.y;
      }
    }

    // ✅ Clean up teleport data
    localStorage.removeItem("teleportX");
    localStorage.removeItem("teleportY");
    localStorage.removeItem("previousMap");

    console.log(`Spawned in map${mapNum} from ${previousMap}`);
  } catch (error) {
    console.error("Error fetching or parsing TMJ map:", error);
    window.dispatchEvent(
      new CustomEvent("gameOver", { detail: { reason: "Map data error." } })
    );
    return;
  }

  try {
    await Promise.all(imageLoadPromises);
    console.log(
      "FINAL LOADED TILESET IMAGES (tilesetImages object):",
      tilesetImages
    );

    /* Debugging
    Object.keys(tilesetImages).forEach((firstgid) => {
      console.log(`  Tileset GID ${firstgid}:`, tilesetImages[firstgid]);
      console.log(
        `    Image property type:`,
        typeof tilesetImages[firstgid]?.image
      );
      console.log(
        `    Image instance:`,
        tilesetImages[firstgid]?.image instanceof HTMLImageElement
      );
      console.log(`    Image src:`, tilesetImages[firstgid]?.image?.src);
      console.log(
        `    Image complete:`,
        tilesetImages[firstgid]?.image?.complete
      );
      console.log(`    Image width:`, tilesetImages[firstgid]?.image?.width);
    });
    */

    if (!mapData || !tileWidth || !tileHeight || mapLayers.length === 0) {
      console.error("❌ Cannot start gameLoop: Map not fully initialized.");
      return;
    }

    if (!isGameLoopRunning) {
      isGameLoopRunning = true;
      gameLoop();
      dispatchInventoryUpdate(); //Primary inventory initialization when map changes/loads
    }
  } catch (error) {
    console.error("Error loading map assets:", error);
    window.dispatchEvent(
      new CustomEvent("gameOver", {
        detail: { reason: "Failed to load game assets." },
      })
    );
  }
};
window.cleanupGameMap = function () {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
  isGameLoopRunning = false;
  // 🧹 Reset semua state supaya bersih saat ganti map
  canvas = null;
  ctx = null;
  mapData = null;
  mapLayers = [];
  tilesetsData = [];
  collisions = [];
  tilesetImages = {}; // ⬅️ FIX utama di sini
  isGameInitialized = false;
};

function showMapTransitionDialog(nextMap) {
  const dialog = document.getElementById("mapTransitionDialog");
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");

  dialog.classList.remove("hidden");

  yesButton.onclick = () => {
    console.log("🧭 Showing dialog for map:", nextMap);
    const target = nextMap.replace("map", "");
    window.location.href = `/map${target}`;
  };

  noButton.onclick = () => {
    dialog.classList.add("hidden");
    isMapTransitionDialogActive = false;
    speed = 4;
    Object.keys(keys).forEach((key) => (keys[key] = false));
  };
}
window.addEventListener("dead", function () {
  window.dispatchEvent(
    new CustomEvent("gameOver", { detail: { reason: "dead" } })
  );
});

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  if (e.key === "z") {
    zKeyPressed = false; // Reset agar bisa dipakai ulang
  }
});

// Adding item ke invetory
function addItem(id, quantity = 1) {
  let inventory = JSON.parse(localStorage.getItem("playerInventory"));
  const data = itemData[id];
  if (!data) {
    console.warn(`Item with ID "${id}" not found.`);
    return;
  }

  const existing = inventory.find((item) => item.id === id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    inventory.push({
      id: data.id,
      name: data.name,
      description: data.description,
      quantity,
    });
  }

  localStorage.setItem("playerInventory", JSON.stringify(inventory));
  dispatchInventoryUpdate();
}
function dispatchInventoryUpdate() {
  let inventory = JSON.parse(localStorage.getItem("playerInventory"));
  window.dispatchEvent(
    new CustomEvent("updateInventory", {
      detail: { inventory },
    })
  );
}
// Jika item di click di inventory
window.addEventListener("useInventoryItem", (e) => {
  useItem(e.detail.id);
});
// Maka...
// ...Makan inventory
function useItem(id) {
  let inventory = JSON.parse(localStorage.getItem("playerInventory"));
  const data = itemData[id];
  if (!data) {
    console.warn(`No item data for ${id}`);
    return;
  }

  // Apply stat changes
  if (data.stats) {
    for (const [stat, value] of Object.entries(data.stats)) {
      statChange(stat, value); // Existing function you already use
    }
  }

  // Reduce quantity and remove item if needed
  const item = inventory.find((i) => i.id === id);
  if (item) {
    item.quantity--;
    if (item.quantity <= 0) {
      inventory = inventory.filter((i) => i.id !== id);
    }
    localStorage.setItem("playerInventory", JSON.stringify(inventory));
    dispatchInventoryUpdate();
  }
}

//sell item from iventory
window.addEventListener("sellInventoryItem", (e) => {
  const itemId = e.detail.id;
  const inventory = JSON.parse(localStorage.getItem("playerInventory")) || [];
  const item = inventory.find(i => i.id === itemId);
  const data = itemData[itemId];

  if (!item || !data || data.sellPrice == null) return;

  item.quantity--;
  const updatedInventory = item.quantity <= 0
    ? inventory.filter(i => i.id !== itemId)
    : [...inventory];

  localStorage.setItem("playerInventory", JSON.stringify(updatedInventory));
  window.dispatchEvent(
    new CustomEvent("updateInventory", { detail: { inventory: updatedInventory } })
  );

  moneyChange(data.sellPrice);

  window.dispatchEvent(
    new CustomEvent("showBox", {
      detail: {
        message: `Sold 1 ${data.name} for ${data.sellPrice}g!`,
        imageUrl: data.image,
        imageDuration: 1500,
        title: "Sale"
      }
    })
  );
});

window.addEventListener("buyShopItem", (e) => {
  const itemId = e.detail.id;
  const data = itemData[itemId];

  if (!data || data.sellPrice == null) return;

  const currentMoney = parseInt(localStorage.getItem("playerMoney")) || 0;
  if (currentMoney < data.sellPrice) {
    window.dispatchEvent(
      new CustomEvent("showBox", {
        detail: {
          message: "Not enough money!",
          imageUrl: data.image,
          imageDuration: 1500,
          title: "Shop"
        }
      })
    );
    return;
  }
  moneyChange(-data.sellPrice);
  addItem(itemId, 1);
  window.dispatchEvent(
    new CustomEvent("showBox", {
      detail: {
        message: `Bought 1 ${data.name} for ${data.sellPrice}g!`,
        imageUrl: data.image,
        imageDuration: 1500,
        title: "Purchase"
      }
    })
  );
});

//Buka inventory
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === "c") {
    if (inCutscene && !isInventoryVisible) return;
    isInventoryVisible = !isInventoryVisible;
    inCutscene = isInventoryVisible;
    speed = inCutscene ? 0 : 4;

    window.dispatchEvent(
      new CustomEvent("toggleInventory", {
        detail: { visible: isInventoryVisible },
      })
    );
  }
  if (e.key === "v") {
    addItem("catfish", 1);
  }
  if (e.key === "b") {
    addItem("fish", 2);
  }
  if (e.key === "q") {
    addItem("full_restore", 1);
  }
  if (e.key === "g" || e.key === "G") {
    isGodModeActive = !isGodModeActive;
    console.log(`God Mode: ${isGodModeActive ? "ACTIVATED" : "DEACTIVATED"}`);

    window.dispatchEvent(
      new CustomEvent("updateGreeting", {
        detail: { message: `God Mode: ${isGodModeActive ? "ON" : "OFF"}` },
      })
    );

    if (isGodModeActive) {
      let stats = JSON.parse(localStorage.getItem("playerStats"));
      for (const statName in stats) {
        if (
          stats[statName] &&
          typeof stats[statName] === "object" &&
          stats[statName].hasOwnProperty("currentStat")
        ) {
          stats[statName].currentStat = stats[statName].max;
          window.dispatchEvent(
            new CustomEvent("updatePlayerStatus", {
              detail: { type: statName, value: stats[statName].currentStat },
            })
          );
        }
      }
      localStorage.setItem("playerStats", JSON.stringify(stats));
    }
  }
});