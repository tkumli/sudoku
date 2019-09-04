tam.Range = fabric.util.createClass({
    initialize: function() {
        this.type = null;
        this.tiles = [];
        this.highlighted = false;
    },

    clearNoteOnTiles: function(note) {
        this.tiles.forEach( tile => tile.clearNote(note) );
    },

    setType: function(type) {
        this.type = type;
    },

    addTile: function(tile) {
        this.tiles.push(tile);
        tile.addRange(this);
    },

    highlightOn: function() {
        this.highlighted = true;
    },

    highlightOff: function() {
        this.highlighted = false;
    }

});
