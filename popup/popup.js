var externalTheme = document.getElementById('js__theme-css');
var decreaseFont = document.getElementById('js__decrease');
var increaseFont = document.getElementById('js__increase');
var saveButton = document.getElementById('js__save');
var themeSelector = document.getElementById('js__theme');
var urlField = document.getElementById('js__url');
var userCode = document.getElementById("js__user-code");

var codeMirror;
var startTheme = 'mdn-like';
var themePattern = /[a-z0-9\-]+(?=\.min\.css$)/;

CodeMirror.commands.save = function(){
    saveButton.click();
};

chrome.tabs.query(
    {
        active: true,
        currentWindow: true
    },
    function(tab){
        // get/use url
        tab = tab[0];
        urlField.value = tab.url;
        // set size of popup
        var sizes = getPopupSize(tab.height, tab.width);
        document.body.style.height = sizes.height + 'px';
        document.body.style.width = sizes.width + 'px';
        // set font size
        userCode.style.fontSize = '12px';
        // set start theme
        themeSelector.value = startTheme;
        // check/insert current user script
        chrome.storage.sync.get(null, function(data){
            var code = "";
            if(data[tab.url]){
                code = data[tab.url];
            }
            codeMirror = CodeMirror(userCode, {
                lineNumbers: true,
                mode: 'javascript',
                scrollbarStyle: 'simple',
                theme: startTheme,
                value: code
            });
            codeMirror.setSize('100%', '100%');
        });
    }
);

decreaseFont.addEventListener('click', function(ev){
    var wish = parseInt(userCode.style.fontSize) - 1;
    userCode.style.fontSize = ((wish !== wish || wish < 6) ? 6 : wish) + 'px';
    codeMirror.refresh();
});
increaseFont.addEventListener('click', function(ev){
    var wish = parseInt(userCode.style.fontSize) + 1;
    userCode.style.fontSize = ((wish > 40) ? 40 : wish) + 'px';
    codeMirror.refresh();
});
saveButton.addEventListener('click', function(ev){
    chrome.storage.sync.set({
        [urlField.value]: codeMirror.getValue()
    });
});
themeSelector.addEventListener('change', function(ev){
    externalTheme.href = externalTheme.href.replace(themePattern, this.value.replace(/([a-z0-9-]+) .*/, "$1"));
    codeMirror.setOption("theme", this.value);
});

function getPopupSize(height, width){
    console.log(height, width);
    var MAX_H = 600;
    var MAX_W = 800;
    var MIN_H = 300;
    var MIN_W = 400;
    var calcH = height / 3 * 2;
    var calcW = width / 2;
    return {
        height: (calcH > MAX_H) ? MAX_H :
                (calcH > MIN_H) ? calcH : MIN_H,
        width:  (calcW > MAX_W) ? MAX_W :
                (calcW > MIN_W) ? calcW : MIN_W
    };

}

/*chrome.storage.sync.get(null, function(data){
    var keys = Object.keys(data);
    chrome.storage.sync.getBytesInUse(keys, function(bytes){
        list.innerHTML = bytes;
    });
});*/