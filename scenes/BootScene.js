export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    // Helper: draw a pixel-art sprite from a 2D color grid
    const drawSprite = (key, pixels, px) => {
      const rows = pixels.length;
      const cols = pixels[0].length;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const color = pixels[r][c];
          if (color !== 0) {
            g.fillStyle(color);
            g.fillRect(c * px, r * px, px, px);
          }
        }
      }
      g.generateTexture(key, cols * px, rows * px);
      g.destroy();
    };

    // ── Color palette ──────────────────────────────────────────────
    const W = 0xffffff; // white
    const B = 0x44aaff; // blue visor
    const b = 0x1166cc; // dark blue visor edge
    const S = 0xcccccc; // suit highlight
    const D = 0x555555; // dark detail
    const G = 0x888888; // grey
    const L = 0xbbbbbb; // light grey
    const Y = 0xffdd00; // yellow
    const O = 0xff8800; // orange
    const R = 0xff2200; // red
    const P = 0xcc44ff; // purple
    const p = 0x8800cc; // dark purple
    const T = 0x44ffaa; // teal (alien)
    const t = 0x00cc77; // dark teal
    const M = 0x999999; // metal grey (robot)
    const _ = 0;        // transparent

    // ── Astronaut (8×12 @ 5px) — 3 textures: neutral + 2 run frames ──
    drawSprite('player', [
      [_,W,W,W,W,W,W,_],
      [W,W,W,W,W,W,W,W],
      [W,b,B,B,B,B,b,W],
      [W,B,B,B,B,B,B,W],
      [W,b,B,B,B,B,b,W],
      [_,W,W,W,W,W,W,_],
      [S,W,W,W,W,W,W,S],
      [W,W,D,W,W,D,W,W],
      [W,W,W,W,W,W,W,W],
      [_,W,S,W,W,S,W,_],
      [_,W,_,_,_,_,W,_],
      [_,S,_,_,_,_,S,_],
    ], 5);

    // ── Astronaut run frame A: right arm forward+up, left leg forward ─
    // Helmet rows 0-5 identical → zero vertical jitter
    drawSprite('player_run_a', [
      [_,W,W,W,W,W,W,_],  // helmet (unchanged)
      [W,W,W,W,W,W,W,W],
      [W,b,B,B,B,B,b,W],
      [W,B,B,B,B,B,B,W],
      [W,b,B,B,B,B,b,W],
      [_,W,W,W,W,W,W,_],
      [S,W,W,W,W,W,W,_],  // left shoulder raised, right arm swung back
      [W,W,D,W,W,D,W,S],  // right arm low/back (S at far right)
      [W,W,W,W,W,W,W,W],  // torso (unchanged)
      [_,W,S,W,W,S,W,_],  // hips (unchanged)
      [_,W,_,_,_,_,_,_],  // left calf forward
      [_,S,_,_,_,_,_,_],  // left foot down, right foot up
    ], 5);

    // ── Astronaut run frame B: left arm forward+up, right leg forward ─
    drawSprite('player_run_b', [
      [_,W,W,W,W,W,W,_],  // helmet (unchanged)
      [W,W,W,W,W,W,W,W],
      [W,b,B,B,B,B,b,W],
      [W,B,B,B,B,B,B,W],
      [W,b,B,B,B,B,b,W],
      [_,W,W,W,W,W,W,_],
      [_,W,W,W,W,W,W,S],  // right shoulder raised, left arm swung back
      [S,W,D,W,W,D,W,W],  // left arm low/back (S at far left)
      [W,W,W,W,W,W,W,W],  // torso (unchanged)
      [_,W,S,W,W,S,W,_],  // hips (unchanged)
      [_,_,_,_,_,_,W,_],  // right calf forward
      [_,_,_,_,_,_,S,_],  // right foot down, left foot up
    ], 5);

    // ── Robot (8×12 @ 5px = 40×60) ────────────────────────────────
    drawSprite('robot', [
      [D,M,M,M,M,M,M,D],
      [M,L,M,M,M,M,L,M],
      [M,B,B,M,M,B,B,M],  // blue eyes
      [M,B,B,M,M,B,B,M],
      [D,M,Y,M,M,Y,M,D],  // yellow bolts
      [M,M,M,M,M,M,M,M],
      [L,M,M,L,L,M,M,L],  // chest plate
      [M,Y,M,M,M,M,Y,M],  // chest buttons
      [M,M,L,M,M,L,M,M],
      [D,M,M,M,M,M,M,D],
      [D,D,M,_,_,M,D,D],  // legs
      [D,D,M,_,_,M,D,D],
    ], 5);

    // ── Alien (8×12 @ 5px = 40×60) ────────────────────────────────
    drawSprite('alien', [
      [_,T,T,T,T,T,T,_],  // big round head
      [T,T,T,T,T,T,T,T],
      [T,W,W,T,T,W,W,T],  // large eyes
      [T,p,p,T,T,p,p,T],  // pupils
      [T,W,W,T,T,W,W,T],
      [_,T,T,T,T,T,T,_],
      [_,_,T,T,T,T,_,_],  // thin neck
      [_,T,T,t,t,T,T,_],  // slim body
      [_,T,_,T,T,_,T,_],  // arms out
      [_,T,_,_,_,_,T,_],
      [_,T,_,_,_,_,T,_],  // legs
      [_,_,_,_,_,_,_,_],
    ], 5);

    // ── Mini Rocket (8×12 @ 5px = 40×60) ─────────────────────────
    drawSprite('rocket', [
      [_,_,_,W,_,_,_,_],  // nose tip
      [_,_,W,R,W,_,_,_],
      [_,W,R,R,R,W,_,_],
      [_,R,R,R,R,R,_,_],  // body
      [_,R,W,W,W,R,_,_],  // cockpit window
      [_,R,W,W,W,R,_,_],
      [_,R,R,R,R,R,_,_],
      [O,R,R,R,R,R,O,_],  // wing fins
      [O,O,R,R,R,O,O,_],
      [O,O,R,R,R,O,O,_],
      [_,O,Y,Y,Y,O,_,_],  // exhaust glow
      [_,_,Y,O,Y,_,_,_],
    ], 5);

    // ── Robot run A: left arm forward, right leg down ─────────────
    drawSprite('robot_run_a', [
      [D,M,M,M,M,M,M,D],  // head (unchanged)
      [M,L,M,M,M,M,L,M],
      [M,B,B,M,M,B,B,M],
      [M,B,B,M,M,B,B,M],
      [D,M,Y,M,M,Y,M,D],
      [M,M,M,M,M,M,M,M],
      [L,M,M,L,L,M,M,_],  // right arm back (col 7 removed)
      [M,Y,M,M,M,M,Y,M],
      [M,M,L,M,M,L,M,_],  // right arm back
      [D,M,M,M,M,M,M,_],  // right arm back
      [_,_,_,_,_,M,D,D],  // right leg down
      [_,_,_,_,_,M,D,D],
    ], 5);

    // ── Robot run B: right arm forward, left leg down ──────────────
    drawSprite('robot_run_b', [
      [D,M,M,M,M,M,M,D],  // head (unchanged)
      [M,L,M,M,M,M,L,M],
      [M,B,B,M,M,B,B,M],
      [M,B,B,M,M,B,B,M],
      [D,M,Y,M,M,Y,M,D],
      [M,M,M,M,M,M,M,M],
      [_,M,M,L,L,M,M,L],  // left arm back (col 0 removed)
      [M,Y,M,M,M,M,Y,M],
      [_,M,L,M,M,L,M,M],  // left arm back
      [_,M,M,M,M,M,M,D],  // left arm back
      [D,D,M,_,_,_,_,_],  // left leg down
      [D,D,M,_,_,_,_,_],
    ], 5);

    // ── Alien run A: right arm raised, left leg down ───────────────
    drawSprite('alien_run_a', [
      [_,T,T,T,T,T,T,_],  // head (unchanged)
      [T,T,T,T,T,T,T,T],
      [T,W,W,T,T,W,W,T],
      [T,p,p,T,T,p,p,T],
      [T,W,W,T,T,W,W,T],
      [_,T,T,T,T,T,T,_],
      [_,_,T,T,T,T,_,_],  // neck (unchanged)
      [_,T,T,t,t,T,T,_],  // body (unchanged)
      [_,_,_,T,T,_,T,T],  // right arm raised out
      [_,_,_,_,_,_,_,T],  // right arm tip
      [_,T,_,_,_,_,_,_],  // left leg down
      [_,T,_,_,_,_,_,_],  // left foot
    ], 5);

    // ── Alien run B: left arm raised, right leg down ───────────────
    drawSprite('alien_run_b', [
      [_,T,T,T,T,T,T,_],  // head (unchanged)
      [T,T,T,T,T,T,T,T],
      [T,W,W,T,T,W,W,T],
      [T,p,p,T,T,p,p,T],
      [T,W,W,T,T,W,W,T],
      [_,T,T,T,T,T,T,_],
      [_,_,T,T,T,T,_,_],  // neck (unchanged)
      [_,T,T,t,t,T,T,_],  // body (unchanged)
      [T,T,_,T,T,_,_,_],  // left arm raised out
      [T,_,_,_,_,_,_,_],  // left arm tip
      [_,_,_,_,_,_,T,_],  // right leg down
      [_,_,_,_,_,_,T,_],  // right foot
    ], 5);

    // ── Rocket run A: wide thruster flame ─────────────────────────
    drawSprite('rocket_run_a', [
      [_,_,_,W,_,_,_,_],  // body (unchanged)
      [_,_,W,R,W,_,_,_],
      [_,W,R,R,R,W,_,_],
      [_,R,R,R,R,R,_,_],
      [_,R,W,W,W,R,_,_],
      [_,R,W,W,W,R,_,_],
      [_,R,R,R,R,R,_,_],
      [O,R,R,R,R,R,O,_],
      [O,O,R,R,R,O,O,_],
      [O,O,R,R,R,O,O,_],
      [O,Y,Y,Y,Y,O,_,_],  // wide exhaust
      [Y,O,Y,Y,O,Y,_,_],  // wide flame base
    ], 5);

    // ── Rocket run B: narrow thruster flame ───────────────────────
    drawSprite('rocket_run_b', [
      [_,_,_,W,_,_,_,_],  // body (unchanged)
      [_,_,W,R,W,_,_,_],
      [_,W,R,R,R,W,_,_],
      [_,R,R,R,R,R,_,_],
      [_,R,W,W,W,R,_,_],
      [_,R,W,W,W,R,_,_],
      [_,R,R,R,R,R,_,_],
      [O,R,R,R,R,R,O,_],
      [O,O,R,R,R,O,O,_],
      [O,O,R,R,R,O,O,_],
      [_,_,O,Y,O,_,_,_],  // narrow exhaust
      [_,_,Y,R,Y,_,_,_],  // hot core
    ], 5);

    // ── Asteroid (8×8 @ 5px = 40×40) ─────────────────────────────
    drawSprite('asteroid', [
      [_,_,G,G,L,G,_,_],
      [_,G,L,G,G,G,G,_],
      [G,G,G,D,G,L,G,_],
      [G,L,G,G,D,G,G,G],
      [G,G,D,G,G,G,L,G],
      [G,G,G,L,G,D,G,_],
      [_,G,G,G,G,G,_,_],
      [_,_,G,L,G,_,_,_],
    ], 5);

    // ── UFO (12×6 @ 5px = 60×30) ─────────────────────────────────
    drawSprite('ufo', [
      [_,_,_,_,P,P,P,P,_,_,_,_],
      [_,_,_,P,p,T,T,p,P,_,_,_],
      [_,P,P,P,P,P,P,P,P,P,P,_],
      [P,P,L,L,L,L,L,L,L,L,P,P],
      [_,P,P,P,P,P,P,P,P,P,_,_],
      [_,_,T,_,_,T,_,_,T,_,_,_],
    ], 5);

    // ── Coin (4×4 @ 5px = 20×20) ─────────────────────────────────
    drawSprite('coin', [
      [_,Y,Y,_],
      [Y,O,O,Y],
      [Y,O,O,Y],
      [_,Y,Y,_],
    ], 5);

    // ── Ground tile (800×20) ──────────────────────────────────────
    const groundG = this.make.graphics({ x: 0, y: 0, add: false });
    groundG.fillStyle(0x1a1a4a); groundG.fillRect(0, 0, 800, 20);
    groundG.fillStyle(0x3a3a7a); groundG.fillRect(0, 0, 800, 3);
    groundG.fillStyle(0x0a0a2a); groundG.fillRect(0, 17, 800, 3);
    for (let x = 0; x < 800; x += 40) {
      groundG.fillStyle(0x2a2a6a); groundG.fillRect(x, 4, 20, 6);
    }
    groundG.generateTexture('ground', 800, 20);
    groundG.destroy();

    // ── Boss alien ship (16×16 @ 5px = 80×80) ────────────────────
    drawSprite('boss', [
      [_,_,_,_,_,R,R,R,R,R,_,_,_,_,_,_],
      [_,_,_,_,R,R,O,O,O,R,R,_,_,_,_,_],
      [_,_,_,R,R,O,O,R,O,O,R,R,_,_,_,_],
      [_,_,R,R,R,R,R,R,R,R,R,R,R,_,_,_],
      [_,R,R,T,T,R,R,R,R,R,T,T,R,R,_,_],
      [R,R,R,T,T,R,O,R,O,R,T,T,R,R,R,_],
      [R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,_],
      [R,R,R,R,R,R,R,R,R,R,R,R,R,R,R,_],
      [R,R,O,R,R,R,R,R,R,R,R,R,O,R,R,_],
      [_,R,R,R,R,R,R,R,R,R,R,R,R,R,_,_],
      [_,_,R,R,O,R,R,R,R,R,O,R,R,_,_,_],
      [_,_,_,R,R,R,R,R,R,R,R,R,_,_,_,_],
      [_,_,R,_,_,R,R,R,R,R,_,_,R,_,_,_],
      [_,R,_,_,_,_,R,R,R,_,_,_,_,R,_,_],
      [R,_,_,_,_,_,_,R,_,_,_,_,_,_,R,_],
      [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ], 5);

    // ── Bullet (4×2 @ 4px = 16×8) ────────────────────────────────
    drawSprite('bullet', [
      [_,O,O,_],
      [O,Y,Y,O],
    ], 4);

    // ── Zone 2: Alien Plant (8×10 @ 5px = 40×50) — ground, jump over ──
    drawSprite('alien_plant', [
      [_,_,_,P,_,_,_,_],
      [_,_,P,p,P,_,_,_],
      [_,P,T,T,T,P,_,_],
      [P,T,t,T,t,T,P,_],
      [_,P,T,T,T,P,_,_],
      [_,_,T,T,T,_,_,_],
      [_,_,t,T,t,_,_,_],
      [_,T,T,T,T,T,_,_],
      [T,T,t,T,t,T,T,_],
      [t,T,T,t,T,T,t,_],
    ], 5);

    // ── Zone 2: Laser Bolt (10×3 @ 5px = 50×15) — aerial, slide under ──
    drawSprite('laser_bolt', [
      [Y,O,O,O,O,O,O,O,O,Y],
      [W,Y,R,O,O,O,O,R,Y,W],
      [Y,O,O,O,O,O,O,O,O,Y],
    ], 5);

    // ── Zone 3: Gravity Orb (7×7 @ 5px = 35×35) — aerial, jump or slide ──
    drawSprite('gravity_orb', [
      [_,_,p,p,p,_,_],
      [_,p,D,p,D,p,_],
      [p,D,p,P,p,D,p],
      [p,p,P,W,P,p,p],
      [p,D,p,P,p,D,p],
      [_,p,D,p,D,p,_],
      [_,_,p,p,p,_,_],
    ], 5);

    // ── Zone 3: Space Debris (8×8 @ 5px = 40×40) — ground, jump over ──
    drawSprite('space_debris', [
      [_,_,D,p,_,D,_,_],
      [_,D,b,D,D,b,D,_],
      [D,b,D,D,b,D,D,_],
      [b,D,D,b,D,D,b,_],
      [D,D,b,D,D,b,D,_],
      [D,b,D,D,b,D,_,_],
      [_,D,D,b,D,_,_,_],
      [_,_,D,_,_,_,_,_],
    ], 5);

    this.scene.start('TitleScene');
  }
}
