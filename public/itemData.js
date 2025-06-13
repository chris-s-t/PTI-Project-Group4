let path = "/Assets/Items/";

const itemData = {
  apple: {
    id: "apple",
    name: "Apple",
    description: "Restores a small amount of hunger.",
    image: `${path}apple.png`,
    sellPrice: 50,
    stats: {
      food: 10,
      happiness: 5,
    }
  },
  fish: {
    id: "fish",
    name: "Fish",
    description: "A common fish seen anywhere.",
    image: `${path}fish.png`,
    sellPrice: 100,
    stats: {
      food: 15,
      happiness: 5,
      hygiene: -10
    }
  },
  moorish_idol: {
    id: "moorish_idol",
    name: "Moorish Idol",
    description: "A tropical fish that is slighlty rarer.",
    image: `${path}moorish_idol.png`,
    sellPrice: 250,
    stats: {
      food: 20,
      happiness: 12,
      hygiene: -10
    }
  },
  clownfish: {
    id: "clownfish",
    name: "Clownfish",
    description: "A rare fish that is dwindling in numbers due to the lack of anemones in the area.",
    image: `${path}clownfish.png`,
    sellPrice: 1000,
    stats: {
      food: 20,
      happiness: 30,
      hygiene: -10
    }
  },
  catfish: {
    id: "catfish",
    name: "Catfish",
    description: "A legendary fish from another region. This particular species is poisonous.",
    image: `${path}catfish.png`,
    sellPrice: 10000,
    stats: {
      food: -10,
      happiness: 100,
      hygiene: -10,
      health: -20,
    }
  },
  potion: {
    id: "potion_health",
    name: "Health Potion",
    description: "Instantly restores full health.",
    image: `${path}potion.png`,
    sellPrice: 50,
    stats: {
      health: 15,
      happiness: 5,
    }
  },
  cat: {
    id: "cat",
    name: "Skirmish Cat",
    description: "???",
    image: `${path}battlekets1.png`,
    sellPrice: 9,
    stats: {
      food: 50,
      happiness: -20,
      hygiene: -20,
    }
  },
  chest: {
    id: "chest",
    name: "chest",
    description: "OMG OMG CHEST OMG",
    image: `${path}chest.png`,
    sellPrice: 10000,
    stats: {
      happiness: 30,
    }
  },
  coin: {
    id: "coin",
    name: "coin",
    description: "a coin that is worth maybe 2 pounds.",
    image: `${path}goldcoin.png`,
    sellPrice: 2,
    stats: {
      happiness: 5,
    }
  },
  fossil: {
    id: "fossil",
    name: "fossil",
    description: "A rare type of stone, its worth a fortune. Don't try eating it...",
    image: `${path}fossil.png`,
    sellPrice: 9000,
    stats: {
      health: -50,
      hygiene: -10,
    }
  },
  crab: {
    id: "crab",
    name: "crab",
    description: "a common crab, not safe to eat tho",
    image: `${path}crab.png`,
    sellPrice: 100,
    stats: {
      happiness: 12,
    }
  },
  full_restore: {
    id: "full_restore",
    name: "Full Restore",
    description: "Fully heals all of your stats. Takes two years to make a single batch.",
    image: `${path}full_potion.png`,
    sellPrice: 10000,
    stats: {
      food: 100,
      happiness: 100,
      hygiene: 100,
      health: 100,
      stamina: 100,
    }
  }
};

export default itemData;