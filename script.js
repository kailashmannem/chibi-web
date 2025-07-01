document.addEventListener('DOMContentLoaded', function() {
  // Sprite configurations for each action
  const actions = {
    Idle: { img: 'sprites/Idle.png', frames: 5 },
    Jump: { img: 'sprites/Jump.png', frames: 8 },
    Run: { img: 'sprites/Run.png', frames: 8 },
    Walk: { img: 'sprites/Walk.png', frames: 8 },
    Attack_1: { img: 'sprites/Attack_1.png', frames: 6 },
    Attack_2: { img: 'sprites/Attack_2.png', frames: 3 },
    Attack_3: { img: 'sprites/Attack_3.png', frames: 3 },
    Attack_4: { img: 'sprites/Attack_4.png', frames: 10 },
    Tosleep: { img: 'sprites/Tosleep.png', frames: 5 },
    Sleeping: { img: 'sprites/Sleeping.png', frames: 7 },
    Wakeup: { img: 'sprites/Wakeup.png', frames: 5 },
    Hurt: { img: 'sprites/Hurt.png', frames: 5 },
  };
  const actionKeys = Object.keys(actions);

  const frameWidth = 128;
  const frameHeight = 128;
  let frameCount = actions.Idle.frames;
  let frameDuration = 120;

  const chibi = document.getElementById('chibi');
  let currentFrame = 0;
  let currentAction = 'Idle';
  let animationInterval = null;
  let inactivityTimeout = null;
  let lastAction = null;

  // --- Action Pool Management ---
  let actionPool = actionKeys.slice();
  let cycling = false;
  let sleeping = false;
  let justWokeUp = false;

  // Track chibi's current position (relative to container)
  let chibiPos = { x: null, y: null };

  // Only allow Idle and Jump actions when cursor is active
  const activeActionKeys = ['Idle', 'Jump'];

  // Add a toggle to alternate between Idle and Jump
  let nextActiveAction = 'Idle';

  // --- Chibi Chase Logic ---
  let busy = false;
  const proximityRadius = 100; // px

  // --- Mouse speed tracking ---
  let lastMousePos = null;
  let lastMouseTime = null;
  let mouseSpeed = 1; // px/ms

  let attackInProgress = false;

  function getCursorPosInContainer(e) {
    const container = document.getElementById('chibi-container');
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function isCursorInsideChibi(cursor, chibiBox) {
    return (
      cursor.x >= chibiBox.left &&
      cursor.x <= chibiBox.right &&
      cursor.y >= chibiBox.top &&
      cursor.y <= chibiBox.bottom
    );
  }

  function isCursorNearChibi(cursor, chibiBox) {
    // Use center of chibi
    const cx = (chibiBox.left + chibiBox.right) / 2;
    const cy = (chibiBox.top + chibiBox.bottom) / 2;
    const dx = cursor.x - cx;
    const dy = cursor.y - cy;
    return Math.sqrt(dx * dx + dy * dy) < proximityRadius;
  }

  function teleportChibiRandomly() {
    const container = document.getElementById('chibi-container');
    const maxX = container.offsetWidth - frameWidth;
    const maxY = container.offsetHeight - frameHeight;
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    chibi.style.transition = 'none';
    chibi.style.transform = 'none';
    chibi.style.left = `${newX}px`;
    chibi.style.top = `${newY}px`;
    chibiPos.x = newX;
    chibiPos.y = newY;
  }

  function resetChibiToCenter() {
    const container = document.getElementById('chibi-container');
    const parent = container.getBoundingClientRect();
    chibiPos.x = (parent.width - frameWidth) / 2;
    chibiPos.y = (parent.height - frameHeight) / 2;
    chibi.style.left = `${chibiPos.x}px`;
    chibi.style.top = `${chibiPos.y}px`;
  }

  function updateMouseSpeed(e) {
    const now = performance.now();
    const pos = { x: e.clientX, y: e.clientY };
    if (lastMousePos && lastMouseTime) {
      const dx = pos.x - lastMousePos.x;
      const dy = pos.y - lastMousePos.y;
      const dt = now - lastMouseTime;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouseSpeed = dt > 0 ? dist / dt : 1;
      // Clamp speed to reasonable range
      mouseSpeed = Math.max(0.2, Math.min(mouseSpeed, 3));
    }
    lastMousePos = pos;
    lastMouseTime = now;
  }

  function runAwayFromCursor(cursor) {
    const container = document.getElementById('chibi-container');
    const maxX = container.offsetWidth - frameWidth;
    const maxY = container.offsetHeight - frameHeight;
    const chibiBox = chibi.getBoundingClientRect();
    const cx = (chibiBox.left + chibiBox.right) / 2 - container.getBoundingClientRect().left;
    const cy = (chibiBox.top + chibiBox.bottom) / 2 - container.getBoundingClientRect().top;
    const dx = cx - cursor.x;
    const dy = cy - cursor.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const runDist = 150;
    let newX = chibiPos.x + (dx / dist) * runDist;
    let newY = chibiPos.y + (dy / dist) * runDist;
    // If out of bounds, teleport
    if (newX < 0 || newX > maxX || newY < 0 || newY > maxY) {
      teleportChibiRandomly();
      return;
    }
    // Make movement duration even faster
    const minDuration = 60, maxDuration = 400;
    const duration = Math.max(minDuration, maxDuration - (mouseSpeed * 350));
    chibi.style.transition = `transform ${duration}ms linear`;
    chibi.style.transform = `translate(${newX - chibiPos.x}px, ${newY - chibiPos.y}px)`;
    setTimeout(() => {
      chibi.style.transition = 'none';
      chibi.style.transform = 'none';
      chibi.style.left = `${newX}px`;
      chibi.style.top = `${newY}px`;
      chibiPos.x = newX;
      chibiPos.y = newY;
    }, duration);
  }

  function playRandomAttackFacingCursor(cursor) {
    attackInProgress = true;
    // Optionally flip chibi to face cursor
    const chibiBox = chibi.getBoundingClientRect();
    const cx = (chibiBox.left + chibiBox.right) / 2;
    if (cursor.x < cx) {
      chibi.style.transform += ' scaleX(-1)';
    } else {
      chibi.style.transform += ' scaleX(1)';
    }
    const attacks = ['Attack_1', 'Attack_2', 'Attack_3', 'Attack_4'];
    const attack = attacks[Math.floor(Math.random() * attacks.length)];
    setChibiAction(attack);
    startAnimation(true, () => {
      chibi.style.transform = chibi.style.transform.replace(/scaleX\([-]?[0-9.]+\)/, '');
      attackInProgress = false;
      busy = false;
      if (!isCursorNearChibi(lastCursor, {
        left: chibiPos.x,
        right: chibiPos.x + frameWidth,
        top: chibiPos.y,
        bottom: chibiPos.y + frameHeight
      })) {
        cycling = false;
        startCyclingActions();
      }
    });
  }

  let lastCursor = {x: 0, y: 0};
  document.addEventListener('mousemove', (e) => {
    updateMouseSpeed(e);
    resetInactivityTimer();
    if (sleeping) {
      if (!justWokeUp) {
        justWokeUp = true;
        wakeUpSequence();
      }
      return;
    }
    if (busy) return;
    const cursor = getCursorPosInContainer(e);
    lastCursor = cursor;
    const chibiBox = chibi.getBoundingClientRect();
    const chibiRect = {
      left: chibiBox.left - chibiBox.left + chibiPos.x,
      right: chibiBox.left - chibiBox.left + chibiPos.x + frameWidth,
      top: chibiBox.top - chibiBox.top + chibiPos.y,
      bottom: chibiBox.top - chibiBox.top + chibiPos.y + frameHeight
    };
    // Check if caught
    if (isCursorInsideChibi(cursor, chibiRect)) {
      busy = true;
      setChibiAction('Hurt');
      startAnimation(true, () => {
        resetChibiToCenter();
        busy = false;
        cycling = false;
        startCyclingActions();
      });
      return;
    }
    // Check if near
    if (isCursorNearChibi(cursor, chibiRect)) {
      busy = true;
      runAwayFromCursor(cursor);
      setTimeout(() => {
        playRandomAttackFacingCursor(cursor);
      }, 600);
      return;
    }
    // If attack is in progress, let it finish before resuming
    if (attackInProgress) return;
    if (!cycling) {
      startCyclingActions();
    }
  });

  document.addEventListener('mouseleave', () => {
    if (!sleeping) goToSleepSequence();
  });

  document.addEventListener('mouseenter', () => {
    if (sleeping && !justWokeUp) {
      justWokeUp = true;
      wakeUpSequence();
    }
  });

  function startAnimation(playOnce = false, onComplete = null) {
    if (animationInterval) clearInterval(animationInterval);
    console.log('startAnimation:', currentAction, 'frameCount:', frameCount, 'playOnce:', playOnce);
    if (playOnce) {
      currentFrame = 0;
      animationInterval = setInterval(() => {
        chibi.style.backgroundPosition = `-${currentFrame * frameWidth}px 0px`;
        currentFrame++;
        if (currentFrame >= frameCount) {
          clearInterval(animationInterval);
          if (onComplete) onComplete();
          else {
            setChibiAction('Idle');
            startAnimation();
          }
        }
      }, frameDuration);
    } else {
      animationInterval = setInterval(updateChibiFrame, frameDuration);
    }
  }

  // --- Movement Logic ---
  function moveChibiRandomly(type) {
    const container = document.getElementById('chibi-container');
    const maxX = container.offsetWidth - frameWidth;
    const maxY = container.offsetHeight - frameHeight;
    const distance = type === 'Run' ? 300 : 120; // px
    const angle = Math.random() * 2 * Math.PI; // 0-360°
    let dx = Math.cos(angle) * distance;
    let dy = Math.sin(angle) * distance;
    const parent = container.getBoundingClientRect();
    let { x: startX, y: startY } = getChibiCurrentPos();
    let newX = Math.max(0, Math.min(maxX, startX + dx));
    let newY = Math.max(0, Math.min(maxY, startY + dy));
    chibi.style.transition = type === 'Run' ? 'transform 0.6s linear' : 'transform 1.2s linear';
    chibi.style.transform = `translate(${newX - startX}px, ${newY - startY}px)`;
    // After animation, update chibiPos and reset transform
    setTimeout(() => {
      chibi.style.transition = 'none';
      chibi.style.transform = 'none';
      chibi.style.left = `${newX}px`;
      chibi.style.top = `${newY}px`;
      chibiPos.x = newX;
      chibiPos.y = newY;
      chibi.style.position = 'absolute';
    }, type === 'Run' ? 700 : 1400);
  }

  // Ensure chibi is absolutely positioned in the container
  const chibiContainer = document.getElementById('chibi-container');
  chibiContainer.style.position = 'relative';
  chibi.style.position = 'absolute';

  // Initialize chibi to center and start idle animation
  const parent = chibiContainer.getBoundingClientRect();
  chibiPos.x = (parent.width - frameWidth) / 2;
  chibiPos.y = (parent.height - frameHeight) / 2;
  chibi.style.left = `${chibiPos.x}px`;
  chibi.style.top = `${chibiPos.y}px`;

  setChibiAction('Idle');
  startAnimation();
  resetInactivityTimer();

  function setChibiAction(action) {
    if (!actions[action]) return;
    currentAction = action;
    chibi.style.backgroundImage = `url('${actions[action].img}')`;
    frameCount = actions[action].frames;
    currentFrame = 0;
    console.log('setChibiAction:', action, 'frameCount:', frameCount);
  }

  function updateChibiFrame() {
    chibi.style.backgroundPosition = `-${currentFrame * frameWidth}px 0px`;
    currentFrame = (currentFrame + 1) % frameCount;
  }

  function getChibiCurrentPos() {
    // If not set, initialize to center
    const container = document.getElementById('chibi-container');
    const parent = container.getBoundingClientRect();
    if (chibiPos.x === null || chibiPos.y === null) {
      chibiPos.x = (parent.width - frameWidth) / 2;
      chibiPos.y = (parent.height - frameHeight) / 2;
    }
    return { ...chibiPos };
  }

  function getNextAction() {
    if (cycling && !sleeping) {
      // Alternate strictly between Idle and Jump
      const action = nextActiveAction;
      nextActiveAction = (nextActiveAction === 'Idle') ? 'Jump' : 'Idle';
      lastAction = action;
      return action;
    }
    // Otherwise, use the original pool logic for sleep/other states
    let available = actionPool.filter(a => a !== lastAction);
    if (available.length === 0) {
      actionPool = actionKeys.slice();
      available = actionPool.filter(a => a !== lastAction);
    }
    const idx = Math.floor(Math.random() * available.length);
    const action = available[idx];
    actionPool = actionPool.filter(a => a !== action);
    lastAction = action;
    return action;
  }

  function playActionSequence() {
    if (!cycling) return;
    const action = getNextAction();
    setChibiAction(action);
    if (action === 'Walk' || action === 'Run') {
      moveChibiRandomly(action);
    }
    startAnimation(true, () => {
      playActionSequence();
    });
  }

  function startCyclingActions() {
    if (cycling) return;
    cycling = true;
    playActionSequence();
  }

  function stopCyclingActions() {
    cycling = false;
    setChibiAction('Idle');
    startAnimation();
    chibi.style.transition = 'transform 0.5s';
    chibi.style.transform = 'translate(0, 0)';
  }

  function goToSleepSequence() {
    cycling = false;
    sleeping = true;
    setChibiAction('Idle');
    startAnimation(true, () => {
      setChibiAction('Tosleep');
      startAnimation(true, () => {
        setChibiAction('Sleeping');
        startAnimation(false); // Loop sleeping
      });
    });
  }

  function wakeUpSequence() {
    setChibiAction('Wakeup');
    startAnimation(true, () => {
      setChibiAction('Idle');
      startAnimation();
      sleeping = false;
      justWokeUp = false;
      cycling = false;
      busy = false;
      startCyclingActions();
    });
  }

  function resetInactivityTimer() {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    if (sleeping) return;
    inactivityTimeout = setTimeout(() => {
      if (!sleeping) goToSleepSequence();
    }, 5000); // 5 seconds
  }
});
