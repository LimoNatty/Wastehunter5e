/**
 * Extends the base Dialog application
 * @extends {Dialog}
 */
export class TestDialog extends Application {
    constructor(data={}, options={}) {
        super(options);

        this._testData = data;
        this._defaultTestData = data;
    }

    /**
     * Returns the Window Title
     */
    get title() {
        return "Name";
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
    _onClickRoll(event) {

    }

    /**
     * @private
     * Handles clicks to the "Reset to Default" button
     * @param {MouseEvent} event
     */
    _onClickReset(event) {
        this._testData = this._defaultTestData;
    }
}