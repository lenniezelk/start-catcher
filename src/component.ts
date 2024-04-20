import type { IComponent } from './types';

export abstract class Component implements IComponent {
  protected _id: string;
  private static _componentCount = 0;

  constructor() {
    this._id = `${++Component._componentCount}`;
  }

  get id() {
    return this._id;
  }
}
