
Hooks.once("ready", () => {
  console.log("Angry Recovery Initiative Loaded");
});


// Detect item usage and determine recovery die
Hooks.on("dnd5e.useItem", async (item, config) => {

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

  if (item.type === "feat") {
    die = 4;
  }

  await actor.setFlag("angry-init", "recoveryDie", die);
});


// When turn advances, roll recovery and push initiative forward
Hooks.on("updateCombat", async (combat, update) => {

  if (!("turn" in update)) return;

  const combatant = combat.combatant;
  if (!combatant) return;

  const actor = combatant.actor;
  if (!actor) return;

  let die = actor.getFlag("angry-init", "recoveryDie") ?? 6;

  const roll = await new Roll(`1d${die}`).evaluate();

  let newInit = (combatant.initiative ?? 0) + roll.total;

  await combat.setInitiative(combatant.id, newInit);

  roll.toMessage({
    flavor: `Recovery Roll (1d${die})`,
    speaker: ChatMessage.getSpeaker({ actor })
  });
});
