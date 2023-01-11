import { onManageActiveEffect, prepareActiveEffectCategories } from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class WastehunterActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastehunter", "sheet", "actor"],
      template: "systems/wastehunter/templates/actor/actor-sheet.html",
      width: 1000,
      height: 1000,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/wastehunter/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.WASTEHUNTER.abilities[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: []
    };
    const contact = [];
    const language = [];
    const inventoryslot = [];
    const currency = [];
    const clothes = [];
    const personalitems = [];
    const consumables = [];
    const vehicles = [];
    const safehouse = [];
    const decker = [];
    const sins = [];


    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
      // Append to contacts.
      else if (i.type === 'contact') {
        contact.push(i);
      }
      // Appand to languages
      else if (i.type === 'language') {
        language.push(i)
      }
      else if (i.type === 'inventoryslot') {
        inventoryslot.push(i)
      }
      else if (i.type === 'currency') {
        currency.push(i)
      }
      else if (i.type === 'clothes') {
        clothes.push(i)
      }
      else if (i.type === 'personalitems') {
        personalitems.push(i)
      }
      else if (i.type === 'consumables') {
        consumables.push(i)
      }
      else if (i.type === 'vehicles') {
        vehicles.push(i)
      }
      else if (i.type === 'safehouse') {
        safehouse.push(i)
      }
      else if (i.type === 'decker') {
        decker.push(i)
      }
      else if (i.type === 'sins') {
        sins.push(i)
      }
    }

    //Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.contact = contact;
    context.language = language;
    context.inventoryslot = inventoryslot;
    context.currency = currency;
    context.clothes = clothes;
    context.personalitems = personalitems;
    context.consumables = consumables;
    context.vehicles = vehicles;
    context.safehouse = safehouse;
    context.decker = decker;
    context.sins = sins;

  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Other rollable abilities.
    html.find('.otherroll').click(this._onOtherroll.bind(this));

    // AP Management.
    html.find('.apmod').click(this._onClickAP.bind(this));

    // AP Reset Management.
    html.find('.apreset').click(this._onClickAPReset.bind(this));

    // Automatic Reset Management.
    html.find('.autoreset').click(this._onClickAutoR.bind(this));

    // Charge Management.
    html.find('.chargemod').click(this._onClickCharge.bind(this));

    // Charge Management.
    //html.find('.manamod').click(this._onClickMana.bind(this));

    // Spell AP Management.
    html.find('.spellapmod').click(this._onClickSpellAP.bind(this));

    // Reload Management.
    html.find('.reloadsys').click(this._onClickReloadsys.bind(this));

    //Movement and other random buttons


    // Rest Management.
    html.find('.restsys').click(this._onClickRestsys.bind(this));

    // Recovery Management.
    html.find('.recoverysys').click(this._onClickRecoverysys.bind(this));

    html.find('.sneaksys').click(this._onClickSneaksys.bind(this));

    html.find('.repositionsys').click(this._onClickRepositionsys.bind(this));

    html.find('.movesys').click(this._onClickMovesys.bind(this));

    html.find('.sprintsys').click(this._onClickSprintsys.bind(this));

    html.find('.wristwatch').click(this._onClickWristwatch.bind(this));

    html.find('.simpleobject').click(this._onClickSimpleobject.bind(this));

    html.find('.complexobject').click(this._onClickComplexobject.bind(this));


    html.find('.tauntsys').click(this._onClickTauntsys.bind(this));

    html.find('.itemtest').click(this._onClickitemtest.bind(this));

    html.find('.magazinedrop').click(this._onClickMagazineDrop.bind(this));

    // Anything targetting related lmao
    html.find('.targettingtest').click(this._onClickTargettingtest.bind(this));


    html.find('.targettest').click(this._onClickTargettest.bind(this));

    html.find('.staminareset').click(this._onClickStaminaReset.bind(this));

    html.find('.vitalityreset').click(this._onClickVitalityReset.bind(this));

    html.find('.willreset').click(this._onClickWillReset.bind(this));

    html.find('.drivingroll').click(this._onDrivingroll.bind(this));

    html.find('.healingroll').click(this._onHealingroll.bind(this));

    html.find('.trickeryroll').click(this._onTrickeryroll.bind(this));

    html.find('.bushcraftroll').click(this._onBushcraftroll.bind(this));

    html.find('.psychiatryroll').click(this._onPsychiatryroll.bind(this));

    html.find('.resistinsanityroll').click(this._onResistinsanityroll.bind(this));

    html.find('.intimidationroll').click(this._onIntimidationroll.bind(this));


    //new combat manuevers

    html.find('.coupdetat').click(this._onClickCoupdetat.bind(this));

    html.find('.disarm').click(this._onClickDisarm.bind(this));

    html.find('.feint').click(this._onClickFeint.bind(this));

    html.find('.grapple').click(this._onClickGrapple.bind(this));

    html.find('.shove').click(this._onClickShove.bind(this));

    // Update load

    html.find('.updateload').click(this._onClickUpdateLoad.bind(this));


    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }


  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        const actor = this.actor;

        // Retrieve the roll prop.
        const roll = dataset.roll ?? null;

        // Pass it in a new options object argument.
        if (item) return item.roll({ roll: roll });
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {

      const itemId = element.closest('.item').dataset.itemId;
      const item = this.actor.items.get(itemId);
      const actor = this.actor;

      let label = dataset.label ? `[roll] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());


      if (actor.system.combatswitch.check == true) {
        // AP Reduction
        console.log("AP Cost - ", item.system.APcost.value);
        actor.update({ "data.ap.value": actor.system.ap.value - item.system.APcost.value });

        // Checking if weapon is automatic and an 'item'
        console.log("Checking for Automatic");
        console.log("Item Type -", item.type)
        if (item.type == 'item') {
          if (item.system.automatic.check == true) {
            item.update({ "data.APcost.value": 2 });
          };
        }
      }

      // Getting roll total
      await roll.roll({async:true})
      let roll_total = roll.total
      console.log("ROLL TEST")

      console.log(roll)
      console.log("Roll Total -", roll_total)
      console.log("Critical Range -", item.system.criticalrange)

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;

    }
  }

  async _onOtherroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';

    let roll = new Roll(dataset.roll, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  async _onDrivingroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';


    let roundedtec = Math.floor(0.5 * actor.system.TEC.value)
    let roundedrea = Math.floor(0.5 * actor.system.REA.value)
    console.log(roundedtec, roundedrea)

    let drivingskill = actor.system.skills.driving.value
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = drivingskill + roundedtec + roundedrea + circumstancedicevalue
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  async _onHealingroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';


    let roundedtec = Math.floor(0.5 * actor.system.TEC.value)
    let roundedrea = Math.floor(0.5 * actor.system.INT.value)
    console.log(roundedtec, roundedrea)

    let drivingskill = actor.system.skills.healing.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = drivingskill + roundedtec + roundedrea + circumstancedicevalue
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }


  async _onTrickeryroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';


    let roundedtec = Math.floor(0.5 * actor.system.TEC.value)
    let roundedrea = Math.floor(0.5 * actor.system.QCK.value)
    console.log(roundedtec, roundedrea)

    let drivingskill = actor.system.skills.trickery.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = drivingskill + roundedtec + roundedrea + circumstancedicevalue
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  async _onBushcraftroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';


    let roundedtec = Math.floor(0.5 * actor.system.TEC.value)
    let roundedrea = Math.floor(0.5 * actor.system.SPI.value)
    console.log(roundedtec, roundedrea)

    let drivingskill = actor.system.skills.bushcraft.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = drivingskill + roundedtec + roundedrea + circumstancedicevalue
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  async _onPsychiatryroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';


    let roundedtec = Math.floor(0.5 * actor.system.INT.value)
    let roundedrea = Math.floor(0.5 * actor.system.CLN.value)
    console.log(roundedtec, roundedrea)

    let drivingskill = actor.system.skills.psychiatry.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = drivingskill + roundedtec + roundedrea + circumstancedicevalue
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  async _onResistinsanityroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';


    let roundedtec = Math.floor(0.5 * actor.system.SPI.value)
    let roundedrea = Math.floor(0.5 * actor.system.CLN.value)
    console.log(roundedtec, roundedrea)

    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = roundedtec + roundedrea + circumstancedicevalue
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  async _onIntimidationroll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';


    let roundedtec = Math.floor(0.5 * actor.system.STR.value)
    let roundedrea = actor.system.CLN.value
    console.log(roundedtec, roundedrea)

    let circumstancedicevalue = actor.system.circumstancedice.value
    let drivingskill = actor.system.skills.intimidation.mod

    let rollformula = roundedtec + roundedrea + circumstancedicevalue + drivingskill
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  _onClickAP(event) {
    event.preventDefault()
    console.log("AP Reduction Test");
    const actor = this.actor;
    console.log("ACTOR AP -", actor.system.ap.value);
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (actor.system.ap.value < 0) {
      ui.notifications.error("Negative AP Detected: Alis may now eat your dice.");
    }

    console.log("AP COST -", item.system.APcost.value);
    actor.update({ "data.ap.value": actor.system.ap.value - item.system.APcost.value });

    console.log("Checking for Automatic");
    console.log("ITEM TYPE -", item.type)
    if (item.type == 'item') {
      if (item.system.automatic.check == true) {
        item.update({ "data.APcost.value": 2 });
      };
    }

  }

  _onClickSpellAP(event) {
    event.preventDefault()
    console.log("Spell AP Reduction Test");
    const actor = this.actor;
    console.log("ACTOR AP -", actor.system.ap.value);
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (actor.system.ap.value < 0) {
      ui.notifications.error("Negative AP Detected: Alis may now eat your dice.");
    }

    console.log("ITEM AP -", item.system.APcost.value);
    if (actor.system.combatswitch.check == true) {
      actor.update({ "data.ap.value": actor.system.ap.value - item.system.APcost.value });
    }

  }


  _onClickCharge(event) {
    event.preventDefault()
    console.log("Test")
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    console.log("CHARGES -", item.system.charges.value)

    if (item.type == 'item') {
      if (item.system.weapontype !== "Melee") {
        item.update({ "data.charges.value": item.system.charges.value - 1 })
      }
    }

    if (item.type == 'feature' && item.system.charges.max > 0) {
      item.update({ "data.charges.value": item.system.charges.value - 1 })
    }


    if (item.system.charges.value == 2) {
      ui.notifications.error("1 Charge Remaining")
    }
    if (item.system.charges.value == 1) {
      ui.notifications.error("No Charges Remaining")
    }
    /*if(item.system.charges.value == 0){
      ui.notifications.error("Negative Charges Detected: Alis may now eat your dice.")
    }*/
  }

  _onClickReloadsys(event) {
    event.preventDefault()
    console.log("Test")
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    console.log(item.system.charges.value)

    const actor = this.actor;

    if (item.type == 'item') {
      if (item.system.melee.check == false) {
        item.update({ "data.charges.value": item.system.charges.max })
        actor.update({ "data.ap.value": 0 })
      }
    }
    if (item.type == 'feature') {
      item.update({ "data.charges.value": item.system.charges.max })
    }

  }

  _onClickAPReset(event) {
    event.preventDefault()
    console.log("Resetting AP")
    const actor = this.actor;
    if (actor.system.ap.value < 0) {
      console.log("negative AP detected")
      actor.update({ "data.ap.value": actor.system.ap.max })
    }
    else {
      actor.update({ "data.ap.value": actor.system.ap.max + Math.ceil(actor.system.ap.value / 2) });
    }

  }


  _onClickAutoR(event) {
    event.preventDefault()
    console.log("Automatic Reset Test")
    const actor = this.actor;
    console.log(actor.system.ap.value);
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    console.log(item.system.automatic.check)
    if (item.system.automatic.check == true) {
      item.update({ "data.APcost.value": 4 })
    }

  }


  _onClickAutoR(event) {
    event.preventDefault()
    console.log("Automatic Reset Test")
    const actor = this.actor;
    console.log(actor.system.ap.value);
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    console.log(item.system.automatic.check)
    if (item.system.automatic.check == true) {
      item.update({ "data.APcost.value": 4 })
    }

  }


  _onClickMana(event) {
    event.preventDefault()
    console.log("Mana Reduction Test");
    const actor = this.actor;
    console.log(actor.system.ap.value);
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    console.log("Reducing Mana");
    console.log(item.system.manacost.value)
    console.log(actor.system.mana1.value)
    actor.update({ "data.mana1.value": actor.system.mana1.value - item.system.manacost.value })
  }

  _onClickRestsys(event) {
    event.preventDefault()
    console.log("Rest Testing");
    const actor = this.actor;
    const element = event.currentTarget;

    console.log("HP Resets")
    actor.update({ "data.stamina.value": actor.system.stamina.max })


    console.log("Exhaustion & Hazard Reduction")
    if (actor.system.exhaustion.value >= 1) {
      actor.update({ "data.exhaustion.value": actor.system.exhaustion.value - 1 })
    }
    if (actor.system.bloodtoxin.value >= 1) {
      actor.update({ "data.bloodtoxin.value": actor.system.bloodtoxin.value - 1 })
    }
    if (actor.system.intoxication.value == 1) {
      actor.update({ "data.intoxication.value": actor.system.intoxication.value - 1 })
    }
    if (actor.system.intoxication.value >= 2) {
      actor.update({ "data.intoxication.value": actor.system.intoxication.value - 2 })
    }

  }

  _onClickRecoverysys(event) {
    event.preventDefault()
    console.log("Recovery Testing");
    const actor = this.actor;
    const element = event.currentTarget;

    console.log("HP Resets")
    actor.update({ "data.stamina.value": actor.system.stamina.max })

    actor.update({ "data.mana1.value": actor.system.mana1.max })

    console.log("Exhaustion & Hazard Reduction")
    actor.update({ "data.exhaustion.value": 0 })
    actor.update({ "data.intoxication.value": 0 })
    actor.update({ "data.bloodtoxin.value": actor.system.bloodtoxin.value - 3 })
  }

  _onClickSneaksys(event) {
    event.preventDefault()
    console.log("Sneaking")
    const actor = this.actor;
    const sneakcost = Math.floor(actor.system.ap.max / 2)

    actor.update({ "data.ap.value": actor.system.ap.value - sneakcost })

    const element = event.currentTarget;
    const dataset = element.dataset;

    let label = dataset.label ? `[roll] ${dataset.label}` : '';
    let roll = new Roll(dataset.roll, this.actor.getRollData());

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;

  }

  _onClickRepositionsys(event) {
    event.preventDefault()
    console.log("Repositioning")
    const actor = this.actor;

    actor.update({ "data.ap.value": actor.system.ap.value - 1 })

  }

  _onClickMovesys(event) {
    event.preventDefault()
    console.log("Moving")
    const actor = this.actor;
    const movecost = Math.floor(actor.system.ap.max / 2)
    actor.update({ "data.ap.value": actor.system.ap.value - movecost })

  }

  _onClickSprintsys(event) {
    event.preventDefault()
    console.log("Sprinting")
    const actor = this.actor;
    const sprintcost = Math.floor((actor.system.ap.max / 4) * 3)
    actor.update({ "data.ap.value": actor.system.ap.value - sprintcost })
  }

  _onClickWristwatch(event) {
    event.preventDefault()
    console.log("Checking Wristwatch")
    const actor = this.actor;
    actor.update({ "data.ap.value": actor.system.ap.value - 4 })
  }

  _onClickSimpleobject(event) {
    event.preventDefault()
    console.log("Using a simple object")
    const actor = this.actor;
    actor.update({ "data.ap.value": actor.system.ap.value - 2 })
  }

  _onClickComplexobject(event) {
    event.preventDefault()
    console.log("Using a complex object")
    const actor = this.actor;
    actor.update({ "data.ap.value": 0 })
  }

  _onClickTargettingtest(event) {
    event.preventDefault()
    console.log("Targetting test")
    const actor = this.actor;
    if (canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1) {
      ui.notifications.error("Please select a single token")
      return;
    }
    let targetnpc = canvas.tokens.controlled[0].actor

    //const itemId = element.closest('.item').dataset.itemId;
    //const item = this.actor.items.get(itemId);

    console.log(targetnpc.system.dodgepercentile.percent)
    targetdodge = targetnpc.system.dodgepercentie.percent

  }

  _onClickTauntsys(event) {
    event.preventDefault()
    console.log("Taunting")
    const actor = this.actor;
    return

  }

  _onClickitemtest(event) {
    event.preventDefault()
    const actor = this.actor;
    console.log("Features -", item)

  }



  _onClickStaminaReset(event) {
    event.preventDefault()
    console.log("Resetting Stamina")
    const actor = this.actor;
    actor.update({ "data.stamina.value": actor.system.stamina.max })

  }

  _onClickVitalityReset(event) {
    event.preventDefault()
    console.log("Resetting Vitality")
    const actor = this.actor;
    if (actor.system.vitality.value < actor.system.vitality.max) {
      actor.update({ "data.vitality.value": actor.system.vitality.value + 1 })
    }
  }


  _onClickWillReset(event) {
    event.preventDefault()
    console.log("Resetting Will")
    const actor = this.actor;
    if (actor.system.willpoints.value < actor.system.willpoints.max) {
      actor.update({ "data.willpoints.value": actor.system.willpoints.value + 1 })
    }
  }

  _onClickMagazineDrop(event) {
    event.preventDefault()
    const actor = this.actor;
    console.log("DROPPING MAGAZINE")

    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    console.log("ITEM NAME -", item.name)

    if (item.name == "ES-MCR MK. IV") {
      console.log("FOUND MCR")
      let magazine = actor.items.find(i => i.name === "MCR Magazine");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING MCR")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("COMPACT CARRY -", actor.system.compactcarry1.value)
        actor.update({ "data.compactcarry1.value": actor.system.compactcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }

    if (item.name == "MustangArms Scout-III") {
      console.log("FOUND AP-RIFLE MAGAZINE")
      let magazine = actor.items.find(i => i.name === "AP-Rifle Magazine");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING AP-RIFLE")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("COMPACT CARRY -", actor.system.compactcarry1.value)
        actor.update({ "data.compactcarry1.value": actor.system.compactcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }

    if (item.name == "CA-77") {
      console.log("FOUND High Capacity Handgun Magazine")
      let magazine = actor.items.find(i => i.name === "High Capacity Handgun Magazine");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING High Capacity Handgun Magazine")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("Small CARRY -", actor.system.smallcarry1.value)
        actor.update({ "data.smallcarry1.value": actor.system.smallcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }

    if (item.name == "MustangArms Tri-B Heavy Cannon MK. II") {
      console.log("FOUND Heavy Cannon Magazine")
      let magazine = actor.items.find(i => i.name === "Heavy Cannon Magazine");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING Heavy Cannon Magazine")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("Medium  CARRY -", actor.system.mediumcarry1.value)
        actor.update({ "data.mediumcarry1.value": actor.system.mediumcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }

    if (item.name == "Glock 22") {
      console.log("FOUND Glock 22")
      let magazine = actor.items.find(i => i.name === "Glock Magazine");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING Glock Magazine")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("Small CARRY -", actor.system.smallcarry1.value)
        actor.update({ "data.smallcarry1.value": actor.system.smallcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }

    if (item.name == "Energy Pistol") {
      console.log("FOUND Juicebox")
      let magazine = actor.items.find(i => i.name === "Pistol Juicebox");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING Juicebox")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("Small CARRY -", actor.system.smallcarry1.value)
        actor.update({ "data.smallcarry1.value": actor.system.smallcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }

    if (item.name == "Gearlock Shotgun") {
      console.log("FOUND Shellcase")
      let magazine = actor.items.find(i => i.name === "Shell Case");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING Shell Case")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("Small CARRY -", actor.system.smallcarry1.value)
        actor.update({ "data.smallcarry1.value": actor.system.smallcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }

    if (item.name == "Gearlock Revolver") {
      console.log("FOUND Cylinder")
      let magazine = actor.items.find(i => i.name === "Spare Cylinder");

      if (magazine === null) return

      if (magazine.system.quantity < 1) {

        ui.notifications.warn(actor.name + ` does not have enough magazines remaining.`);
      } else {
        console.log("DROPPING Shell Case")
        magazine.update({ "data.quantity": magazine.system.quantity - 1 })
        console.log("Small CARRY -", actor.system.smallcarry1.value)
        actor.update({ "data.smallcarry1.value": actor.system.smallcarry1.value - 1 })
        if (item.type == 'item') {
          if (item.system.melee.check == false) {
            item.update({ "data.charges.value": item.system.charges.max })
            actor.update({ "data.ap.value": actor.system.ap.value - (item.system.APcost.value + 2) })
          }
        }
      }

    }



  }


  _onClickCoupdetat(event) {
    event.preventDefault()
    console.log("Coup d'Etat")
    const actor = this.actor;
    actor.update({ "data.ap.value": 0 })
  }

  _onClickDisarm(event) {
    event.preventDefault()
    console.log("Disarm")
    const actor = this.actor;
    actor.update({ "data.ap.value": actor.system.ap.value - 3 })

    let quicknesstemp = actor.system.abilities.QCK.value
    let palmingskill = actor.system.skills.palming.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = circumstancedicevalue + palmingskill + quicknesstemp
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: "Disarm",
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;
  }

  _onClickFeint(event) {
    event.preventDefault()
    console.log("Disarm")
    const actor = this.actor;
    actor.update({ "data.ap.value": actor.system.ap.value - 1 })

    let quicknesstemp = actor.system.abilities.QCK.value
    let palmingskill = actor.system.skills.gymnastics.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = circumstancedicevalue + palmingskill + quicknesstemp
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: "Gymnastics",
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;
  }

  _onClickGrapple(event) {
    event.preventDefault()
    console.log("Disarm")
    const actor = this.actor;
    actor.update({ "data.ap.value": actor.system.ap.value - 3 })

    let quicknesstemp = actor.system.abilities.STR.value
    let palmingskill = actor.system.skills.force.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = circumstancedicevalue + palmingskill + quicknesstemp
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: "Grapple",
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;
  }

  _onClickShove(event) {
    event.preventDefault()
    console.log("Disarm")
    const actor = this.actor;
    actor.update({ "data.ap.value": actor.system.ap.value - 2 })

    let quicknesstemp = actor.system.abilities.STR.value
    let palmingskill = actor.system.skills.force.mod
    let circumstancedicevalue = actor.system.circumstancedice.value

    let rollformula = circumstancedicevalue + palmingskill + quicknesstemp
    console.log("ROLL FORMULA", rollformula)
    rollformula = rollformula + 'd6x6cs>3'

    let roll = new Roll(rollformula, this.actor.getRollData());
    console.log(roll)
    console.log("CIRCUMSTANCE DICE -", actor.system.circumstancedice.value)

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: "Shove",
      rollMode: game.settings.get('core', 'rollMode'),
    });
    return roll;
  }


  _onClickTargettest(event) {
    event.preventDefault()
    const actor = this.actor;

    Hook.once("userTargetID", async function () {
      console.log(userTargetID)

    });


  }

  _onClickUpdateLoad(event) {
    event.preventDefault();
    const actor = this.actor;
    let total = 0;
    for (let item of actor.items) {
      total += item.system.weight ?? 0;
    }
    actor.update({"data.currentload.value": total});
  }

}