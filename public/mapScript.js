let canvas, ctx;
let player = {};
let camera = {};
let hitbox = {};
let zoom;
let mapNum;
let mapLayers = [];
let tilesetsData = [];
let collisions = [];
let tilesetImages = {};
let tileWidth, tileHeight;
const playerImg = new Image();
const zPromptImg = new Image();
const exclamationActiveImg = new Image();
const mapImg = new Image();
let isMapTransitionDialogActive = false;
const keys = {};
let interactCooldown = false;
let zKeyPressed = false;
let speed = 1;
let inCutscene = false;
let showExclamation = false;
let facingLeft = false;
let timeout = null;
let totalGameMinutes = 0;
let currentDayNumber = 1;
let clockInterval = null;
let previousMap;
let scaleFactor;
let mapData;

// Asset Paths Map
const ASSET_PATHS = {
  player: (charId) =>
    `/Assets/Characters/Mini${charId.replaceAll(" ", "")}.png`,
  zPrompt: "/Assets/Buttons/z-icon.png",
  exclamationActive: "/Assets/GUI/Exclamation_Red.png",
  mapJson: (mapNumber) => {
    if (mapNumber === "1") {
      return `/Assets/Maps/map.tmj`;
    }
    return `/Assets/Maps/map${mapNumber}.tmj`;
  },
  tilesetDefinition: (fileName) => `/Assets/Tilesets/${fileName}`,
  tilesetImage: (fileName) => `/Assets/Tilesets/${fileName}`,
};

