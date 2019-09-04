tam = {};

tam.Sudoku = fabric.util.createClass(fabric.Observable, {
    initialize: function() {
        // todo
        // not used so far
    }
});

tam.Game = fabric.util.createClass(fabric.Observable, {
    initialize: function() {
        this.canvas = new fabric.Canvas('canvas', {
            backgroundColor: 'rgb(20,80,80)'
        });
        this.board = null;
        tam.canvas = this.canvas; // ideg

        // playing on board
        this.board = new tam.Board({canvas: this.canvas});
        tam.board = this.board; // ideg

        // handling keyboard events
        var keyboard = new tam.Keyboard();
        var userEvents = ['moves', 'jumps', 'typesValue', 'typesNote', 'cleares',
                          'togglesFix', 'restarts', 'undo', 'redo', 'control'];
        var keyboardHandler = this.onKeyboardEvent.bind(this);
        userEvents.map( (name) => keyboard.on('user:'+name, keyboardHandler), this );
    },

    onKeyboardEvent: function(event) {

        if (event.name != 'user:undo' && event.name != 'user:redo') { 
            this.board.saveStateToHistory();
        }

        switch (event.name) {
            case 'user:moves':
                this.board.userMoves(event.dir);
                break;
            case 'user:jumps':
                this.board.userJumps(event.whereto);
                break;
            case 'user:cleares':
                this.board.userCleares();
                break;
            case 'user:typesValue':
                this.board.userTypesValue(event.num);
                break;
            case 'user:typesNote':
                this.board.userTypesNote(event.num);
                break;
            case 'user:undo':
                this.board.restoreStateUndo();
                break;
            case 'user:redo':
                this.board.restoreStateRedo();
                break;
            case 'user:restarts':
                this.board.userRestarts();
                break;
            case 'user:togglesFix':
                this.board.userTogglesFix();
                break;
            case 'user:control':
                this.board.userRequestsHighlight();
                break;
        };
        
        // update ui elements
        this.board.render();
        
        // render it to the canves
        this.canvas.renderAll();
    },
    
});

window.onload = function() {
    tam.firstGame = new tam.Game();

};

