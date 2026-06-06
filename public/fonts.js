const titleFonts = [
  "Grenze Gotisch",
  "Impact",
  "Lobster",
  "Metal Mania",
  "Syne Tactile",
  "Barrio",
  "Astloch",
  "Oi",
  "Ole",
  "Danfo",
  "Asset",
  "Limelight",
  "Meddon",
  "Playwrite Australia Victoria Guides",
  "Black Ops One",
  "Six Caps",
  "Bitcount Single",
  "Alfa Slab One",
  "Pacifico",
  "Chelsea Market",
  "Permanent Marker",
  "Luckiest Guy",
  "Titan One",
  "Kablammo",
  "Gravitas One",
  "Creepster",
];
const bodyFonts = [
  "Texturina",
  "Winky Rough",
  "Combo",
  "Caveat Brush",
  "Truculenta",
  "Twinkle Star",
  "Metamorphous",
  "Mozilla Text",
  "Kaushan Script",
  "Comic Sans MS",
  "Basic Sans",
  "Gelasio",
  "Playfair Display",
  "Impact",
  "Arial",
  "Playwrite England Joined",
  "Oswald",
  "Pacifico",
  "Chelsea Market",
  "Zilla Slab",
  "Indie Flower",
  "Permanent Marker",
  "Advent Pro",
];

const link = document.createElement("link");
const allFontsFamilies = [...titleFonts, ...bodyFonts]
  .map((f) => `family=${f.replace(/ /g, "+")}`)
  .join("&");
link.href = `https://fonts.googleapis.com/css2?${allFontsFamilies}`;
link.rel = "stylesheet";
document.head.appendChild(link);

link.onload = () => {
  if (document.fonts) {
    [...titleFonts, ...bodyFonts].forEach((f) => {
      document.fonts.load(`10px "${f}"`).catch((e) => {
        console.warn(`Could not force load font: ${f}`, e);
      });
    });
  }
};
