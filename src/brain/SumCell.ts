import { Cell } from "./cell";

export class SumCell implements Cell {
  private _value: null;

  read() {
    return this._value;
  }


}