// Game Functions
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
  displayText,
  imgSrc
) {
  //cooldownDuration determines when you can interact again
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
        message: displayText, // Pass the text value here
        imageUrl: imgSrc, // Set the path to your image here
        imageDuration: cutsceneDuration,
      },
    });
    window.dispatchEvent(event); // Dispatch event to window object
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
      } else if (collision.type === "interact") {
        // Handle interaction logic here
      } else if (collision.type === "fishing") {
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
              "Assets/GUI/UI_board_small_stone.png";
          } else if (rarity <= 65) {
            statChange("happiness", 5);
            moneyChange(100);
            cutsceneToggle(
              1000,
              2000,
              "You caught a fish!",
              "Assets/GUI/UI_board_small_stone.png"
            );
          } else {
            statChange("happiness", -15);
            cutsceneToggle(
              1000,
              2000,
              "You caught trash hahahahahaha!",
              "Assets/GUI/UI_board_small_stone.png"
            );
          }
        }
      } else if (collision.type === "digging") {
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
      } else if (collision.type === "buying") {
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
      } else if (collision.type == "sleep") {
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
      } else if (collision.type === "mapTransition") {
        if (!collision.inside && !isMapTransitionDialogActive) {
          collision.inside = true; // Mark the player as inside the block
          speed = 0; // and disables movement
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
      player.frameX = 0; // Reset to idle frame if not moving
    }
  }
  camera.update();
}
function drawPlayer() {
  scaleFactor = 4;
  const drawX = (player.x - player.hitbox.offsetX - camera.x) * zoom;
  const drawY = (player.y - player.hitbox.offsetY - camera.y) * zoom;
  const drawWidth = player.width * scaleFactor;
  const drawHeight = player.height * scaleFactor;

  ctx.save();

  if (facingLeft) {
    ctx.translate(drawX + drawWidth, drawY); // Move to the player's position
    ctx.scale(-1, 1); // Flip horizontally
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
  console.log("drawMap() called.");
  console.log("Is ctx valid?", !!ctx); // Should log 'true'
  console.log("Canvas element:", canvas); // Should log the <canvas> element
  console.log("Canvas width:", canvas.width, "Canvas height:", canvas.height); // Should be numbers > 0

  if (!ctx || !mapLayers.length || !Object.keys(tilesetImages).length) {
    console.warn(
      "drawMap: Not ready to draw. Missing ctx, layers, or tilesets.",
      { ctx, mapLayers, tilesetImages }
    );
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(zoom, zoom);
  ctx.translate(-camera.x, -camera.y);
  console.log(
    "Canvas width:",
    canvas.width,
    "Canvas height:",
    canvas.height,
    "Zoom:",
    zoom,
    "Camera:",
    camera.x,
    camera.y
  );
  console.log("Global tileWidth:", tileWidth, "Global tileHeight:", tileHeight);
  mapLayers.forEach((layer) => {
    if (layer.type === "tilelayer" && layer.visible) {
      // Removed the `layerTileset` lookup here.
      // All tiles are now processed individually against all loaded tilesets.

      // mapData.width and mapData.height are the map's dimensions in tiles
      const mapTileWidth = mapData.width;
      // const mapTileHeight = mapData.height; // Not directly needed in this loop but good to have

      for (let i = 0; i < layer.data.length; i++) {
        const gid = layer.data[i];
        if (gid === 0) continue; // Skip empty tiles

        // This is the correct and only lookup needed per tile
        const currentTileset = Object.values(tilesetImages).find(
          (ts) => gid >= ts.firstgid && gid < ts.firstgid + ts.tilecount
        );

        if (!currentTileset || !currentTileset.image) {
          // This warning is fine for debugging, but ensure it doesn't halt the game.
          // It means a tile ID exists in your map data but its image is not loaded.
          console.warn(
            `Skipping GID ${gid} in Layer '${layer.name}' (index ${i}): No loaded tileset image found for this GID.`
          );
          continue; // Skip drawing this tile if its tileset isn't loaded or found
        }

        const tileIndex = gid - currentTileset.firstgid;
        const tileXInTileset =
          (tileIndex % currentTileset.columns) * currentTileset.tilewidth;
        const tileYInTileset =
          Math.floor(tileIndex / currentTileset.columns) *
          currentTileset.tileheight;

        const col = i % mapTileWidth; // Use map's width for column calculation
        const row = Math.floor(i / mapTileWidth); // Use map's width for row calculation

        const drawX = col * tileWidth; // Use global tileWidth/Height (from mapData)
        const drawY = row * tileHeight;

        console.log(
          `Drawing GID ${gid}: Image src: ${currentTileset.image.src}, Complete: ${currentTileset.image.complete}, ` +
            `Source (sx,sy,sw,sh): (${tileXInTileset}, ${tileYInTileset}, ${currentTileset.tilewidth}, ${currentTileset.tileheight}), ` +
            `Dest (dx,dy,dw,dh): (${drawX}, ${drawY}, ${tileWidth}, ${tileHeight})`
        );

        ctx.drawImage(
          currentTileset.image,
          tileXInTileset,
          tileYInTileset,
          currentTileset.tilewidth,
          currentTileset.tileheight,
          drawX,
          drawY,
          tileWidth, // Draw at the map's global tile dimensions
          tileHeight
        );
      }
    }
  });

  // Draw hitboxes (keep this as it uses your `collisions` array)
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
      // Also draw wall/obstacle types
      ctx.strokeStyle = "red";
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    } else if (box.type === "mapTransition") {
      ctx.strokeStyle = "green";
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
  }
  /*
  ctx.drawImage(mapImg, 0, 0);
  //---- Color Hitboxes ----//
  for (let box of collisions) {
    if (box.type == "sleep" || box.type == "fishing"){
      ctx.strokeStyle = 'blue';
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    } 
      else if (box.type == "wall"){
      ctx.strokeStyle = 'red';
      ctx.strokeRect(box.x, box.y, box.width, box.height);
     
    } else if (box.type == "mapTransition"){
      ctx.strokeStyle = 'green';
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
  }
  */
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
        // Store the Image object along with its crucial properties
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
  console.log("gameLoop executing...");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayerPosition();
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
      },
    })
  );

  localStorage.setItem("totalGameMinutes", totalGameMinutes.toString());
  localStorage.setItem("currentDayNumber", currentDayNumber.toString());
}
//--------------------------------------------------------------//
//-------------- Primary Initialization Function ---------------//
//--------------------------------------------------------------//
window.initGameMap = async function (
  canvasElement,
  currentMapNum,
  playerSavedStats,
  playerCharacterId,
  playerPreviousMapParam
) {
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
  console.log(
    "mapScript.js initialized. Map:",
    mapNum,
    "Previous Map:",
    previousMap
  );

  player = {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    frameX: 0,
    frameY: 0,
    maxFrame: 3,
    frameDelay: 10,
    frameTimer: 0,
    hitbox: { offsetX: 7, offsetY: 15, width: 18, height: 20 },
    stats: playerSavedStats,
  };

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
      const mapWidth = (mapData.width || 0) * tileWidth;
      const mapHeight = (mapData.height || 0) * tileHeight;

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
    totalGameMinutes++;
    updateGameClock();
  }, 1000);
  updateGameClock();

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
    /*
    tilesetsData.forEach((ts) => {
      imageLoadPromises.push(loadTilesetImage(ts.image, ts.firstgid));
    });
    */

    collisions = [];
    let playerStartX;
    let playerStartY;
    // The startX, startY from your original script were likely offsets for the map drawing.
    // In Tiled, objects and tiles usually start at (0,0) relative to the map.
    // You'll need to define how player start position is determined in Tiled (e.g., an object layer)
    if (mapNum === "1") {
      playerStartX = 200; // Default X for map 1 if not coming from another map
      playerStartY = 400; // Default Y for map 1 if not coming from another map
      // You might also adjust player.hitbox.offsetX/Y/width/height here if map 1 has unique player dimensions
    } else if (mapNum === "2") {
      playerStartX = 400; // Example default X for map 2
      playerStartY = 300; // Example default Y for map 2
      // ...
    } else if (mapNum === "3") {
      playerStartX = 200; // Example default X for map 3
      playerStartY = 250; // Example default Y for map 3
      // ...
    }

    // Iterate through layers to find tile data and collision objects
    mapLayers.forEach((layer) => {
      if (layer.type === "tilelayer" && layer.visible) {
        // This layer is for drawing the background tiles
        // mapGrid will be processed during drawing
      } else if (layer.type === "objectgroup" && layer.visible) {
        // This layer contains collision objects, interaction points, etc.
        layer.objects.forEach((obj) => {
          const collisionObject = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
            type: obj.type || "wall", // Use Tiled object type, default to "wall"
            properties: obj.properties, // Custom properties from Tiled if any
          };

          if (obj.name === "player_start" && mapNum === previousMap) {
            // If this object is named "player_start" and it's the map we came from
            playerStartX = obj.x;
            playerStartY = obj.y;
          }
          // For map transitions, Tiled objects are better
          if (obj.type === "mapTransition") {
            // Get target map from Tiled object properties or name
            const targetMap =
              obj.properties?.targetMap || obj.name.replace("exit_to_", ""); // Assuming naming 'exit_to_map2'
            collisions.push({
              ...collisionObject,
              type: "mapTransition",
              targetMap: targetMap, // e.g., "map2"
              inside: false,
            });
          } else if (obj.type === "wall" || obj.type === "obstacle") {
            collisions.push(collisionObject);
          }
          // Add other interaction types as Tiled object types (fishing, digging, sleep, buying)
          else if (
            ["fishing", "digging", "sleep", "buying"].includes(obj.type)
          ) {
            collisions.push(collisionObject);
          }
        });
      }
    });
    player.x = playerStartX;
    player.y = playerStartY;

    const prevMapNum = parseInt(playerPreviousMapParam.match(/\d+/)[0]);

    if (playerPreviousMapParam) {
      if (mapNum === "1") {
        switch (prevMapNum) {
          case 2:
            fixMapPosition(315, 680);
            break;
          case 4:
            fixMapPosition(80, 180);
            break;
          case 5:
            fixMapPosition(50, 190);
            break;
        }
      } else if (mapNum === "2") {
        switch (prevMapNum) {
          case 1:
            fixMapPosition(290, 70);
            break;
          case 3:
            fixMapPosition(40, 150);
            break;
        }
      } else if (mapNum === "3") {
        switch (prevMapNum) {
          case 2:
            fixMapPosition(960, 540);
            break;
          case 5:
            fixMapPosition(40, 190);
            break;
        }
      } else if (mapNum === "5") {
        switch (prevMapNum) {
          case 1:
            fixMapPosition(260, 70);
            break;
          case 3:
            fixMapPosition(580, 600);
            break;
        }
      }
    }
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
    Object.keys(tilesetImages).forEach((firstgid) => {
      console.log(`  Tileset GID ${firstgid}:`, tilesetImages[firstgid]);
      console.log(
        `    Image property type:`,
        typeof tilesetImages[firstgid]?.image
      ); // Should be 'object'
      console.log(
        `    Image instance:`,
        tilesetImages[firstgid]?.image instanceof HTMLImageElement
      ); // Should be true
      console.log(`    Image src:`, tilesetImages[firstgid]?.image?.src); // Check if the source path is valid
      console.log(
        `    Image complete:`,
        tilesetImages[firstgid]?.image?.complete
      ); // Should be true
      console.log(`    Image width:`, tilesetImages[firstgid]?.image?.width); // Should be > 0
    });
    gameLoop();
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
  };
}
window.addEventListener("dead", function () {
  window.dispatchEvent(
    new CustomEvent("gameOver", { detail: { reason: "dead" } })
  );
});
