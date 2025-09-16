import type { Critter } from "../types/Critter";

export function getAdamInstance(): Critter {
  return {
    id: "",
    cells: [
      // inputs
      0, // food
      0,
      0,
      0,
      0, //proximity
      0,
      0,
      0,
      0, // energy
      // outputs
      0, // moveX
      0, // moveY
      // internal
      0, // 11
      0, // 12
      0, // 13
      0, // 14
    ],
    links: [
      {
        source: 4, // proximity +x
        target: 9, // movex
        fn: (i: number) => -Math.max(-i + 60, 0) * 0.003
      },
      {
        source: 5, // proximity -x
        target: 9, // movex,
        fn: (i: number) => Math.max(-i + 60, 0) * 0.003
      },
      {
        source: 6, // proximity +y
        target: 10, //moveY
        fn: (i: number) => -Math.max(-i + 60, 0) * 0.003
      },
      {
        source: 7, // proximity -y
        target: 10, // moveY
        fn: (i: number) => Math.max(-i + 60, 0) * 0.003
      },
      {
        source: 0, // food +x
        target: 9, // movex
        fn: (i: number) => Math.max(-i + 60, 0) * 0.005
      },
      {
        source: 1, // food -x,
        target: 9, // movex,
        fn: (i: number) => -Math.max(-i + 60, 0) * 0.005
      },
      {
        source: 2, // food +y,
        target: 10, // moveY,
        fn: (i: number) => Math.max(-i + 60, 0) * 0.005
      },
      {
        source: 3, // food -y,
        target: 10, // moveY,
        fn: (i: number) => -Math.max(-i + 60, 0) * 0.005
      }
    ],
    position: { x: 0, y: 0 },
    heading: 0,
    velocity: 0,
  };
}

