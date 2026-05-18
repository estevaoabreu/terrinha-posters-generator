const titleFonts = [
  "Grenze Gotisch",
  "Impact",
  "Lobster",
  "Metal Mania",
  "Syne Tactile",
  "Barrio",
  "Astloch",
  "Oi",
  "Danfo",
  "Asset",
  "Limelight",
  "Meddon",
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
  "Comic Sans",
  "Basic",
  "Gelasio",
  "Playfair Display",
  "Impact",
  "Arial",
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
