/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class WastehunterActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const data = this.system;
    const flags = this.flags.wastehunter || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(this);
    this._prepareNpcData(this);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const data = actorData.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      ability.mod = ability.value - 6.0
    }
    data.totalhealth.value = data.shield.value + data.stamina.value + data.luck.value + data.vitality.value,
    data.totalhealth.max = data.shield.max + data.stamina.max + data.luck.max + data.vitality.max



    data.resources.perkbonus.value = 2 + Math.floor((data.resources.ascension.value - 1)/5)
    data.increment = Math.floor((data.resources.ascension.value - 1)/5)
    
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const data = actorData.system;
    data.xp = (data.cr * data.cr) * 100;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.abilities)) {
      ability.mod = ability.value - 6.0
    }

  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }


  
  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}