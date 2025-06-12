let canvas, ctx, zoom;
let player = {};
let camera = {};
let hitbox = {};
const keys = {};
let speed = 1;
let frameCount = 0;

// Booleans
let inCutscene = false;
let showExclamation = false;
let facingLeft = false;
let interactCooldown = false;
let zKeyPressed = false;
let isGameInitialized;
let isGameLoopRunning = false;

// Images
const playerImg = new Image();
const zPromptImg = new Image();
const exclamationActiveImg = new Image();
const mapImg = new Image();

// Map & Tilesets
let mapNum, mapData, tileWidth, tileHeight, previousMap, scaleFactor;
let isMapTransitionDialogActive = false;
let mapLayers = [];
let tilesetsData = [];
let collisions = [];
let tilesetImages = {};

// Time Interval
let timeout = null;
let totalGameMinutes = 0;
let currentDayNumber = 1;
let clockInterval = null;


// Asset Paths Map \\
const ASSET_PATHS = {
  player: (charId) => `/Assets/Characters/Mini${charId.replaceAll(" ", "")}.png`,
  zPrompt: "/Assets/Buttons/z-icon.png",
  exclamationActive: "/Assets/GUI/Exclamation_Red.png",
  mapJson: (mapNumber) => {
    if (mapNumber === "1") {
      return `/Assets/Maps/map1.tmj`;
    }
    else {
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

function cutsceneToggle(cutsceneDuration, cooldownDuration, displayText, imgSrc) {
  inCutscene = true;
  interactCooldown = true;
  speed = 0;

  setTimeout(() => {
    inCutscene = false;
    speed = 1;
  }, cutsceneDuration);

  setTimeout(() => {
    interactCooldown = false;
  }, cooldownDuration);

  if (displayText != undefined || imgSrc != undefined) {
    const event = new CustomEvent("showBox", {
      detail: {
        message: displayText,
        imageUrl: imgSrc,
        imageDuration: cutsceneDuration,
      },
    });
    window.dispatchEvent(event);
  }
}

function drawExclamation(duration) {
  showExclamation = true;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    showExclamation = false;
  }, duration);
}

function updatePlayerPosition() {
  const lastX = player.x;
  const lastY = player.y;

  let moved = false;

  if (keys["ArrowUp"]) {
    player.y -= speed;
    player.frameY = 1;
    moved = true;
  }
  if (keys["ArrowDown"]) {
    player.y += speed;
    player.frameY = 1;
    moved = true;
  }
  if (keys["ArrowLeft"]) {
    player.x -= speed;
    player.frameY = 1;
    moved = true;
    facingLeft = true;
  }
  if (keys["ArrowRight"]) {
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
  for (let collision of collisions) {
    if (isColliding(hitbox, collision)) {
      if (collision.type === "wall") {
        player.x = lastX;
        player.y = lastY;
        hitbox.x = lastX + player.hitbox.offsetX;
        hitbox.y = lastY + player.hitbox.offsetY;
        moved = false;
        break;
      } 
      else if (collision.type === "interact") {
        // Handle interaction logic here
      } 
      else if (collision.type === "fishing") {
        // Fishing behavior
        drawExclamation(0);
        if (zKeyPressed && !interactCooldown && !inCutscene) {
          drawExclamation(1000);
          let rarity = Math.floor(Math.random() * 100);
          statChange("stamina", -2);
          if (rarity == 99) {
            statChange("happiness", 10);
            moneyChange(1000);
            cutsceneToggle(1000, 2000, "You caught a RARE fish!"),
              "/Assets/GUI/UI_board_small_stone.png";
          } else if (rarity <= 65) {
            statChange("happiness", 5);
            moneyChange(100);
            cutsceneToggle(
              1000,
              2000,
              "You caught a fish!",
              "/Assets/GUI/UI_board_small_stone.png"
            );
          } else {
            statChange("happiness", -15);
            cutsceneToggle(
              1000,
              2000,
              "You caught trash hahahahahaha!",
              "/Assets/GUI/UI_board_small_stone.png"
            );
          }
        }
      } 
      else if (collision.type === "digging") {
        // Digging behavior
        drawExclamation(0);
        if (zKeyPressed && !interactCooldown && !inCutscene) {
          drawExclamation(1000);
          let rarity = Math.floor(Math.random() * 100);
          statChange("stamina", -4);
          statChange("hygiene", -4);
          if (rarity == 99) {
            statChange("happiness", 30);
            moneyChange(50000);
            cutsceneToggle(1000, 2000, "You dug out Legendary artifacts!"),
              "Assets/GUI/UI_board_small_stone.png";
          } else if (rarity <= 65) {
            statChange("food", 5);
            statChange("happiness", 5);
            cutsceneToggle(
              1000,
              2000,
              "You dug some crabs, and ate them",
              "Assets/GUI/UI_board_small_stone.png"
            );
          } else {
            statChange("happiness", -5);
            statChange("stamina", -5);
            cutsceneToggle(
              1000,
              2000,
              "The crabs bit you.",
              "Assets/GUI/UI_board_small_stone.png"
            );
          }
        }
      } 
      else if (collision.type === "buying") {
        // Buying behavior
        drawExclamation(0);
        if (zKeyPressed && !interactCooldown && !inCutscene) {
          drawExclamation(1000);
          let rarity = Math.floor(Math.random() * 100);
          statChange("stamina", -4);
          statChange("hygiene", -4);
          if (rarity == 99) {
            statChange("happiness", 30);
            moneyChange(50000);
            cutsceneToggle(1000, 2000, "You stole..."),
              "Assets/GUI/UI_board_small_stone.png";
          } else if (rarity <= 65) {
            moneyChange(-10000000);
            cutsceneToggle(
              1000,
              2000,
              "You gave all your money for charity",
              "Assets/GUI/UI_board_small_stone.png"
            );
          } else {
            moneyChange(-100);
            cutsceneToggle(
              1000,
              2000,
              "You gave your money for charity",
              "Assets/GUI/UI_board_small_stone.png"
            );
          }
        }
      } 
      else if (collision.type == "sleep") {
        // Sleep behavior
        drawExclamation(0);
        if (zKeyPressed && !interactCooldown && !inCutscene) {
          cutsceneToggle(
            5000,
            6000,
            "You tidy up and rest for a bit...",
            "Assets/GUI/UI_board_small_stone.png"
          );
          const overlay = document.getElementById("overlay");
          statChange("food", -5);
          statChange("hygiene", 30);
          statChange("stamina", 50);
          statChange("happiness", 30);
        }
      } 
      else if (collision.type === "mapTransition") {
        if (!collision.inside && !isMapTransitionDialogActive) {
          collision.inside = true;
          speed = 0;
          isMapTransitionDialogActive = true;
          showMapTransitionDialog(collision.targetMap);
          return;
        }
      }
    } else {
      // Reset the `inside` property when the player leaves the block
      if (collision.type === "mapTransition") {
        collision.inside = false;
      }
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
        console.log("🚪 Teleport trigger hit!", collision);
        localStorage.setItem("teleportX", collision.targetX);
        localStorage.setItem("teleportY", collision.targetY);

        window.dispatchEvent(new CustomEvent("showMapTransitionDialog", {
          detail: { nextMap: collision.targetMap }
        }));
        
        return;
      }
    }
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

  //For interaction sprite
   if (showExclamation) {
    const exWidth = (32 * zoom) / 2;
    const exHeight = (32 * zoom) / 2;
    const exX = (player.x - player.hitbox.offsetX - camera.x) * zoom + 32;
    const exY = (player.y - player.hitbox.offsetY - camera.y) * zoom + 16;
    if (inCutscene) {
      //Draws the red mark when in a cutscene
      ctx.drawImage(exclamationActiveImg, exX, exY, exWidth, exHeight);
    } else if (!interactCooldown) {
      //Draw the grey for prompting when interactable again
      ctx.drawImage(zPromptImg, exX, exY, exWidth, exHeight);
      ctx.drawImage(zPromptImg, exX, exY, exWidth, exHeight);
    }
  }
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
        const tileXInTileset = (tileIndex % currentTileset.columns) * currentTileset.tilewidth;
        const tileYInTileset = Math.floor(tileIndex / currentTileset.columns) * currentTileset.tileheight;

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
      box.type === "buying"
    ) {
      ctx.strokeStyle = "blue";
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    } else if (box.type === "wall" || box.type === "obstacle") {
      ctx.strokeStyle = "red";
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    } else if (box.type === "mapTransition") {
      ctx.strokeStyle = "green";
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
    requestAnimationFrame(gameLoop); // ⬅ Tetap panggil untuk cek ulang nanti
    return;
  }

  frameCount++;
  // if (frameCount % 60 === 0) {
  //   console.log(`🎮 gameLoop running, frame ${frameCount}`);
  // }
  collisions.forEach(collision => {
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
  const moneyChangeEvent = new Event("playerMoneyChanged");

  window.dispatchEvent(
    new CustomEvent("updatePlayerMoney", { detail: { value: amount } })
  );
}

function statChange(statName, amount) {
  let stats = JSON.parse(localStorage.getItem("playerStats"));
  stats[statName].currentStat += amount;
  localStorage.setItem("playerStats", JSON.stringify(stats));
  const statChangeEvent = new Event("playerStatChanged");

  window.dispatchEvent(
    new CustomEvent("updatePlayerStatus", {
      detail: { type: statName, value: amount },
    })
  );
}

function updateGameClock() {
  totalGameMinutes++;

  const hours = Math.floor(totalGameMinutes / 60) % 24;
  const minutes = totalGameMinutes % 60;
  const formattedTime = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;

  // --- DAILY EVENTS --- \\
  if (totalGameMinutes % (24 * 60) === 0 && totalGameMinutes !== 0) {
    currentDayNumber++;
  }

  window.dispatchEvent(
    new CustomEvent("updateClock", {
      detail: {
        time: formattedTime,
        day: `Day ${currentDayNumber}`,
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
window.initGameMap = async function (canvasElement, currentMapNum, playerSavedStats, playerCharacterId, playerPreviousMapParam) {
  console.log("🚀 previousMap param:", playerPreviousMapParam);
  console.log("📦 parsed previousMap number:", previousMap);
  if (isGameInitialized) {
    console.log("♻️ Re-initializing map...");
    window.cleanupGameMap?.();
  }
  isGameInitialized = true;
  isGameInitialized = true; // Mark as initialized

  console.log("initGameMap STARTING. Canvas:", canvasElement, "MapNum:", currentMapNum);
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
      targetY = Math.max(0, Math.min(targetY, mapHeight - canvas.height / zoom));

      camera.x = targetX;
      camera.y = targetY;
    }
    
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
    updateGameClock();
  }, 1000);

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
    }

    else if (layer.type === "objectgroup" && layer.visible) {
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
            type: null,
          };

          // 🚀 Tentukan jenis interaksi berdasarkan tile ID
          if (tileValue === 33) {
            obj.type = "teleport";
            obj.targetMap = "map2";
            obj.targetX = 300;
            obj.targetY = 250;
          } else if (tileValue === 770) {
            obj.type = "teleport";
            obj.targetMap = "map2";
            obj.targetX = 1100;
            obj.targetY = 500;
          } else if (tileValue === 502) {
            obj.type = "teleport";
            obj.targetMap = "map1";
            obj.targetX = 1100;
            obj.targetY = 550;
          } else if (tileValue === 477) {
            obj.type = "teleport";
            obj.targetMap = "map3";
            obj.targetX = 615;
            obj.targetY = 90;
          } else if (tileValue === 486) {
            obj.type = "teleport";
            obj.targetMap = "map4";
            obj.targetX = 300;
            obj.targetY = 750;
          }else if (tileValue === 411) {
            obj.type = "teleport";
            obj.targetMap = "map2";
            obj.targetX = 300;
            obj.targetY = 830;
          }else if (tileValue === 58) {
            obj.type = "teleport";
            obj.targetMap = "map5";
            obj.targetX = 300;
            obj.targetY = 830;
          }else if (tileValue === 333) {
            obj.type = "teleport";
            obj.targetMap = "map1";
            obj.targetX = 300;
            obj.targetY = 830;
          } else if (tileValue === 2) {
            obj.type = "fishing";
          } else if (tileValue === 3) {
            obj.type = "digging";
          } else if (tileValue === 4) {
            obj.type = "sleep";
          } else if (tileValue === 5) {
            obj.type = "buying";
          } else {
            obj.type = "custom";
          }

          collisions.push(obj);
        }
      }
    }
  });
    const savedX = parseInt(localStorage.getItem("teleportX"));
    const savedY = parseInt(localStorage.getItem("teleportY"));
    const previousMap = localStorage.getItem("previousMap"); 
    if (!isNaN(savedX) && !isNaN(savedY)) {
      // 🟢 Gunakan posisi teleport yang disimpan
      player.x = savedX;
      player.y = savedY;
    } else {
      // 🟡 Fallback manual berdasarkan map dan previousMap
      if (mapNum === "2") {
        if (previousMap === "map1") {
          player.x = 300;
          player.y = 250; // Depan (dari map1)
        } else if (previousMap === "map3") {
          player.x = 1100;
          player.y = 500; // Belakang (dari map3)
        } else {
          player.x = 200;
          player.y = 250; // Default map2
        }
      } else if (mapNum === "1") {
        if (previousMap === "map2") {
          player.x = 1100;
          player.y = 550;
        } else {
          player.x = 200;
          player.y = 550; // Default map1
        }
      } else if (mapNum === "3") {
        player.x = 615;
        player.y = 90;
      } else if (mapNum === "4") {
        player.x = 300;
        player.y = 750;
      } else if (mapNum === "5") {
        player.x = 1100;
        player.y = 435;
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
    console.log("FINAL LOADED TILESET IMAGES (tilesetImages object):", tilesetImages);

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
    const currentMap = window.location.pathname.split("/").pop();
    localStorage.setItem("previousMap", currentMap);
    window.dispatchEvent(
      new CustomEvent("showMapTransitionDialog", {
        detail: { nextMap: nextMap },
      })
    );
  };

  noButton.onclick = () => {
    dialog.classList.add("hidden");
    isMapTransitionDialogActive = false;
    speed = 1;
    Object.keys(keys).forEach((key) => keys[key] = false);
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

function requestTeleport(targetMap) {
  window.dispatchEvent(new CustomEvent("showMapTransitionDialog", {
    detail: { nextMap: targetMap }
  }));
}
