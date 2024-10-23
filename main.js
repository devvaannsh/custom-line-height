/*global define, brackets, $ */
// Simple extension that lets you change line height from the View menu
define(function (require, exports, module) {
    "use strict";
    
    const AppInit = brackets.getModule("utils/AppInit"),
        DefaultDialogs = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager");

    // Store user's last used value, defaulting to 1.5 since that's usually good for readability
    const prefs = PreferencesManager.getExtensionPrefs("lineHeight");
    prefs.definePreference("lastValue", "number", 1.5);
    
    // Function to apply line height to all editors
    function applyLineHeightToAllEditors(lineHeight) {
        // Update all existing CodeMirror instances
        $(".CodeMirror").css({
            "line-height": lineHeight
        });
        
        // Force refresh all editors
        EditorManager.getActiveEditor()?.refresh();
    }

    // Main function that handles the line height dialog and changes
    function handleLineHeight() {
        const lastValue = prefs.get("lastValue");
        
        const dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            "Set Line Height",
            `<div style="margin-bottom: 15px;">
                <label for="lineHeightInput">Enter Line Height (0.5 to 8):</label>
                <input 
                    type="number" 
                    id="lineHeightInput" 
                    min="0.5" 
                    max="8" 
                    step="0.1" 
                    value="${lastValue}" 
                    style="width: 100%; margin-top: 10px;" 
                    required 
                />
            </div>
            <div style="font-size: 12px; color: #666;">
                Quick Tips:<br>
                • Press Shift + L + H to open this dialog<br>
                • Default line height is 1.5<br>
                • Values between 1.2 and 1.8 are recommended for readability
            </div>`,
            [
                {
                    className: Dialogs.DIALOG_BTN_CLASS_PRIMARY,
                    id: Dialogs.DIALOG_BTN_OK,
                    text: "OK"
                },
                {
                    className: Dialogs.DIALOG_BTN_CLASS_NORMAL,
                    id: Dialogs.DIALOG_BTN_CANCEL,
                    text: "Cancel"
                }
            ]
        );

        dialog.getElement().on('shown', function () {
            dialog.getElement().find("#lineHeightInput").focus().select();
        });

        dialog.done(function (buttonId) {
            if (buttonId === Dialogs.DIALOG_BTN_OK) {
                const inputElement = dialog.getElement().find("#lineHeightInput");
                const inputValue = inputElement.val();
                
                const lineHeightValue = parseFloat(inputValue);
                
                if (!isNaN(lineHeightValue) && lineHeightValue >= 0.5 && lineHeightValue <= 8) {
                    // Save the value in preferences
                    prefs.set("lastValue", lineHeightValue);
                    
                    // Apply to all editors
                    applyLineHeightToAllEditors(lineHeightValue);
                    
                    console.log(`Line height set to ${lineHeightValue}`);
                } else {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_ERROR,
                        "Error",
                        "Please enter a valid number between 0.5 and 8."
                    );
                }
            }
        });
    }

    // Hook everything up to Phoenix Code
    const MY_COMMAND_ID = "lineheight.set";
    CommandManager.register("Line Height", MY_COMMAND_ID, handleLineHeight);

    // Put it in the View menu since it's display-related
    const menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
    menu.addMenuItem(MY_COMMAND_ID);
    
    // Quick keyboard shortcut to save some clicks
    KeyBindingManager.addBinding(MY_COMMAND_ID, {key: "Shift-L-H"});

    // Get everything ready when Phoenix Code starts
    AppInit.appReady(function () {
        console.log("Line Height Extension loaded.");
        
        // Restore their last used line height setting
        const lastValue = prefs.get("lastValue");
        if (lastValue) {
            applyLineHeightToAllEditors(lastValue);
        }
        
        // Listen for new editor creation to apply line height
        EditorManager.on("activeEditorChange", function () {
            const lastValue = prefs.get("lastValue");
            if (lastValue) {
                applyLineHeightToAllEditors(lastValue);
            }
        });
    });
});