//1. подумать - можно ли избавиться от резкого -margin (выглядит не плавно)
// * возможно нужно более плавное изменение (что-то типо список наезжает на селект -> список плавно уходит в фон (меняя z-index))
//2. добавить описание настройкам (выбору темы, этапу выполнения)
//3. сделать блок URL двустрочным, где в первой строке - текущий рабочий URL, а во второй - подходящие url'ны

var THEME_PATTERN = /[a-z0-9\-]+(?=\.min\.css$)/;

var externalTheme = document.getElementById('js_theme-css');
var decreaseFont = document.getElementById('js_decrease');
var increaseFont = document.getElementById('js_increase');
var runAt = document.getElementById('js_run-at');
var saveButton = document.getElementById('js_save');
var editorTheme = document.getElementById('js_theme');
var urlField = document.getElementById('js_url-path');
var userCode = document.getElementById("js_user-code");

var codeMirror;
var config = { // + default values
    'code': '',
    'editorTheme': 'mdn-like',
    'fontSize': '12px',
    'runAt': 'document_idle'
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
                theme: config.editorTheme,
                value: config.code
            });
            codeMirror.setSize('100%', '100%');
            // set settings
            userCode.style.fontSize = config.fontSize;
            setRadioInFormByValue(editorTheme, config.editorTheme);
            setRadioInFormByValue(runAt, config.runAt);
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
    config.code = codeMirror.getValue();
    chrome.storage.sync.set({
        [urlField.value]: config // save config state
    });
});


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
function initializeConfig(state, params){
    if(!params){
        params = {};
    }
    state.code = params.code || state.code;
    state.fontSize = params.fontSize || state.fontSize;
    state.editorTheme = params.editorTheme || state.editorTheme;
    state.runAt = params.runAt || state.runAt;
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
    chrome.storage.sync.getBytesInUse(keys, function(bytes){
        list.innerHTML = bytes;
    });
});*/