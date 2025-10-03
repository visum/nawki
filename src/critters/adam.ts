import type { Critter } from "../types/critter";

export function getAdamInstance(): Critter {
  return {
    id: "",
    cells: [
      // inputs
      0, // 00 food angle
      0, // 01 food distance
      0, // 02 neightbor angle
      0, // 03 neightbor distance
      0, // 04 energy
      0, // 05 heading
      0, // 06 velocity
      0, // 07
      0, // 08
      0, // 09
      // outputs
      0, // 10 turn
      0, // 11 accel
      0, // 12
      0, // 13
      0, // 14
      0, // 15
      0, // 16
      0, // 17
      0, // 18
      0, // 19
      // internal
      0, // 20 food heading diff
      0, // 21 neighbor heading diff
      0, // 22
      0, // 23
      0, // 24
      0, // 25
    ],
    links: [
      {
        source: 0,
        target: 10,
        fn: (input:number) => input
      }
    ],
    position: { x: 0, y: 0 },
    heading: 0,
    velocity: 0,
    energy: 0
  };
}

