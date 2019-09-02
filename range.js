tam.Range = fabric.util.createClass({
    initialize: function() {
        this.type = null;
        this.tiles = [];
        this.highlighted = false;
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
        this.render();
    },

    highlightOff: function() {
        this.highlighted = false;
        this.render();
    },

    render: function() {
        for (let key in this.tiles) { this.tiles[key].render(); }
    }

});
