let path = "/Assets/Items/";

const itemData = {
  apple: {
    id: "apple",
    name: "Apple",
    description: "Restores a small amount of hunger.",
    image: `${path}apple.png`,
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
    stats: {
      food: 50,
      happiness: -20,
      hygiene: -20,
    }
  }
};

export default itemData;