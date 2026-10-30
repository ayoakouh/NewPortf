import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deckProgress,
  deckCopyOpacity,
  frameOrder,
  nearestLoaded,
  progress,
  sine,
} from "../src/engine/math";
test("stride loader prioritizes all shot boundaries and visits every frame exactly once", () => {
  const bounds = [0, 59, 60, 119, 120, 179, 180, 238];
  const order = frameOrder(239, bounds);
  assert.deepEqual(order.slice(0, 8), bounds);
  assert.equal(new Set(order).size, 239);
  assert.equal(Math.min(...order), 0);
  assert.equal(Math.max(...order), 238);
  assert.ok(order.indexOf(8) < order.indexOf(4));
  assert.ok(order.indexOf(4) < order.indexOf(2));
  assert.ok(order.indexOf(2) < order.indexOf(1));
});
test("missing frames fall back within their own shot even if adjacent shots are loaded", () => {
  const loaded = new Set([59, 65, 75, 120]);
  assert.equal(
    nearestLoaded(60, 60, 119, (n) => loaded.has(n)),
    65,
  );
  assert.equal(
    nearestLoaded(119, 60, 119, (n) => loaded.has(n)),
    75,
  );
  assert.equal(
    nearestLoaded(130, 120, 179, (n) => loaded.has(n)),
    120,
  );
  assert.equal(
    nearestLoaded(190, 180, 238, (n) => loaded.has(n)),
    null,
  );
});
test("scene lifecycle clamps progress and removes old content quickly on exit", () => {
  assert.deepEqual(progress(0, 1000, 2800, 1000), {
    enter: 0,
    p: 0,
    exit: 0,
    vis: 0,
  });
  assert.equal(progress(1900, 1000, 2800, 1000).p, 0.5);
  assert.equal(progress(3300, 1000, 2800, 1000).vis, 0);
  assert.equal(progress(10000, 1000, 2800, 1000).p, 1);
});
test("blade midpoint and reversed playback have stable endpoints", () => {
  assert.equal(sine(0), 0);
  assert.ok(Math.abs(sine(0.5) - 0.5) < 1e-10);
  assert.equal(sine(1), 1);
  const from = 59,
    to = 0;
  assert.equal(from + (to - from) * 0, 59);
  assert.equal(from + (to - from) * 1, 0);
});

test("project dwells remain readable and card-copy transitions never overlap", () => {
  assert.equal(deckProgress(0.15, 3), 0);
  assert.equal(deckProgress(0.5, 3), 1);
  assert.equal(deckProgress(0.85, 3), 2);
  for (let i = 0; i <= 1000; i++) {
    const q = deckProgress(i / 1000, 3);
    assert.ok(
      [0, 1, 2].filter((card) => deckCopyOpacity(q - card) > 0.001).length <= 1,
    );
  }
});
