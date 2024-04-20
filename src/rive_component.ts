import type {
  File,
  RiveCanvas,
  Artboard,
  StateMachine,
  StateMachineInstance,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';
import { IRiveComponent } from './types';
import { Component } from './component';

export abstract class RiveComponent
  extends Component
  implements IRiveComponent
{
  protected artboard: Artboard;
  protected stateMachine: StateMachine;
  protected stateMachineInstance: StateMachineInstance;

  constructor(
    public artboardName: string,
    public stateMachineName: string,
    public rive: RiveCanvas,
    public file: File,
    public margin: number = 0,
  ) {
    super();

    this.artboard = file.artboardByName(artboardName)!;
    this.stateMachine = this.artboard.stateMachineByName(stateMachineName)!;
    this.stateMachineInstance = new rive.StateMachineInstance(
      this.stateMachine,
      this.artboard,
    );
  }

  update(elapsedSeconds: number): void {
    this.artboard.advance(elapsedSeconds);
    this.stateMachineInstance.advance(elapsedSeconds);
  }

  draw(renderer: WrappedRenderer): void {
    throw new Error('Method not implemented.');
  }

  delete(): void {
    this.artboard.delete();
    this.stateMachineInstance.delete();
  }

  get width(): number {
    return this.artboard.bounds.maxX - this.margin;
  }

  get height(): number {
    return this.artboard.bounds.maxY - this.margin;
  }
}
