

$(document).ready(function () {
    const cmOptions = {
        theme: "dracula",
        viewportMargin: Infinity,
        mode: {
            name: "javascript",
            json: true
        },
        lineNumbers: true,
        lineWrapping: true,
        scrollbarStyle: "simple",

        extraKeys: {
            "Ctrl-F": function (ed) {
                var content = ed.getValue();
                var jsonContent = JSON.parse(content);
                ed.setValue(JSON.stringify(jsonContent, null, 2));

            }
        }

    };
    var odeditor = CodeMirror.fromTextArea(document.getElementById("odeditor"), cmOptions);
    var cjeditor = CodeMirror.fromTextArea(document.getElementById("cjeditor"), cmOptions);
    var sseditor = CodeMirror.fromTextArea(document.getElementById("sseditor"), cmOptions);
    var sdeditor = CodeMirror.fromTextArea(document.getElementById("sdeditor"), cmOptions);
    var stheditor = CodeMirror.fromTextArea(document.getElementById("stheditor"), cmOptions);
    var sha256editor = CodeMirror.fromTextArea(document.getElementById("sha256editor"), cmOptions);
    var dtseditor = CodeMirror.fromTextArea(document.getElementById("dtseditor"), cmOptions);
    var reseditor = CodeMirror.fromTextArea(document.getElementById("reseditor"), cmOptions);

    $("#getCerts").on("click", function () {
        SignerDemtra.getCerts({ action: "getCerts" }).then(function (res) {
            var r = JSON.parse(res.result);
            if (res.isValid) {
                setCerts(r.Tokens)
            } else {
                alert(r.Error);
            }
            
        }
        );
    });
    $("#hashbtn").on("click", function () {
        let strToHash = stheditor.getValue();
        digestMessage(strToHash).then(function (h) {
            sha256editor.setValue(h);
        });

    });
    $("#gobtn").on("click", function () {
        var tokenSerial = $("#tokens option:selected").val();
        var tokenPin = $("#tokenPin").val();
        var originalDocument = odeditor.getValue();

        SignerDemtra.signJson({ action: "Sign", tokenSerial: tokenSerial, tokenPin: tokenPin, originalDocument: originalDocument }).then(function (res) {
            var r = JSON.parse(res.result);
            if (res.isValid) {
                var sD = JSON.parse(r.DocumentToSend);
                cjeditor.setValue(r.CanonicalJson);
                sseditor.setValue(sD.documents[0].signatures[0].value);
                sdeditor.setValue(r.DocumentToSend);
            } else {
                alert(r.Error);
            }

        }
        );
    });
    $("#sendbtn").on("click", function () {
        var clientId = $("#clientId").val();
        var clientSecret = $("#clientSecret").val();
        var documentToSend = dtseditor.getValue();

        SignerDemtra.sendDocument({ action: "Send", clientId: clientId, clientSecret: clientSecret, documentToSend: documentToSend }).then(function (res) {
            var r = JSON.parse(res.result);
            if (res.isValid) {
                var pr = JSON.parse(r.Response);
                reseditor.setValue(JSON.stringify(pr, null, 2));
              
            } else {
                alert(r.Error);
            }

        }
        );
    });
});
function setCerts(tokens) {
    let options = '';
    let selects = $("#tokens");
    for (var i = 0; i < tokens.length; i++) {
        options += `<option value="${tokens[i].SerialNumber}">${tokens[i].Label} ${tokens[i].SerialNumber}</option>`;
    }
    selects.html(options);
}
async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}