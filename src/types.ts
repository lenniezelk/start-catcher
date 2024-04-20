import type {
  File,
  RiveCanvas,
  WrappedRenderer,
} from '@rive-app/canvas-advanced-single';

export type Position = {
  x: number;
  y: number;
};

export interface PositionComponent {
  position: Position;
  xSpeed: number;
  ySpeed: number;
  x: number;
  y: number;
}

export interface IComponent {
  id: string;
}

export interface IRiveComponent {
  artboardName: string;
  stateMachineName: string;
  rive: RiveCanvas;
  file: File;
  margin: number;
  update(elapsedSeconds: number): void;
  draw(renderer: WrappedRenderer): void;
  delete(): void;
  width: number;
  height: number;
}

export type StarState = 'default' | 'picked' | 'dead';
