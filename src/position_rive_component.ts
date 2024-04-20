import type {
  File,
  RiveCanvas,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';
import { RiveComponent } from './rive_component';
import { Position, PositionComponent } from './types';

export abstract class PositionRiveComponent
  extends RiveComponent
  implements PositionComponent
{
  protected _position: Position;
  protected _xSpeed = 0;
  protected _ySpeed = 0;

  constructor(
    public artboardName: string,
    public stateMachineName: string,
    public rive: RiveCanvas,
    public file: File,
    public position: Position,
    public margin: number = 0,
  ) {
    super(artboardName, stateMachineName, rive, file);
    this._position = position;
  }

  update(elapsedSeconds: number) {
    super.update(elapsedSeconds);
    this._position = {
      x: this._position.x + this._xSpeed * elapsedSeconds,
      y: this._position.y + this._ySpeed * elapsedSeconds,
    };
  }

  draw(renderer: WrappedRenderer) {
    renderer.save();
    renderer.translate(this._position.x, this._position.y);
    this.artboard.draw(renderer);
    renderer.restore();
  }

  get x() {
    return this._position.x + this.margin;
  }

  get y() {
    return this._position.y + this.margin;
  }

  get xSpeed() {
    return this._xSpeed;
  }

  get ySpeed() {
    return this._ySpeed;
  }
}
