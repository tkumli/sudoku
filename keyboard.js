tam.Keyboard = fabric.util.createClass(fabric.Observable, {
    initialize: function() {
        this.capslock = false;
        document.body.addEventListener('keydown', this);
        document.body.addEventListener('keyup', this);
    },

    handleEvent: function(event) {
        // caps lock
        if (event.code == "CapsLock") {
            let pressed = event.type=='keydown';
            this.capslock = pressed;
            this.trigger('user:capslock', {pressed: pressed});
            return;
        }
        // keydown
        if (event.type == "keydown") {
            this.handleKeydown(event);
        }
    },

    handleKeydown: function(event) {
        var keyMap = {
            "ArrowRight": ['user:moves', {dir: "right"}],
            "shift-ArrowRight": ['user:jumps', {whereto: 'right'}],
            "ArrowLeft": ['user:moves', {dir: "left"}],
            "shift-ArrowLeft": ['user:jumps', {whereto: 'left'}],
            "ArrowUp": ['user:moves', {dir: "up"}],
            "shift-ArrowUp": ['user:jumps', {whereto: 'top'}],
            "ArrowDown": ['user:moves', {dir: "down"}],
            "shift-ArrowDown": ['user:jumps', {whereto: 'bottom'}],
            "Escape": ['user:escapes', {}],
            "Backspace": ['user:cleares', {}],
            "Delete": ['user:cleares', {}],
            "PageUp": ['user:undo', {}],
            "PageDown": ['user:redo', {}],
            "shift-Delete": ['user:restarts', {}],
            "Space": ['user:cleares', {}],
            "Numpad0": ['user:togglesFix', {}],
            "ControlLeft": ['user:control', {}]
        };
        for (let k = 1; k <= 9; k++) {
            keyMap["Digit" + k] = ['user:typesValue', {num: k}];
            keyMap["shift-Digit" + k] = ['user:typesNote', {num: k}];
            keyMap["Numpad" + k] = ['user:typesValue', {num: k}];
            keyMap["shift-Numpad" + k] = ['user:typesNote', {num: k}];
        }

        var key = (event.shiftKey ? "shift-" : "") + event.code;
        if (keyMap[key]) {
            event.preventDefault();
            var [eventName, eventParams] = keyMap[key];
            if (this.capslock && (eventName == "user:typesValue")) {
                eventName = 'user:typesNote';
            }
            eventParams.type = "keyboard";
            eventParams.name = eventName;
            this.trigger(eventName, eventParams);
        }

    }
});

/*

      ArrowRight  ->   moves
shift ArrowRight  ->   jumps

shift Digit $Num  ->   notes $Num
caps  Digit $Num  ->   notes $Num
      Digit $Num  ->   value $Num

*/


