import type { CritterDefinition } from "../types/critter";
import { CELL_IO_INDEXES } from "../systems/critter_system";

// cells as a Record<number, Cell> ?

export const Adam: CritterDefinition = {
  cells: {
    [CELL_IO_INDEXES.FOOD_ANGLE]: {
      staticValue: null,
      threshold: 0,
      decay: 0,
    },
    [CELL_IO_INDEXES.FOOD_DISTANCE]: {
      staticValue: null,
      threshold: 0,
      decay: 0,
    },
    [CELL_IO_INDEXES.TURN]: {
      staticValue: null,
      threshold: 0,
      decay: 0.2
    },
    [CELL_IO_INDEXES.ACCELLERATE]: {
      staticValue: null,
      threshold:
        0,
      decay: 0.2
    }
  },
  links: [
    {
      source: CELL_IO_INDEXES.FOOD_ANGLE,
      target: CELL_IO_INDEXES.TURN,
      factor: -1
    },
    {
      source: CELL_IO_INDEXES.FOOD_DISTANCE,
      target: CELL_IO_INDEXES.ACCELLERATE,
      factor: 1
    }
  ]
};

