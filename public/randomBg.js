function getRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 50) + 50;
  const l = Math.floor(Math.random() * 40) + 30;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function setRandomGradient() {
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  const isRadial = Math.random() > 0.5;

  let gradient;
  if (isRadial) {
    gradient = `radial-gradient(circle, ${color1}, ${color2})`;
  } else {
    gradient = `linear-gradient(0deg, ${color1}, ${color2})`;
  }

  document.body.style.background = gradient;
}

setRandomGradient();
