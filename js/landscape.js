// on the whole, not efficient but whatever...

var ctx = document.getElementById("grid").getContext("2d");

var ready = false;

var tl = [0, 0];

var w = world(7);

var r = grid(w.w, w.h, 0);

var attrs = grid(w.w, w.h, {});

var settle = (rain = erode = level = false);

const sc = 5;

var yy = Math.floor(w.h / 2);

const resize = () => {
  ctx.canvas.width = ctx.canvas.parentElement.clientWidth;
  ctx.canvas.height = ctx.canvas.parentElement.clientHeight;
};

const surr = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
];

const _get_land_water = (v) => w.g(v) + r.g(v);

const _lowest_land_water = (v) =>
  surr
    .map((s) => [v[0] + s[0], v[1] + s[1]])
    .reduce((a, c) => (_get_land_water(c) < _get_land_water(a) ? c : a), v);

const _lowest_land = (v) =>
  surr
    .map((s) => [v[0] + s[0], v[1] + s[1]])
    .reduce((a, c) => (w.g(c) < w.g(a) ? c : a), v);

const _lowest_water = (v) =>
  surr
    .map((s) => [v[0] + s[0], v[1] + s[1]])
    .reduce((a, c) => (r.g(c) < r.g(a) ? c : a), v);

const _rand = (n) => Math.floor(Math.random() * n);

const _rain = () => {
  var v = [_rand(r.w), _rand(r.h)];
  r.s(v, r.g(v) + 10 + _rand(50));
};

const _level = () => {
  for (var x = 0; x < w.w; x++) {
    for (var y = 0; y < w.h; y++) {
      var v = [x, y];
      if (r.g(v) > 0) {
        var l = _lowest_land_water(v);
        if (l[0] != v[0] || l[1] != v[1]) r.s(v, r.g(v) - 1);
      }
    }
  }
};

const _settle = () => {
  for (var x = 0; x < w.w; x++) {
    for (var y = 0; y < w.h; y++) {
      var v = [x, y];

      // water flow with erosion
      if (r.g(v) > 0) {
        // if there's water
        var l = _lowest_land_water(v);
        if (v[0] != l[0] || v[1] != l[1]) {
          // downhill to the lowest point
          r.s(v, r.g(v) - 1);
          r.s(l, r.g(l) + 1);

          // if we are the last piece of water we may bring some dirt with us
          if (r.g(v) == 0 && _rand(100) < 5) w.s(v, w.g(v) - 1);
        }
      }

      // erode
      if (erode && _rand(1000) < 5) {
        var l = _lowest_land(v);
        if (Math.abs(w.g(v) - w.g(l)) > 2) {
          w.s(v, w.g(v) - 1);
          w.s(l, w.g(l) + 1);
        }
      }
    }
  }
};

const update = (dt) => {
  if (settle) _settle();
  if (rain) _rain();
  if (level) _level();
};

const draw = () => {
  ctx.fillStyle = "cornflowerblue";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // draw land and water
  for (var x = 0; x < w.w; x++) {
    for (var y = 0; y < w.h; y++) {
      var v = [x, y];
      ctx.fillStyle = `rgb(${w.g(v)}, ${w.g(v)}, ${w.g(v)})`;
      ctx.fillRect(x * sc, y * sc, sc, sc);
      if (r.g(v) > 0) {
        ctx.fillStyle = `#4169e180`;
        ctx.fillRect(x * sc, y * sc, sc, sc);
      }
    }
  }

  // draw cross section line
  for (var x = 0; x < w.w; x++) {
    ctx.fillStyle = `#ff450050`;
    ctx.fillRect(x * sc, yy * sc, sc, sc);
  }

  // draw cross section
  for (var x = 0; x < w.w; x++) {
    var v = [x, yy];
    ctx.fillStyle = `rgb(200, 200, 200)`;
    ctx.fillRect(x * sc, 255 + w.h * sc, sc, -w.g(v));
    ctx.fillStyle = "royalblue";
    ctx.fillRect(x * sc, 255 + w.h * sc - w.g(v), sc, -r.g(v));
  }
};

window.addEventListener("wheel", (e) => {
  yy = Math.abs(yy + Math.floor(e.deltaY * 0.01)) % w.h;
});

window.addEventListener("load", () => {
  resize();
  draw();
});

window.addEventListener("resize", () => {
  resize();
  draw(); // TODO throttle
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "r":
      rain = !rain;
      break;
    case "s":
      settle = !settle;
      break;
    case "e":
      erode = !erode;
      break;
    case "l":
      level = !level;
      break;
  }
});

window.addEventListener("load", () => {
  ready = true;
});

window.addEventListener("load", () => {
  var last = performance.now();
  var delta = 0;

  const loop = (t) => {
    window.requestAnimationFrame(loop);
    delta = t - last;
    last = t;
    update(delta / 1000.0);
    if (ready) draw();
  };

  loop(performance.now());
});
