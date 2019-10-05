export const width = window.innerWidth < 800 ? window.innerWidth : 800;
export const height = window.innerHeight < 600 ? window.innerHeight : 600;

// 600  - 210
// height - x

let fix = 0;
if (height >=320 && height <= 375) fix = -30;
export const groundHeight = height * 210 / 600 * 0.8 + fix;

export const groundY = height - groundHeight ;

export const playerX = Math.round(width / 3.5);
export const playerY = groundY + 20;

//800 = .3
//height - x

if (height >=320 && height <= 375) fix = -0.05;

export const playerScale = (Math.round(width * 3/10)/800) + fix;
// 800 - 120
// width - x
export const bananaWidth = Math.round((width * 80) / 800);
export const snailWidth = Math.round((width * 120) / 800);



export const snailY = playerY - snailWidth + 10;

if (height >=320 && height <= 375) fix = 20;

export const bananaY = playerY - 150 - 2.4 * bananaWidth + fix;


