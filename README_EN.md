# ARES-7 — English Edition

**ARES-7** is an educational Mars-station survival and management game.
This edition uses English throughout the player interface, lessons, events, missions, and minigames.

## Play the game

1. Unzip the package, if needed.
2. Open **`ARES7_READY.html`** in a modern web browser. This is the self-contained version, with the styles and scripts included in a single file.
3. Click **Start Game** and follow the on-screen instructions.

Alternatively, open `index.html` from the same directory as the source `.js` and `.css` files. For a local web-server launch, install Flask and run `python 1.py`, then visit `http://127.0.0.1:5000/`.

## Included game systems

- Station compartments, supplies, and daily survival cycle
- Repair, farming, life support, and resource extraction
- Emergency management and decisions
- Space missions and interactive minigames
- Scoring, settings, tutorials, and the decision log

The game mechanics, resource costs, scoring rules, and visuals are retained from the original version. Internal source identifiers remain unchanged where they are required for compatibility.

`build_ready.py` regenerates `ARES7_READY.html` from the modular source files.
