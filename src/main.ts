import RiveCanvas, { type File } from '@rive-app/canvas-advanced-single';
import Bump from 'bump-ts';
import './style.css';
import Player from './player';
import { NormalStar, BigStar, SpecialStar, Star } from './star';

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const rive = await RiveCanvas();
  const canvas = document.getElementById('canvas')! as HTMLCanvasElement;

  function computeSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.onresize = computeSize;
  computeSize();

  const world = Bump.newWorld(64);

  const renderer = rive.makeRenderer(canvas);
  const bytes = await (await fetch('/star-catcher.riv')).arrayBuffer();
  const file = (await rive.load(new Uint8Array(bytes))) as File;

  const bgArtboard = file.artboardByName('bg')!;
  const bgStateMachine = bgArtboard.stateMachineByName('bg')!;
  const bgStateMachineInstance = new rive.StateMachineInstance(
    bgStateMachine,
    bgArtboard,
  );

  const scoreArtboard = file.artboardByName('score')!;
  const scoreStateMachine =
    scoreArtboard.stateMachineByName('State Machine 1')!;
  const scoreStateMachineInstance = new rive.StateMachineInstance(
    scoreStateMachine,
    scoreArtboard,
  );
  const scoreText = scoreArtboard.textRun('score')!;

  const player = new Player(canvas, rive, file, { x: 100, y: 300 });
  let keysPressed: string[] = [];

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      keysPressed.push('ArrowUp');
    } else if (e.key === 'ArrowDown') {
      keysPressed.push('ArrowDown');
    }
    player.onKeyPress(keysPressed);
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
      keysPressed = keysPressed.filter((key) => key !== 'ArrowUp');
    } else if (e.key === 'ArrowDown') {
      keysPressed = keysPressed.filter((key) => key !== 'ArrowDown');
    }
    player.onKeyPress(keysPressed);
  });

  world.add('player', 100, player.y, player.width, player.height);

  let stars: Star[] = [];

  const timeBetweenStars = 3;
  let lastStarTime = 0;
  let lastTime = 0;
  let score = 0;

  function renderLoop(time: number) {
    if (!lastTime) {
      lastTime = time;
    }
    const elapsedTimeMs = time - lastTime;
    const elapsedTimeSec = elapsedTimeMs / 1000;
    lastTime = time;

    function spawnStars() {
      if (stars.length < 5 && (time - lastStarTime) / 1000 > timeBetweenStars) {
        const random = Math.random();
        let star: Star;
        const x = canvas.width + 10;
        const y = getRandomInt(200, canvas.height - 200);

        if (random < 0.2) {
          star = new SpecialStar(rive, file, {
            x,
            y,
          });
        } else if (random < 0.8) {
          star = new NormalStar(rive, file, {
            x,
            y,
          });
        } else {
          star = new BigStar(rive, file, {
            x,
            y,
          });
        }

        world.add(star.id, x, y, star.width, star.height);

        stars.push(star);
        lastStarTime = time;
      }
    }

    renderer.clear();

    bgArtboard.advance(elapsedTimeSec);
    bgStateMachineInstance.advance(elapsedTimeSec);

    renderer.save();
    renderer.align(
      rive.Fit.cover,
      rive.Alignment.center,
      {
        minX: 0,
        minY: 0,
        maxX: canvas.width,
        maxY: canvas.height,
      },
      bgArtboard.bounds,
    );
    bgArtboard.draw(renderer);
    renderer.restore();

    scoreArtboard.advance(elapsedTimeSec);
    scoreStateMachineInstance.advance(elapsedTimeSec);

    renderer.save();
    renderer.align(
      rive.Fit.none,
      rive.Alignment.topLeft,
      {
        minX: 0,
        minY: 0,
        maxX: canvas.width,
        maxY: canvas.height,
      },
      scoreArtboard.bounds,
    );
    scoreArtboard.draw(renderer);
    renderer.restore();

    world.move('player', player.x, player.y);

    stars.forEach((star) => {
      if (star.x < -star.width) {
        star.kill();
      }

      if (!star.isDead && !star.isPicked) {
        const { collisions } = world.move(
          star.id,
          star.x - star.xSpeed * elapsedTimeSec,
          star.y,
        );

        const playerCollision = collisions.some(
          (collision) => collision.other === 'player',
        );

        if (playerCollision) {
          star.pickup();
          score += star.value;
          scoreText.text = score.toString();
        }
      }
    });

    player.update(elapsedTimeSec);
    player.draw(renderer);

    stars.forEach((star) => {
      star.update(elapsedTimeSec);
      star.draw(renderer);
    });

    const pickedStars = stars.filter((star) => star.isPicked);
    pickedStars.forEach(
      (star) => world.hasItem(star.id) && world.remove(star.id),
    );
    const toDelete = stars.filter((star) => star.isDead);
    const toDeleteIds = toDelete.map((star) => star.id);
    toDeleteIds.forEach((id) => world.hasItem(id) && world.remove(id));
    stars = stars.filter((star) => !toDeleteIds.includes(star.id));
    toDelete.forEach((star) => star.delete());

    spawnStars();

    rive.requestAnimationFrame(renderLoop);
  }

  rive.enableFPSCounter();

  rive.requestAnimationFrame(renderLoop);
}

main();
