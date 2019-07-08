// 'https://unpkg.com/react@16/umd/react.production.min.js'
// 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js'
// 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.js'

// checkbox: https://codepen.io/andreasstorm/pen/deRvMy

var Config = function(conf){
    if(!conf){
        conf = {};
    }
    this.code = conf.code || DEFAULT_CONFIG.code;
    this.editorTheme = conf.editorTheme || DEFAULT_CONFIG.editorTheme;
    this.fontSize = conf.fontSize || DEFAULT_CONFIG.fontSize;
    this.runAt = conf.runAt || DEFAULT_CONFIG.runAt;
    this.transpiled = conf.transpiled || DEFAULT_CONFIG.transpiled;
    this.withReact = conf.withReact || DEFAULT_CONFIG.withReact;
};
var DEFAULT_CONFIG = {
    'code' : '',
    'editorTheme': 'mdn-like',
    'fontSize': '12px',
    'runAt': 'document_idle',
    'transpiled': '',
    'withReact' : false
};
var BABEL_ES2015_PRESETS = { presets: ['es2015'] };
var BABEL_REACT_PRESETS = { presets: ['react'] };
var THEME_PATTERN = /[a-z0-9\-]+(?=\.min\.css$)/;
var URL_STUB = document.createElement('a');

var externalTheme = document.getElementById('js_theme-css');
var decreaseFont = document.getElementById('js_decrease');
var increaseFont = document.getElementById('js_increase');
var runAt = document.getElementById('js_run-at');
var saveButton = document.getElementById('js_save');
var editorTheme = document.getElementById('js_theme');
var urlField = document.getElementById('js_url-path');
var userCode = document.getElementById("js_user-code");
var withReact = document.getElementById("js_use-react");


var codeMirror = CodeMirror(userCode, {
    lineNumbers: true,
    mode: 'javascript',
    scrollbarStyle: 'simple',
    value: ''
});
var config = {};
var url_throttle = null;

CodeMirror.commands.save = function(){ // "ctrl + s" behaviour
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
        URL_STUB.href = tab.url;
        urlField.innerHTML = URL_STUB.origin;
        // set size of popup
        var sizes = getPopupSize(tab.height, tab.width);
        document.body.style.height = sizes.height + 'px';
        document.body.style.width = sizes.width + 'px';
        // check/insert current user script
        chrome.storage.sync.get(null, function(data){
            applyUserData(data[URL_STUB.origin]);
            //console.log(config);
        });
    }
);

decreaseFont.addEventListener('click', function(ev){
    var wish = parseInt(userCode.style.fontSize) - 1;
    userCode.style.fontSize = ((wish !== wish || wish < 6) ? 6 : wish) + 'px';
    codeMirror.refresh();
    config.fontSize = userCode.style.fontSize; // update config state
});
editorTheme.addEventListener('change', function(ev){
    var value = getValueFromForm(this);
    if(value){
        externalTheme.href = externalTheme.href.replace(THEME_PATTERN, value.replace(/([a-z0-9-]+) .*/, "$1"));
        config.editorTheme = value;
        codeMirror.setOption("theme", value);
    }
});
increaseFont.addEventListener('click', function(ev){
    var wish = parseInt(userCode.style.fontSize) + 1;
    userCode.style.fontSize = ((wish > 40) ? 40 : wish) + 'px';
    codeMirror.refresh();
    config.fontSize = userCode.style.fontSize; // update config state
});
runAt.addEventListener('change', function(ev){
    var value = getValueFromForm(this);
    if(value){
        config.runAt = value;
    }
});
saveButton.addEventListener('click', function(ev){
    var code = codeMirror.getValue();
    var transformed = config.withReact
        ? Babel.transform(code, BABEL_REACT_PRESETS)
        : Babel.transform(code, BABEL_ES2015_PRESETS);
    var transpiled = Babel.transformFromAst(
        transformed.ast,
        transformed.code,
        BABEL_ES2015_PRESETS
    ).code;

    config.code = code;
    config.transpiled = transpiled;

    // console.log(config);
    chrome.storage.sync.set({
        [urlField.innerHTML]: config // save config state
    });
});
withReact.addEventListener('change', function(ev){
    config.withReact = ev.target.checked;
});

function applyUserData(data){
    // update config
    config = new Config(data);
    // set html
    userCode.style.fontSize = config.fontSize;
    setRadioInFormByValue(editorTheme, config.editorTheme);
    setRadioInFormByValue(runAt, config.runAt);
    withReact.checked = config.withReact;
    // set code mirror options
    codeMirror.setOption('value', config.code);
    codeMirror.setOption('theme', config.editorTheme);
    codeMirror.setSize('100%', '100%');
    codeMirror.refresh();
}
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
function getValueFromForm(form){
    var checked = Array.prototype.filter.call(form.getElementsByTagName('input'), function(item){
        return item.checked;
    })[0];
    return checked && checked.value;
}
function setRadioInFormByValue(form, value){
    Array.prototype.forEach.call(form.getElementsByTagName('input'), function(item){
        if(item.value === value){
            //item.checked = true; // this call doesn't spawn 'change' event
            item.click(); // this call spawns 'change' event in form
        }
    });
}

/*chrome.storage.sync.get(null, function(data){
    var keys = Object.keys(data);
    console.log(keys);
    chrome.storage.sync.getBytesInUse(keys, function(bytes){
        console.log(bytes);
    });
});*/

/*chrome.storage.sync.clear();*/