
Hooks.once("ready", () => {
  console.log("Angry Recovery Initiative Loaded");
});

/* Give everyone the same starting initiative */
Hooks.on("createCombatant", async (combatant) => {
  if (!game.combat) return;
  await game.combat.setInitiative(combatant.id, 10);
});

/* Combat Tracker Buttons */
Hooks.on("renderCombatTracker", (app, html, data) => {

  const controls = `
  <div class="angry-recovery-controls" style="padding:4px;border-top:1px solid #666;">
    <b>Recovery:</b>
    <button data-die="4">Fast d4</button>
    <button data-die="6">Normal d6</button>
    <button data-die="8">Heavy d8</button>
    <button data-die="10">Spell d10</button>
  </div>
  `;

  html.find(".combat-tracker").append(controls);

  html.find(".angry-recovery-controls button").click(async ev => {

    const die = Number(ev.currentTarget.dataset.die);

    const combatant = game.combat?.combatant;
    if (!combatant) return;

    const actor = combatant.actor;
    if (!actor) return;

    const roll = await new Roll(`1d${die}`).evaluate();

    const newInit = (combatant.initiative ?? 0) + roll.total;

    await game.combat.setInitiative(combatant.id, newInit);

    roll.toMessage({
      flavor: `Recovery Roll (1d${die})`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    game.combat.nextTurn();

  });

});

/* Fallback recovery die detection (items) */
Hooks.on("dnd5e.useItem", async (item) => {

  const actor = item.actor;
  if (!actor) return;

  let die = 6;

  if (item.type === "spell") {
    const lvl = item.system.level ?? 0;
    die = lvl >= 3 ? 10 : 8;
  }

  if (item.type === "weapon") {
    if (item.system.properties?.hvy) die = 8;
    else die = 6;
  }

  await actor.setFlag("angry-init", "recoveryDie", die);

});
