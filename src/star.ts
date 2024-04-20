import type {
  File,
  RiveCanvas,
  SMIInput,
} from '@rive-app/canvas-advanced-single';
import type { Position, StarState } from './types';
import { PositionRiveComponent } from './position_rive_component';

export abstract class Star extends PositionRiveComponent {
  protected _value = 1000;
  protected _pickedInput: SMIInput | undefined;
  protected _state: StarState = 'default';

  constructor(
    public rive: RiveCanvas,
    public file: File,
    public position: Position,
  ) {
    super('star', 'State Machine 1', rive, file, position);
    this._position = position;
    for (let i = 0; i < this.stateMachineInstance.inputCount(); i++) {
      const input = this.stateMachineInstance.input(i);
      if (input.name === 'picked') {
        this._pickedInput = input.asBool();
      }
    }
  }

  get value() {
    return this._value;
  }

  pickup() {
    this._state = 'picked';

    if (this._pickedInput) {
      this._pickedInput.value = true;
    }
  }

  kill() {
    this._state = 'dead';
  }

  update(elapsedSeconds: number): void {
    super.update(elapsedSeconds);

    if (this.isPicked) {
      for (let i = 0; i < this.stateMachineInstance.reportedEventCount(); i++) {
        const event = this.stateMachineInstance.reportedEventAt(i);
        if (event?.name === 'picked end') {
          this._state = 'dead';
        }
      }
    }
  }

  get isDead() {
    return this._state === 'dead';
  }

  get isPicked() {
    return this._state === 'picked';
  }

  get state() {
    return this._state;
  }
}

export class NormalStar extends Star {
  constructor(rive: RiveCanvas, file: File, position: Position) {
    super(rive, file, position);
    this.margin = 30;
    this._xSpeed = -300;
  }
}

export class BigStar extends Star {
  private sizeInput: SMIInput | undefined;

  constructor(rive: RiveCanvas, file: File, position: Position) {
    super(rive, file, position);
    this._value = 2000;
    this._xSpeed = -200;
    this.margin = 10;

    for (let i = 0; i < this.stateMachineInstance.inputCount(); i++) {
      const input = this.stateMachineInstance.input(i);
      if (input.name === 'size') {
        this.sizeInput = input.asNumber();
        break;
      }
    }

    if (this.sizeInput) {
      this.sizeInput.value = 1;
    }
  }
}

export class SpecialStar extends BigStar {
  private colorInput: SMIInput | undefined;

  constructor(rive: RiveCanvas, file: File, position: Position) {
    super(rive, file, position);
    this._value = 3000;
    this._xSpeed = -400;

    for (let i = 0; i < this.stateMachineInstance.inputCount(); i++) {
      const input = this.stateMachineInstance.input(i);
      if (input.name === 'color') {
        this.colorInput = input.asNumber();
        break;
      }
    }

    if (this.colorInput) {
      this.colorInput.value = 1;
    }
  }
}
