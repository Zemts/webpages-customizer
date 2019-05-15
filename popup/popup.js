var THEME_PATTERN = /[a-z0-9\-]+(?=\.min\.css$)/;

var externalTheme = document.getElementById('js__theme-css');
var decreaseFont = document.getElementById('js__decrease');
var increaseFont = document.getElementById('js__increase');
var runAt = document.getElementById('js__run-at');
var saveButton = document.getElementById('js__save');
var themeSelector = document.getElementById('js__theme');
var urlField = document.getElementById('js__url');
var userCode = document.getElementById("js__user-code");

var codeMirror;
var config = {
    'code': '',
    'editorTheme': '',
    'fontSize': '',
    'runAt': ''
};


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
        // check/insert current user script
        chrome.storage.sync.get(null, function(data){
            initializeConfig(config, data[tab.url]);
            codeMirror = CodeMirror(userCode, {
                lineNumbers: true,
                mode: 'javascript',
                scrollbarStyle: 'simple',
                value: config.code
            });
            codeMirror.setSize('100%', '100%');
            // set settings
            userCode.style.fontSize = config.fontSize;
            themeSelector.value = config.editorTheme;
            updateEditorTheme.call({ value: config.editorTheme });
            runAt.value = config.runAt;
        });
    }
);

decreaseFont.addEventListener('click', function(ev){
    var wish = parseInt(userCode.style.fontSize) - 1;
    userCode.style.fontSize = ((wish !== wish || wish < 6) ? 6 : wish) + 'px';
    codeMirror.refresh();
    // update config
    config.fontSize = userCode.style.fontSize;
});
increaseFont.addEventListener('click', function(ev){
    var wish = parseInt(userCode.style.fontSize) + 1;
    userCode.style.fontSize = ((wish > 40) ? 40 : wish) + 'px';
    codeMirror.refresh();
    // update config
    config.fontSize = userCode.style.fontSize;
});
runAt.addEventListener('change', function(ev){
    config.runAt = this.value;
})
saveButton.addEventListener('click', function(ev){
    config.code = codeMirror.getValue();
    chrome.storage.sync.set({
        [urlField.value]: config
    });
});
themeSelector.addEventListener('change', updateEditorTheme);

function getPopupSize(height, width){
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
function initializeConfig(state, params){
    if(!params){
        params = {};
    }
    state.code = params.code || '';
    state.fontSize = params.fontSize || '12px';
    state.editorTheme = params.editorTheme || 'mdn-like';
    state.runAt = params.runAt || 'document_idle';
}
function updateEditorTheme(ev){
    externalTheme.href = externalTheme.href.replace(THEME_PATTERN, this.value.replace(/([a-z0-9-]+) .*/, "$1"));
    codeMirror.setOption("theme", this.value);
    // update config
    config.editorTheme = this.value;
}

/*chrome.storage.sync.get(null, function(data){
    var keys = Object.keys(data);
    chrome.storage.sync.getBytesInUse(keys, function(bytes){
        list.innerHTML = bytes;
    });
});*/