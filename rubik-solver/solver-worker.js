importScripts("./vendor/cubejs/cube.js", "./vendor/cubejs/solve.js");

let initialized = false;

self.onmessage = (event) => {
  const { type, id, facelets } = event.data;
  if (type !== "solve") return;

  if (!initialized) {
    self.postMessage({ type: "error", id, error: "El motor todavía no está inicializado." });
    return;
  }

  try {
    const cube = Cube.fromString(facelets);
    const algorithm = cube.solve();
    self.postMessage({ type: "solution", id, algorithm });
  } catch (error) {
    self.postMessage({ type: "error", id, error: error.message || String(error) });
  }
};

try {
  Cube.initSolver();
  initialized = true;
  self.postMessage({ type: "ready" });
} catch (error) {
  self.postMessage({ type: "error", error: error.message || String(error) });
}
