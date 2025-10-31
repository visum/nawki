import type { CritterDefinition } from "../types/critter";
import { CELL_IO_INDEXES } from "../systems/critter_system";

export const Adam: CritterDefinition = {
  cells: {
    [CELL_IO_INDEXES.FOOD_PROXIMITY]: {
      threshold: 50,
      decay: 0
    },
    [CELL_IO_INDEXES.FOOD_ANGLE]: {
      threshold: 0,
      decay: 1
    },
    [CELL_IO_INDEXES.NEIGHBOR_PROXIMITY]: {
      threshold: 0,
      decay: 0
    },
    [CELL_IO_INDEXES.NEIGHBOR_ANGLE]: {
      threshold: 0,
      decay: 1
    },
    [CELL_IO_INDEXES.CONST_ONE]: {
      threshold: 0,
      decay: 0
    },
    [CELL_IO_INDEXES.TURN]: {
      threshold: 0,
      decay: 1
    },
    [CELL_IO_INDEXES.ACCELLERATE]: {
      threshold: 0,
      decay: 1
    },
  },
  links: [
    {
      source: CELL_IO_INDEXES.FOOD_ANGLE,
      target: CELL_IO_INDEXES.TURN,
      factor: -1,
      gateCell: CELL_IO_INDEXES.FOOD_PROXIMITY
    },
    {
      source: CELL_IO_INDEXES.CONST_ONE,
      target: CELL_IO_INDEXES.ACCELLERATE,
      factor: 2,
      gateCell: CELL_IO_INDEXES.FOOD_PROXIMITY
    }
  ]
};

