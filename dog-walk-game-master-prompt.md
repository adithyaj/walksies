# Master Prompt: Build a Browser Prototype of a Dog-Walk Tug Game

Use this prompt with an AI coding tool to generate a playable v1 browser game.

## Prompt
You are building a net-new browser game prototype in vanilla web technology. Create a playable, single-page HTML/CSS/JavaScript game with no framework requirement and no backend. The game should run locally in a browser with either no build step or the lightest possible setup.

Build a top-down arcade-style game inspired by the readability of Frogger or old Pokemon overworld movement, but focused on a funny asymmetric tug-of-war between a dog and its owner during a walk.

### Core concept
The game has three modes:

1. Dog single-player
The player controls the dog. The dog wants to maximize:
- Fun smells
- Bones or treats on the ground
- Getting close to other dogs for barking/social interaction

The AI-controlled owner is trying to finish the walk and collect owner-focused treasures. If the dog resists too much, pulls too hard off-route, or keeps ignoring the owner's goals, the owner's anger meter rises. If that anger meter fills completely, the walk ends immediately and the dog loses.

2. Owner single-player
The player controls the owner. The owner wants to maximize:
- Talking to neighbors
- Picking up cash on the ground
- Making progress toward finishing the walk

The AI-controlled dog is trying to pull toward dog-focused treasures. If the owner pulls too hard, ignores the dog's interests too much, or creates too much leash strain, the dog's anger or sadness meter rises. If that meter fills completely, the round ends and the owner loses.

3. Local two-player
One player controls the dog and one controls the owner on the same keyboard. There is no anger meter in this mode. The challenge is the leash tension and conflicting goals. Each side tries to maximize its own score before the pair reaches the end of the walk. Winner is decided by final score.

### Required presentation
- Top-down view
- Clean retro-arcade readability
- Simple shapes, placeholder sprites, or lightweight stylized tiles are fine
- Minimal but clear animation
- Simple HUD showing scores, active mode, and anger meter in solo modes
- Start screen with title and mode selection
- Gameplay screen
- End-of-round results screen with winner/loser and score breakdown

Do not over-invest in visual polish. Prioritize clarity and fun over art complexity.

### Technical constraints
- Use vanilla HTML, CSS, and JavaScript
- Prefer Canvas rendering or another simple rendering approach suitable for a small arcade game
- Keep code concise and organized into understandable modules or sections
- Do not use React, Phaser, a backend, or online services
- No heavy physics engine
- Keep everything local and easy to run

### Controls
- In single-player, the human controls the active character with arrow keys
- In local two-player:
  - Owner uses arrow keys
  - Dog uses WASD
- Add a simple restart key or restart button
- Add a pause capability if it is easy, but gameplay matters more than pause support

### Map and round structure
Create a compact city-block or neighborhood-walk map with:
- A clear starting point
- A visible destination or exit tile representing the end of the walk
- Walkable paths and a few obstacles or boundaries
- Spawn points for pickups and interaction targets

Each round should begin near the start of the route and end when:
- The pair reaches the destination tile, or
- In solo modes, the AI counterpart's anger meter fills and forces an immediate loss

In multiplayer, there is no anger loss. The round ends when the pair reaches the destination.

### Scoring design
Use asymmetric, readable scoring with a few simple pickup types.

Dog-positive pickups/interactions:
- Smell spots
- Bones or treats
- Other dog interaction zones

Dog-negative pickups/interactions:
- Chocolate or another clearly bad dog item

Owner-positive pickups/interactions:
- Cash on the ground
- Neighbor conversation spots
- Progress bonus for reaching the destination

Owner-negative pickups/interactions:
- Dog-only distraction spots such as smell patches that waste time for the owner

Make the score values simple and consistent. The exact values are up to you, but they should be easy to understand and balanced enough that all pickup types matter.

### Leash mechanic
This is a required core system.

Implement a physics-lite tether between dog and owner:
- Dog and owner move independently
- A maximum leash distance constrains how far apart they can get
- When they pull apart, leash tension should visibly affect movement
- Tension should create a tug-of-war feel without requiring real physics simulation

Use a simple spring, pullback, or damped tether model. Keep it readable and deterministic rather than physically accurate.

The leash should matter in all modes:
- In solo modes, it creates tension between player goals and AI goals
- In multiplayer, it becomes the core contest mechanic

### Solo-mode AI
Keep the AI simple, readable, and rule-based.

Owner AI in dog single-player should prioritize:
1. Recovering leash distance if separation is too high
2. Moving toward owner-positive objectives when safe
3. Making progress toward the destination

Dog AI in owner single-player should prioritize:
1. Recovering leash distance if separation is too high
2. Chasing nearby dog-positive pickups when reachable
3. Drifting toward the route if the player is cooperating

Do not implement advanced pathfinding unless clearly needed. Simple steering behavior, waypoint following, and nearest-target logic are preferred.

### Anger meter rules
Solo modes require a visible anger meter for the AI-controlled counterpart.

The anger meter should rise when:
- The player keeps pulling in the opposite direction
- The leash stays under strong tension for too long
- The player repeatedly prioritizes selfish pickups over shared progress
- The route progress stalls excessively because of the player's decisions

The anger meter should fall slowly or stabilize when:
- The player moves back toward the route
- The player allows the AI counterpart to make progress
- Leash tension is reduced

The meter should be understandable and tunable. It should create pressure without ending the round too quickly.

### Gameplay feel
Aim for a short, replayable prototype with readable systems:
- Fast restart
- Immediate feedback on pickups
- Visible leash behavior
- Clear win/loss rules
- Funny asymmetric tension between dog and owner motivations

The game should feel playful and slightly chaotic, but not confusing.

### Minimum UI requirements
Show at all times during gameplay:
- Current mode
- Dog score
- Owner score
- Anger meter in solo modes for the AI-controlled counterpart
- A destination indicator or some visual cue for where the walk ends

At round end, show:
- Whether the player won or lost
- Final dog score
- Final owner score
- Why the round ended, such as destination reached or anger meter filled
- Option to play again

### Deliverables
Produce all code needed for a playable local prototype, including:
- `index.html`
- `styles.css`
- `script.js`
- Any small helper assets only if truly necessary

Also provide short run instructions. Prefer something as simple as opening `index.html` in a browser, or if needed, a minimal local static server instruction.

### Acceptance criteria
The prototype is only complete if all of the following are true:

- Dog single-player is playable from start to finish
- Owner single-player is playable from start to finish
- Local two-player works on one shared keyboard
- Leash tension visibly affects movement in all modes
- Solo anger meters can rise and trigger a loss condition
- Positive and negative pickups affect the correct side's score
- The destination tile ends the round correctly
- The end screen shows scores and round outcome clearly
- The game runs locally with minimal setup

### Quality bar
Do not build a giant architecture for this. This is a focused prototype. Favor:
- Clear code
- Simple systems
- Readable balance
- Easy local execution

Avoid:
- Overengineering
- Fancy menus
- Backend services
- Online multiplayer
- Complex asset pipelines

Return the full implementation and the minimal instructions to run it.

## Intended use
Paste the prompt above into a coding model and have it generate the prototype.
