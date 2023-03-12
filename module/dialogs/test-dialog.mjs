/**
 * Extends the base application
 * @extends {Application}
 */
export class TestDialog extends Application {
    /**
     * 
     * @param {*} data 
     * @param {*} options
     * @param {string} data.base - The default base value 
     * @param {string} data.rank - The default rank value
     * @param {string} data.modifiers - The default modifiers
     * @param {string} data.name - The name of the object being rolled
     * @param {WastehunterActor} data.actor - The actor
     * @param {WastehunterItem} data.item - The item
     */
    constructor(data={}, options={}) {
        super(options);

        this._testData.actor = data.actor;
        this._testData.item = data.item;
        this._testData.base = this._defaultTestData.base = data.base ?? "0";
        this._testData.rank = this._defaultTestData.rank = data.rank ?? "0";
        this._testData.circumstancedice = this._defaultTestData.circumstancedice = data.actor.system.circumstancedice ?? "0";
        this._testData.modifiers = this._defaultTestData.modifiers = data.modifiers ?? "0";
        this._testData.name = data.name ?? "Name"; 
    }

    /**
     * Returns the Window Title
     * @returns {string}
     */
    get title() {
        return this._testData.name;
    }

    /**
     * Retrieves data used in rendering the dialog
     * @param {} options 
     * @returns {Object}
     * 
     */
    getData(options={}) {
        return this._testData;
    }

    /**
     * Activate HTML Event listeners
     * @param {JQuery} html
     */
    activateListeners(html) {

    }

    /**
     * @private
     * Handles clicks to the "Roll" button
     * @param {MouseEvent} event
     */
    async _onClickRoll(event) {

    }

    /**
     * @private
     * Handles clicks to the "Reset to Default" button
     * @param {MouseEvent} event
     */
    async _onClickReset(event) {
        this._testData.base = this._defaultTestData.base;
        this._testData.rank = this._defaultTestData.rank;
        this._testData.modifiers = this._defaultTestData.modifiers;
    }
}