<canvas style="width: 100%;" class="webgl-canvas"></canvas>

```js page.script
const canvas = document.querySelector(".webgl-canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

ctx.fillStyle = "red";

let x = 0, dx = 1;
let y = 0, dy = 1;

let size = 50;

setInterval(() => {
    if (x + size > canvas.width) {
        dx = -1;
    } else if (x < 0) {
        dx = 1;
    }

    if (y + size > canvas.height) {
        dy = -1;
    } else if (y < 0) {
        dy = 1;
    }

    x += dx;
    y += dy;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(x, y, size, size);
});
```
