/* -------------------------------------------------------------------------- */
/*                                  functions                                 */
/* -------------------------------------------------------------------------- */

function dec_to_bin(nr) {
    res = ["0", "0", "0", "0", "0", "0"];
    [32, 16, 8, 4, 2, 1].forEach(function (pos, index) {
        if (nr >= pos) {
            nr -= pos;
            res[index] = "1";
        }
    });
    return res.join("");
}

function set_by_id(id, content, animate = true) {
    target = document.getElementById(id);
    if (target.innerText == content) {
        return;
    }

    if (animate) {
        var needChange = [];
        for (var index = 0; index < content.length; index++) {
            if (!(content[index] == target.innerText[index])) {
                needChange.push({
                    target: document.querySelector(
                        `#${id} :nth-child(${index + 1})`
                    ),
                    content: content[index],
                });
            }
        }

        needChange.forEach(function (data) {
            data.target.classList.add("transparent");

            setTimeout(
                function (data) {
                    data.target.innerText = data.content;
                    data.target.classList.remove("transparent");
                },
                270,
                data
            );
        });
    } else {
        target.innerText = content;
    }
}

function manipulate_url(param, value) {
    var url = new URL(window.location);

    if (value == null) {
        url.searchParams.delete(param);
    } else {
        url.searchParams.set(param, value);
    }

    window.history.replaceState(
        {
            additionalInformation:
                "This is a custom share URL from PaddeCraft/clock.",
        },
        "Clock",
        url
    );
}

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const params = Object.fromEntries(new URLSearchParams(window.location.search));

const settings = new Knobs({
    visible: 0,
    CSSVarTarget: document.body,
    knobs: [
        "Background Settings",
        {
            cssVar: ["color1"],
            label: "Color 1",
            type: "color",
            value: params["c1"] ? params["c1"] : "#3D3D3D",
            defaultValue: "#3D3D3D",
            onChange: function (x, y, z) {
                manipulate_url("c1", y.value);
            },
        },
        {
            cssVar: ["color2"],
            label: "Color 2",
            type: "color",
            value: params["c1"] ? params["c2"] : "#000",
            defaultValue: "#000",
            onChange: function (x, y, z) {
                manipulate_url("c2", y.value);
            },
        },
        {
            label: "Color Presets",
            type: "select",
            options: ["Default", "Combo 1", "Combo 2"],
            onChange: function (_, y) {
                const name = y.value;
                var [color1, color2] = ["#fff", "#fff"];

                if (name == "Default") {
                    color1 = "#3D3D3D";
                    color2 = "#000";
                } else if (name == "Combo 1") {
                    color1 = "#3FFFDF";
                    color2 = "#FF00B3";
                } else if (name == "Combo 2") {
                    color1 = "#37007A";
                    color2 = "#C8149E";
                }

                manipulate_url("cpre", name);

                document.body.style.setProperty("--color1", color1);
                document.body.style.setProperty("--color2", color2);

                // TODO: Better way to fix this
                manipulate_url("c1", color1);
                manipulate_url("c2", color2);
            },
            defaultValue: "Default",
            value: params["cpre"] ? params["cpre"] : "Default",
        },
        {
            cssVar: ["rotation", "deg"],
            label: "Rotation",
            type: "range",
            min: 0,
            max: 359,
            defaultValue: "30",
            value: params["crot"] ? params["crot"] : "30",
            onChange: function (x, y, z) {
                manipulate_url("crot", y.value);
            },
        },
        "Countdown Settings",
        {
            label: "Enable Countdown",
            type: "checkbox",
            onChange: function (x, y, z) {
                window.countdown = y.checked;

                manipulate_url("cntdon", y.checked.toString());
            },
            checked: params["cntdon"] ? params["cntdon"] === "true" : false,
        },
        {
            label: "End",
            render:
                '<input type="datetime-local" class="countdown-end" value="' +
                (params["cntdend"] ? params["cntdend"] : "2000-01-01T00:00") +
                '" />',
            script(knobs, name) {
                window.countdown_end_picker = document
                    .querySelector("iframe.knobsIframe")
                    .contentDocument.querySelector(
                        "input[type=datetime-local].countdown-end"
                    );

                countdown_end_picker.addEventListener("keyup", function () {
                    manipulate_url("cntdend", countdown_end_picker.value);
                });
            },
        },
    ],
});

/* -------------------------------------------------------------------------- */
/*                                  Main loop                                 */
/* -------------------------------------------------------------------------- */

function main() {
    var date = new Date();
    if (window.countdown) {
        var remaining =
            new Date(window.countdown_end_picker.value).getTime() -
            date.getTime();

        var countdown_finished = remaining <= 0;

        if (remaining > 0) {
            var date = new Date(remaining);
            date.setHours(date.getHours() - 1);
        } else {
            var date = new Date(0, 0, 0, 0, 0);
        }
    }
    var [ms, seconds, minutes, hours] = [
        date.getMilliseconds().toString().padStart(3, "0"),
        date.getSeconds().toString(),
        date.getMinutes().toString(),
        date.getHours().toString(),
    ];

    set_by_id("dec-seconds-nr", seconds.padStart(2, "0"));
    set_by_id("dec-ms", ms.slice(0, 1), false);
    set_by_id(
        "dec-main",
        hours.padStart(2, "0") +
            (countdown_finished
                ? ":"
                : parseInt(seconds) % 2 == 0
                ? " "
                : ":") +
            minutes.padStart(2, "0")
    );

    set_by_id("bin-hours", dec_to_bin(parseInt(hours)));
    set_by_id("bin-minutes", dec_to_bin(parseInt(minutes)));
}

setInterval(main, 5);
