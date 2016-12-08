var canvasUtil = {
    foo: function(elementId) {
        var el = document.getElementById(elementId),
            ctx;

        if (!el) {
            return;
        }
        ctx = el.getContext("2d");
        ctx.font = "30px Verdana";
        // Create gradient
        var gradient = ctx.createLinearGradient(0, 0, el.width, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "red");
        // Fill with gradient
        ctx.strokeStyle = gradient;
        ctx.strokeText("Nate", 10, 50);
    },
    fillStyle_color: function(elementId) {
        var el = document.getElementById(elementId),
            ctx;

        if (!el) {
            return;
        }
        ctx = el.getContext("2d");

        ctx.fillStyle = "#0000ff";
        ctx.fillRect(20, 20, 150, 100);
    }
};
