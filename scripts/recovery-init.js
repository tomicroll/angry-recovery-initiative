Hooks.once("ready", () => {
  console.log("Angry Recovery Initiative Loaded");
});

/* Set all combatants to initiative 10 when added */
Hooks.on("createCombatant", async (combatant) => {
  const combat = game.combat;
  if (!combat) return;
  await combat.setInitiative(combatant.id, 10);
});

/* Add recovery buttons above combat controls */
Hooks.on("renderCombatTracker", (app, html) => {

  if (html.find(".angry-recovery-controls").length) return;

  const controls = $(`
  <div class="angry-recovery-controls" style="width:100%;text-align:center;padding:4px;border-top:1px solid #555;">
    <b>Recovery</b><br>
    <button data-die="4">Fast d4</button>
    <button data-die="6">Normal d6</button>
    <button data-die="8">Heavy d8</button>
    <button data-die="10">Spell d10</button>
  </div>
  `);

  html.find(".combat-controls").before(controls);

  controls.find("button").on("click", async (ev) => {

    const die = Number(ev.currentTarget.dataset.die);
    const combat = game.combat;
    const combatant = combat?.combatant;

    if (!combatant) {
      ui.notifications.warn("No active combatant.");
      return;
    }

    const actor = combatant.actor;

    const roll = await new Roll(`1d${die}`).evaluate();

    /* Initiative is set to the recovery roll */
    await combat.setInitiative(combatant.id, roll.total);

    roll.toMessage({
      flavor: `Recovery Roll (1d${die})`,
      speaker: ChatMessage.getSpeaker({ actor })
    });

    await combat.nextTurn();

  });

});
