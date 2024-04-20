import type {
  File,
  RiveCanvas,
  SMIInput,
} from '@rive-app/canvas-advanced-single';
import { Position } from './types';
import { PositionRiveComponent } from './position_rive_component';

export default class Player extends PositionRiveComponent {
  private directionInput: SMIInput | undefined;
  private _speed = 300;

  constructor(
    public canvas: HTMLCanvasElement,
    public rive: RiveCanvas,
    public file: File,
    public position: Position,
  ) {
    super('player', 'State Machine 1', rive, file, position);
    this.margin = 20;
    for (let i = 0; i < this.stateMachineInstance.inputCount(); i++) {
      const input = this.stateMachineInstance.input(i);
      if (input.name === 'direction') {
        this.directionInput = input.asNumber();
      }
    }
  }

  update(elapsedSeconds: number) {
    super.update(elapsedSeconds);
    if (this._position.x < 0) {
      this._position.y = 0;
    }
    if (this._position.y > this.canvas.height - this.height) {
      this._position.y = this.canvas.height - this.height;
    }
  }

  onKeyPress(keysPressed: string[]) {
    if (keysPressed.includes('ArrowUp')) {
      this._ySpeed = -this._speed;
      if (this.directionInput) {
        this.directionInput.value = 1;
      }
    } else if (keysPressed.includes('ArrowDown')) {
      this._ySpeed = this._speed;
      if (this.directionInput) {
        this.directionInput.value = 2;
      }
    } else {
      this._ySpeed = 0;
      if (this.directionInput) {
        this.directionInput.value = 0;
      }
    }
  }
}
