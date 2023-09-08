(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _localStorage = __webpack_require__(52);

module.exports = {
    readData: _localStorage.readData,
    writeData: _localStorage.writeData,
    readComponent: _localStorage.readComponent,
    writeComponent: _localStorage.writeComponent
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.componentRecursive = componentRecursive;
exports.saveComponentsToWindow = saveComponentsToWindow;
exports.getNestedComponents = getNestedComponents;
exports.initialiseComponents = initialiseComponents;

var _createComponent = __webpack_require__(50);

var _Storage = __webpack_require__(3);

var _assetUtils = __webpack_require__(53);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // Dependencies.

// Utilities.

function createStylesheet(style, name) {

    // check if window has $assets 
    if (window.assets) {
        style = (0, _assetUtils.nameToURL)(style);
    }

    var toDelete = [].concat(_toConsumableArray(document.querySelectorAll("[data-component-name='" + name + "']")));
    toDelete.forEach(function (item) {
        item.remove();
    });
    var dynamicStyle = document.createElement('style');
    dynamicStyle.setAttribute("data-component-name", name);
    dynamicStyle.type = 'text/css';
    dynamicStyle.innerHTML = style;
    document.body.appendChild(dynamicStyle);
}

/** Takes a component and converts it as a react component */
function saveToWindow(component) {
    if ((0, _assetUtils.hasAssets)(component.state)) {
        component.state = JSON.parse((0, _assetUtils.nameToURL)(JSON.stringify(component.state)));
    }
    createStylesheet(component.style, component.name);
    window[component.name] = (0, _createComponent.createComponent)(component);
}

function checkNestedComponents(markup) {

    var components = (0, _Storage.readData)("ui-editor");

    return components.filter(function (component) {
        return markup.includes(component.name);
    }).length > 0;
}

window.visited = {};

/**Used to detect calls that can happen because of recursive components */
function componentVisited(componentName) {
    if (window.visited[componentName]) {
        return true;
    } else {
        window.visited[componentName] = true;
        return false;
    }
}

function componentRecursive(component) {
    return component.markup.includes(component.name);
}

/** Takes components and saves them to window as react Object */
function saveComponentsToWindow(nestedComponents) {
    // Transpile them and make them global.
    nestedComponents.forEach(function (component) {
        saveToWindow(JSON.parse(JSON.stringify(component)));
    });
}

/** Takes markup and returns children component objects. */
function getNestedComponents(parent) {
    // Should be able to detect nested component.

    var components = (0, _Storage.readData)("ui-editor");
    var nestedComponents = [parent]; // Problem 1. When creating recursive components, automatically set component.config[componentName].override = true when you save.
    if (checkNestedComponents(parent.markup) && !componentVisited(parent.name)) {
        // find all the nested components from the markup and push it to nestedComponents.
        var children = components.filter(function (component) {
            return parent.markup.includes(component.name);
        });
        // Find grand kids.
        var grandKids = children.map(getNestedComponents).flat(3);
        nestedComponents.push.apply(nestedComponents, _toConsumableArray(grandKids));
    }
    return [].concat(_toConsumableArray(new Set(nestedComponents.filter(function (component) {
        return component && component.markup;
    }))));
}

/** Takes a component, checks and saves it on window */
function initialiseComponents(component) {
    // Check if it already exists
    if (!window[component.name]) {
        // visited gets used by getNestedComponents. Helps to prevent recurrent calls
        window.visited = {};
        // get components that are used by the currrent component.
        var nestedComponents = getNestedComponents(component);
        if (nestedComponents.length > 0) {
            // save the current component and the components that are used on window.
            saveComponentsToWindow(nestedComponents);
        }
    }
}

/***/ }),
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.findParent = findParent;
exports.findParentFolder = findParentFolder;
exports.findFolder = findFolder;
var folderFound = "";
var parentFolder = "";
var folderParentFolder = "";

function findParent(componentName, folder) {

    var contents = folder.contents;

    for (var i = 0; i < contents.length; i++) {
        var content = contents[i];
        if (componentName === content) {
            parentFolder = folder;
        }
        if ((typeof content === "undefined" ? "undefined" : _typeof(content)) === "object") {
            findParent(componentName, content);
        }
    }

    return parentFolder;
}

function findParentFolder(folderName, folder) {

    var contents = folder.contents;

    for (var i = 0; i < contents.length; i++) {
        var content = contents[i];

        if ((typeof content === "undefined" ? "undefined" : _typeof(content)) === "object") {
            if (content.name === folderName) {
                folderParentFolder = folder;
            }
            findParentFolder(folderName, content);
        }
    }

    return folderParentFolder;
}

// Given folders and a foldername, finds a folder and returns it.
function findFolder(folderName, folder) {

    // Return early if type is string.
    if (typeof folder === "string") {
        return false;
    }

    if ((typeof folder === "undefined" ? "undefined" : _typeof(folder)) === "object") {

        // Return folder if name matches.
        if (folder.name === folderName) {
            folderFound = folder;
        }

        var contents = folder.contents;

        for (var i = 0; i < contents.length; i++) {
            var content = contents[i];
            findFolder(folderName, content);
        }
    }

    return folderFound;
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var addEvents = function addEvents(markup, events, component) {
    events.forEach(function (event) {
        var id = "id=\"" + event.id + "\"";
        // check if markup contains the id.
        if (markup.includes(id)) {
            markup = markup.replace(id, id + " " + event.name + "={this." + (event.id + event.name) + ".bind(this)}");
        }
        // its a child component.
        else {
                markup = markup.replace("<" + event.id, "<" + event.id + " " + event.name + "={this." + (event.id + event.name) + ".bind(this)}");
            }
    });

    /**
     * This piece of code is needed to try a feature.
     * Feature - Add events and reducers to Div
     * Expected - Events to work
     * Actual - Events don't work
     * 
     * Implement
     * 1. check if state.events object preset
     * 2. Then appened it to the markup
     */

    function stateToComponent(state) {
        return " " + Object.keys(state.events).map(function (key) {
            return key + "={(e)=>{var state = JSON.parse(JSON.stringify(this.state));" + state.events[key] + "}}";
        }).join(" ") + ">";
    }

    var state = JSON.parse(component.state);
    if (state.events) {
        markup = markup.replace(">", stateToComponent(state));
    }

    /**
     * This piece of code is needed only for the exception case.
     * Exception case that I'm trying to build is draw divs on screen
     * And add events using eventsBuilder component.
     * 
     * All these markup.replace is needed so that THE JSX MARKUP LOOKS CLEAN. it is fine if this file is this bad.
     */
    if (markup.includes("...state")) {
        markup = markup.split("state.").join("this.state.").replace("...state", "...this.state");
        return markup;
    }
    return markup.split("state.").join("this.state.");
};

// checks if state override is on. then adds state prop to child 
var addChildrenConfig = function addChildrenConfig(markup, component) {
    // for all the config.
    // filter child with overide state is true
    var config = JSON.parse(component.config);
    var childrenConfig = Object.keys(config);
    childrenConfig.forEach(function (childName) {

        // PRECAUTION: Edit markup for rendering list. Should not use other configuration while using this. // Problem - subscibing to child list component does not work Solution - add publishable enevts here
        if (config[childName].override) {
            var childMarkup = "<" + childName + "></" + childName + ">";

            var childMarkupWithProps = "<" + childName + " state={item} key={~~(Math.random()*10000)} index={i}></" + childName + ">";
            var renderListMarkup = "{state." + childName + ".map((item,i)=>" + childMarkupWithProps + ")}";
            markup = markup.replace(childMarkup, renderListMarkup);
        }
    });
    return markup;
};

var addChildren = function addChildren(component) {
    return component.markup.replace(">", " id=\"" + component.name + "\" >{this.props.children}");
};

module.exports = {
    addEvents: addEvents,
    addChildrenConfig: addChildrenConfig,
    addChildren: addChildren
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function getPublishes(publishes) {
    return publishes.map(function (publish) {
        if (publish.publishable) {
            return "\n            if(" + publish.publishCondition + "){\n                this.props." + publish.publishName + "? this.props." + publish.publishName + "(e):null;\n            }";
        }
    }).join("\n");
}

function getReducer(reducer) {
    return "\n        " + reducer.reducer + "\n        this.setState(state);\n        e.state = state;\n        e.index = this.props.index;\n        " + getPublishes(reducer.publishes);
}

function getReducers(component) {
    return component.events.map(function (event) {
        return "\n        " + (event.id + event.name) + " (e) {\n            var state = JSON.parse(JSON.stringify(this.state))\n            " + getReducer(event.reducer) + "\n        }";
    }).join("\n");
}

module.exports = {
    getReducers: getReducers
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.findParent = findParent;
exports.findParentFolder = findParentFolder;
exports.findFolder = findFolder;
var folderFound = "";
var parentFolder = "";
var folderParentFolder = "";

function findParent(componentName, folder) {

    var contents = folder.contents;

    for (var i = 0; i < contents.length; i++) {
        var content = contents[i];
        if (componentName === content) {
            parentFolder = folder;
        }
        if ((typeof content === "undefined" ? "undefined" : _typeof(content)) === "object") {
            findParent(componentName, content);
        }
    }

    return parentFolder;
}

function findParentFolder(folderName, folder) {

    var contents = folder.contents;

    for (var i = 0; i < contents.length; i++) {
        var content = contents[i];

        if ((typeof content === "undefined" ? "undefined" : _typeof(content)) === "object") {
            if (content.name === folderName) {
                folderParentFolder = folder;
            }
            findParentFolder(folderName, content);
        }
    }

    return folderParentFolder;
}

// Given folders and a foldername, finds a folder and returns it.
function findFolder(folderName, folder) {

    // Return early if type is string.
    if (typeof folder === "string") {
        return false;
    }

    if ((typeof folder === "undefined" ? "undefined" : _typeof(folder)) === "object") {

        // Return folder if name matches.
        if (folder.name === folderName) {
            folderFound = folder;
        }

        var contents = folder.contents;

        for (var i = 0; i < contents.length; i++) {
            var content = contents[i];
            findFolder(folderName, content);
        }
    }

    return folderFound;
}

/***/ }),
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(20);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, "body {\n    position:relative;\n    color: #d9d9d9;\n    font-family: \"Nunito Sans\",-apple-system,\".SFNSText-Regular\",\"San Francisco\",BlinkMacSystemFont,\"Segoe UI\",\"Helvetica Neue\",Helvetica,Arial,sans-serif;\n    margin: 0px;\n}\n\n\n\ninput[type=\"text\"] {\n    color: rgba(255,255,255,0.5);\n}\n\nul label input {\n    width: 10px;\n}\n\nul, li {\n    padding-left: 5px;\n    margin-top: 0px;\n    margin-bottom: 0px;\n}\n\nbutton, select{\n    color: rgba(255,255,255,0.5);\n    border-color: rgba(0,0,0,0.9);\n    border-width: 0px;\n    padding: 5px;\n    background-color: transparent;\n    margin-left: 4px;\n}\n\nselect:focus{\n    \n    outline: 1px solid white;\n}\n\nbutton i{\n    padding-right:4px;\n}\n\nselect:focus, \nul label:hover, \nli:hover, \n.content:hover {\n    color: #fff;\n    background: rgb(43, 43, 43);\n}\n\nbutton:hover{\n    color: #fff;\n}\n\nul,li, ul label {\n    color: rgba(255,255,255,0.5);\n}\n\n\n#index{\n    margin:-4px;\n}\n\n.CodeMirror {\n    border: 1px solid black;\n    margin-top:5px;\n}\n\n.container{\n    padding: 5px;\n    background: #2C3134;\n}\n\n*::-webkit-scrollbar {\n  width: 1px;\n}\n \n*::-webkit-scrollbar-track {\n  box-shadow: inset 0 0 0px rgba(0, 0, 0, 0.3);\n}\n \n*::-webkit-scrollbar-thumb {\n  background-color: darkgrey;\n  outline: 1px solid slategrey;\n}", ""]);



/***/ }),
/* 21 */,
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(23);

var _Folders = __webpack_require__(25);

var _Folders2 = _interopRequireDefault(_Folders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Styles.

// Components.


var Components = function (_Component) {
    _inherits(Components, _Component);

    function Components(props) {
        _classCallCheck(this, Components);

        var _this = _possibleConstructorReturn(this, (Components.__proto__ || Object.getPrototypeOf(Components)).call(this, props));

        _this.state = {
            components: _this.props.components,
            folders: _this.props.folders
        };
        return _this;
    }

    _createClass(Components, [{
        key: "addFolder",
        value: function addFolder() {
            var folders = Array.from(this.state.folders);
            folders.unshift({
                type: "NewFolder",
                name: "",
                contents: [],
                status: "closed"
            });
            this.setState({ folders: folders });
        }
    }, {
        key: "addComponent",
        value: function addComponent() {
            this.props.onOpenEditor();
        }
    }, {
        key: "render",
        value: function render() {
            var props = this.props;
            var state = this.state;
            return _react2.default.createElement(
                "div",
                { className: "container elements-tab" },
                _react2.default.createElement(
                    "div",
                    null,
                    "Components"
                ),
                _react2.default.createElement(
                    "div",
                    null,
                    _react2.default.createElement(
                        "button",
                        { onClick: this.addComponent.bind(this) },
                        _react2.default.createElement("i", { className: "fa fa-edit" }),
                        props.selectedComponent ? "Edit" : "Add"
                    ),
                    _react2.default.createElement(
                        "button",
                        { onClick: this.addFolder.bind(this) },
                        _react2.default.createElement("i", { className: "fa fa-folder" }),
                        "Folder"
                    )
                ),
                _react2.default.createElement(
                    "div",
                    { className: "folders" },
                    _react2.default.createElement(_Folders2.default, {
                        key: Math.ceil(Math.random() * 1000),
                        components: state.components,
                        folders: state.folders,
                        selectedComponent: props.selectedComponent,
                        onFoldersUpdate: props.onFoldersUpdate,
                        onSelection: props.onSelection
                    })
                )
            );
        }
    }]);

    return Components;
}(_react.Component);

exports.default = Components;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(24);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, ".override {\n    line-height: 0%;\n}\n\ntextarea {\n    height: 70px;\n    width: 450px;\n}\n\n.title{\n    margin-top: 15px;\n    margin-bottom: 11px;\n    color: rgba(255,255,255,0.5);\n    background: rgb(64, 64, 64);\n    padding: 5px;\n    font-size: 12px;\n}\n\n.Controls{\n    display: inline-block;\n    opacity: 1;\n    transition: opacity .2s ease-in;\n}\n\n.hideControls{\n    opacity: 0;\n    transition: opacity .5s ease-in-out;\n}\n\n.leftItem{\n    position: absolute;\n    left:0px;\n    z-index:100000;\n    animation: slide-to-screen 0.7s ease;\n}\n\n@keyframes slide-to-screen {\n    0% {\n        left:-300px;\n    }\n    100% {\n        left: 0px;\n    }\n}", ""]);



/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _findFolders = __webpack_require__(7);

__webpack_require__(26);

var _processFolder = __webpack_require__(28);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Utilities.

// Styles.

var Folders = function (_Component) {
    _inherits(Folders, _Component);

    function Folders(props) {
        _classCallCheck(this, Folders);

        var _this = _possibleConstructorReturn(this, (Folders.__proto__ || Object.getPrototypeOf(Folders)).call(this, props));

        _this.state = {
            components: _this.props.components,
            folders: _this.props.folders
        };
        return _this;
    }

    _createClass(Folders, [{
        key: "removeFolderFromParent",
        value: function removeFolderFromParent(folders, oldParent, contentName) {
            var oldParentFolder = (0, _findFolders.findFolder)(oldParent, folders[0]);
            var deleteIndex = oldParentFolder.contents.findIndex(function (content) {
                return (typeof content === "undefined" ? "undefined" : _typeof(content)) === "object" && content.name === contentName;
            });
            if (deleteIndex > -1) oldParentFolder.contents.splice(deleteIndex, 1);
        }
    }, {
        key: "removeContentFromParent",
        value: function removeContentFromParent(folders, oldParent, contentName) {
            var oldParentFolder = (0, _findFolders.findFolder)(oldParent, folders[0]);
            var removeIndex = oldParentFolder.contents.findIndex(function (content) {
                return content === contentName;
            });
            if (removeIndex !== -1) oldParentFolder.contents.splice(removeIndex, 1);
        }
    }, {
        key: "onFolderUpdate",
        value: function onFolderUpdate(data, type, oldParent, content) {
            var folders = Array.from(this.state.folders);
            var newParent = data.name;
            var folder = (0, _findFolders.findFolder)(newParent, folders[0]);
            if (type == "NEWFOLDER") {
                var emptyFolderIndex = folders.findIndex(function (folder) {
                    return folder.type === "NewFolder";
                });
                if (emptyFolderIndex !== -1) {
                    // Delete the newFolder
                    folders.splice(emptyFolderIndex, 1);
                }

                var noFolder = folders[0];
                noFolder.contents.unshift(data);
            }

            if (type == "COMPONENT") {
                folder.contents = data.contents;
                this.removeContentFromParent(folders, oldParent, content);
            } else if (type == "FOLDER") {
                folder.contents = data.contents;
                this.removeFolderFromParent(folders, oldParent, content, newParent);
            }
            this.props.onFoldersUpdate(folders);
        }
    }, {
        key: "onFolderStatusChanged",
        value: function onFolderStatusChanged(folder) {
            // find folder,
            var folderToUpdate = (0, _findFolders.findFolder)(folder.name, this.state.folders[0]);
            // update it in folders,
            folderToUpdate.status = folder.status;
            this.props.onFoldersUpdate(this.state.folders);
        }
    }, {
        key: "render",
        value: function render() {
            return (0, _processFolder.folderStructure)(this.props, this.onFolderUpdate.bind(this), this.onFolderStatusChanged.bind(this));
        }
    }]);

    return Folders;
}(_react.Component);

exports.default = Folders;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(27);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, ".newFolder{\n    user-select: none;\n    padding-left:5px;\n}\n\n.newFolder i{\n    color: rgba(255,255,255,0.5);\n    border-color: rgba(0,0,0,0.9);\n    border-width: 1px;\n    padding: 7px;\n}\n\n.newFolder.dragOver i{\n    animation: blink .5s infinite;\n}\n\n@keyframes blink{\n    from {    \n        color: rgba(255,255,255,0.5);\n    }\n    to {\n        color: white;\n    }\n}\n.fa.fa-folder ~ ul {\n    display: none;\n}\n.fa.fa-folder-open ~ ul {\n    display:block;\n}", ""]);



/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.folderStructure = folderStructure;

var _Folder = __webpack_require__(29);

var _Folder2 = _interopRequireDefault(_Folder);

var _Componentt = __webpack_require__(37);

var _Componentt2 = _interopRequireDefault(_Componentt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var selectedComponent = void 0,
    onSelection = void 0,
    onFolderUpdate = void 0,
    components = void 0,
    folders = void 0,
    onFolderStatusChanged = void 0;

function initialiseProps(props, checkFolder, x) {
    folders = props.folders;
    selectedComponent = props.selectedComponent;
    onSelection = props.onSelection;
    components = props.components;
    onFolderUpdate = checkFolder;
    onFolderStatusChanged = x;
}

function processFolder(folder, i) {
    var contents = folder.contents;

    return React.createElement(_Folder2.default, {
        key: i,
        folder: folder,
        folders: folders,
        contents: contents.map(processContent),
        onFolderStatusChanged: onFolderStatusChanged,
        onFolderUpdate: onFolderUpdate });
}

function processContent(content, i) {

    // Check if content is a component name.
    if (typeof content === "string") {
        var component = components.find(function (component) {
            return component.name === content;
        });

        if (!component) {
            throw content + " is not found. remove it from folder's data";
        }

        return React.createElement(_Componentt2.default, {
            key: i,
            component: component,
            selectedComponent: selectedComponent,
            onSelectionChange: onSelection
        });
    }
    // else its a folder type.
    else {
            var folder = content;
            return React.createElement(_Folder2.default, {
                key: i,
                folder: folder,
                folders: folders,
                contents: folder.contents.map(processContent),
                onFolderStatusChanged: onFolderStatusChanged,
                onFolderUpdate: onFolderUpdate });
        }
}

function folderStructure(props, onFolderUpdate, onFolderStatusChanged) {
    var folders = props.folders;

    initialiseProps(props, onFolderUpdate, onFolderStatusChanged);

    return folders.map(processFolder);
}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(30);

var _NewFolder = __webpack_require__(32);

var _NewFolder2 = _interopRequireDefault(_NewFolder);

var _Reducer = __webpack_require__(35);

var _Events = __webpack_require__(36);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Styles.

var Folder = function (_Component) {
    _inherits(Folder, _Component);

    function Folder(props) {
        _classCallCheck(this, Folder);

        var _this = _possibleConstructorReturn(this, (Folder.__proto__ || Object.getPrototypeOf(Folder)).call(this, props));

        _this.state = {
            iconStatus: "fa fa-folder",
            folderClass: "newFolder",
            name: _this.props.folder.name,
            contents: _this.props.folder.contents,
            type: _this.props.folder.type,
            status: _this.props.folder.status
        };
        return _this;
    }

    _createClass(Folder, [{
        key: "newFolder",
        value: function newFolder(folder) {
            this.props.onFolderUpdate(folder, "NEWFOLDER");
        }
    }, {
        key: "render",
        value: function render() {

            var folder = this.props.folder;
            var contents = this.props.contents;
            var iconStatus = this.state.status === "open" ? "fa fa-folder-open" : "fa fa-folder";
            if (folder.type == "NewFolder") {
                return _react2.default.createElement(_NewFolder2.default, { onNewFolder: this.newFolder.bind(this) });
            }
            if (folder.type == "folder") {
                return _react2.default.createElement(
                    "div",
                    {
                        className: this.state.folderClass,
                        "data-folder-name": folder.name,
                        draggable: "true",
                        onDrop: _Events.dropHandler.bind(this),
                        onDragOver: _Events.dragOverHandler.bind(this),
                        onDragLeave: _Events.dragLeaveHandler.bind(this),
                        onDragStart: _Events.folderStartDrag.bind(this) },
                    _react2.default.createElement("i", { className: iconStatus, onClick: _Reducer.toggleFolder.bind(this) }),
                    _react2.default.createElement("input", { type: "text", className: "folder", placeholder: "Enter folder name", readOnly: true, value: this.state.name }),
                    this.state.status === "open" ? contents : null
                );
            }
            if (folder.type == "noFolder") {
                return _react2.default.createElement(
                    "div",
                    {
                        className: this.state.folderClass,
                        "data-folder-name": folder.name,
                        draggable: "true",
                        onDrop: _Events.dropHandler.bind(this),
                        onDragOver: _Events.dragOverHandler.bind(this),
                        onDragLeave: _Events.dragLeaveHandler.bind(this),
                        onDragStart: _Events.folderStartDrag.bind(this) },
                    contents
                );
            }
        }
    }]);

    return Folder;
}(_react.Component);

exports.default = Folder;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(31);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, "input.folder{\n    border:none;\n    background:none;\n    padding-bottom: 13px;\n}\n\n.newFolder{\n    user-select: none;\n}\n\n.newFolder i{\n    color: rgba(255,255,255,0.5);\n    border-color: rgba(0,0,0,0.9);\n    border-width: 1px;\n    padding: 7px;\n}\n\n.newFolder.dragOver i{\n    animation: blink .5s infinite;\n}\n\n@keyframes blink{\n    from {    \n        color: rgba(255,255,255,0.5);\n    }\n    to {\n        color: white;\n    }\n}\n.fa.fa-folder ~ ul {\n    display: none;\n}\n.fa.fa-folder-open ~ ul {\n    display:block;\n}", ""]);



/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(33);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Styles.

// Components.

var NewFolder = function (_Component) {
    _inherits(NewFolder, _Component);

    function NewFolder(props) {
        _classCallCheck(this, NewFolder);

        var _this = _possibleConstructorReturn(this, (NewFolder.__proto__ || Object.getPrototypeOf(NewFolder)).call(this, props));

        _this.state = {
            status: "fa fa-folder",
            newFolderClass: "newFolder",
            folderName: ""
        };
        return _this;
    }

    _createClass(NewFolder, [{
        key: "folderNameChanged",
        value: function folderNameChanged(e) {
            this.setState({
                folderName: e.currentTarget.value
            });
        }
    }, {
        key: "saveFolderNameOnEnter",
        value: function saveFolderNameOnEnter(e) {
            if (e.key === "Enter") {
                this.props.onNewFolder({
                    name: this.state.folderName,
                    contents: [],
                    type: "folder",
                    status: "closed"
                });
            }
        }
    }, {
        key: "render",
        value: function render() {

            return _react2.default.createElement(
                "div",
                { className: this.state.newFolderClass },
                _react2.default.createElement("i", { className: this.state.status }),
                _react2.default.createElement("input", {
                    type: "text",
                    className: "folder",
                    autoFocus: true,
                    placeholder: "Enter folder name",
                    value: this.state.folderName,
                    onChange: this.folderNameChanged.bind(this),
                    onKeyPress: this.saveFolderNameOnEnter.bind(this) })
            );
        }
    }]);

    return NewFolder;
}(_react.Component);

exports.default = NewFolder;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(34);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, ".newFolder i{\n    color: rgba(255,255,255,0.5);\n    border-color: rgba(0,0,0,0.9);\n    border-width: 1px;\n    padding: 7px;\n}\n\n.newFolder.dragOver i{\n    animation: blink .5s infinite;\n}\n\n@keyframes blink{\n    from {    \n        color: rgba(255,255,255,0.5);\n    }\n    to {\n        color: green;\n    }\n}", ""]);



/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toggleFolder = toggleFolder;
function openFolder() {
    var state = JSON.parse(JSON.stringify(this.state));
    state.status = "open";
    this.props.onFolderStatusChanged(state);
}

function closeFolder() {
    var state = JSON.parse(JSON.stringify(this.state));
    state.status = "closed";
    this.props.onFolderStatusChanged(state);
}

function toggleFolder() {
    if (this.state.status === "closed") {
        openFolder.call(this);
    } else {
        closeFolder.call(this);
    }
}

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dropHandler = dropHandler;
exports.dragOverHandler = dragOverHandler;
exports.dragLeaveHandler = dragLeaveHandler;
exports.folderStartDrag = folderStartDrag;

var _findFolders = __webpack_require__(7);

function handleComponentDrop(componentName, oldParent) {
    var contents = Array.from(this.state.contents);

    contents.push(componentName);

    this.props.onFolderUpdate({
        name: this.state.name,
        contents: contents,
        type: "folder",
        status: "open"
    }, "COMPONENT", oldParent, componentName);
}

function handleFolderDrop(folderName, oldParent) {
    var contents = Array.from(this.state.contents);

    // 1. Find folder object.
    var droppedFolder = (0, _findFolders.findFolder)(folderName, this.props.folders[0]);

    contents.push(droppedFolder);

    // 2. Remove it from its parent (parentFolderName)
    // do somewhere else. head hurts

    // Check if it is a folder. Also check if we are not dropping on the original folder. may be remove it from the dom. NOPE. 
    if (folderName && folderName !== this.state.name) {
        this.props.onFolderUpdate({
            name: this.state.name,
            contents: contents,
            type: "folder",
            status: "open"
        }, "FOLDER", oldParent, folderName);
    }
}

function dropHandler(ev) {
    ev.preventDefault();
    var componentName = ev.dataTransfer.getData("component-name");
    var folderName = ev.dataTransfer.getData("folder-name");
    var oldParent = ev.dataTransfer.getData("parent-folder-name");
    var newParent = this.state.name;

    if (oldParent === newParent) {
        this.setState({
            folderClass: "newFolder",
            status: "closed"
        });
        return;
    }

    // If component name is null, then it is a folder dropped on folder
    if (componentName === "") {
        // This should happen.
        if (folderName == "null" || folderName == "") {
            console.error("Folder cannot be empty");
            return;
        }

        handleFolderDrop.call(this, folderName, oldParent);
    } else {
        handleComponentDrop.call(this, componentName, oldParent);
    }

    console.log("Drop from folder");
    ev.stopPropagation();
}

function dragOverHandler(ev) {
    ev.preventDefault();
    this.setState({
        folderClass: "newFolder dragOver",
        status: "open"
    });
}

function dragLeaveHandler(e) {
    this.setState({
        folderClass: "newFolder",
        status: "closed"
    });
}

function folderStartDrag(e) {
    var name = event.target.getAttribute("data-folder-name");
    var parent = event.target.parentElement.getAttribute("data-folder-name");
    e.dataTransfer.setData("folder-name", name);
    e.dataTransfer.setData("parent-folder-name", parent);
    console.log("Folder " + name + " draged with parent " + parent);
}

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Events = __webpack_require__(38);

__webpack_require__(39);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Events.

// Styles.

var Componentt = function (_Component) {
    _inherits(Componentt, _Component);

    function Componentt(props) {
        _classCallCheck(this, Componentt);

        var _this = _possibleConstructorReturn(this, (Componentt.__proto__ || Object.getPrototypeOf(Componentt)).call(this, props));

        _this.state = {
            selectedComponent: _this.props.selectedComponent
        };
        return _this;
    }

    _createClass(Componentt, [{
        key: "addComponentDetails",
        value: function addComponentDetails(e) {

            /** Pass details about component or folder in the drag event */

            var name = e.target.getAttribute("data-name");
            e.dataTransfer.setData("component-name", name);
            console.log(e.dataTransfer.getData("component-name"));
            e.dataTransfer.setData("parent-folder-name", e.currentTarget.parentElement.getAttribute("data-folder-name"));
            e.stopPropagation();
        }
    }, {
        key: "render",
        value: function render() {

            var props = this.props;
            var selectedComponent = props.selectedComponent;
            var component = props.component;

            return _react2.default.createElement(
                "li",
                {
                    className: selectedComponent && props.component.name === selectedComponent.name ? "selected component background" : "component background",
                    onClick: _Events.selectionChanged.bind(this, component.name),
                    onContextMenu: _Events.selectionChanged.bind(this, component.name),
                    index: props.index,
                    draggable: "true",
                    "data-name": component.name,
                    onDragStart: this.addComponentDetails.bind(this) },
                _react2.default.createElement(
                    "span",
                    { className: "componentName " },
                    component.name
                )
            );
        }
    }]);

    return Componentt;
}(_react.Component);

exports.default = Componentt;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.selectionChanged = selectionChanged;

// Public functions

function selectionChanged(componentName, e) {

    /** Pass message to Components about selection change  */

    this.props.onSelectionChange(componentName, e);
}

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(40);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, "/* Show green when component is selected*/\n\n.selected, .green {\n    border: 1px solid green;\n    background: rgb(43, 43, 43);\n}\n\n\n/* Show some spacing before the component name */\n\n.component .componentName{\n    padding:7px;\n}\n\n.component {\n    display:flex;\n}\n\n/* Show comopnent preview onDrag*/\n\n.dragStarted span:not(.componentName){\n    display:none;\n}\n\n.hidden{\n    display: none;\n}", ""]);



/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Configurator = __webpack_require__(42);

var _Configurator2 = _interopRequireDefault(_Configurator);

var _Tags = __webpack_require__(45);

var _Tags2 = _interopRequireDefault(_Tags);

var _Reducer = __webpack_require__(54);

var _Reducer2 = _interopRequireDefault(_Reducer);

__webpack_require__(58);

var _Reducer3 = __webpack_require__(60);

var _Storage = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

// Dependencies.


// Components. 

// Styles.

// Reducers.

// Utils.

var Events = function (_Component) {
    _inherits(Events, _Component);

    function Events(props) {
        _classCallCheck(this, Events);

        var _this = _possibleConstructorReturn(this, (Events.__proto__ || Object.getPrototypeOf(Events)).call(this, props));

        _this.state = Object.assign({}, _this.props);
        _this.state.selectedTag = _this.props.selectedTag;
        _this.state.selectedEventName = "";
        _this.state.selectedEvent = {
            name: "",
            reducer: {
                reducer: "",
                publishes: [],
                index: _this.props.component.events.length
            }
        };
        _this.state.eventID = "";
        return _this;
    }

    _createClass(Events, [{
        key: "publishEvent",
        value: function publishEvent(reducer) {
            this.setState({
                selectedEvent: {
                    name: this.state.selectedEventName,
                    reducer: {
                        reducer: reducer.reducer,
                        publishes: reducer.publishes
                    }
                }
            });
        }
    }, {
        key: "saveEvent",
        value: function saveEvent() {
            var _this2 = this;

            var events = Array.from(this.props.component.events);
            var changedEvent = events.find(function (event) {
                return event.name === _this2.state.selectedEvent.name && _this2.state.eventID === event.id;
            });
            if (changedEvent) {
                // its a existing event
                changedEvent.reducer = this.state.selectedEvent.reducer;
            } else {
                // its a new event
                events.push({
                    id: this.state.eventID,
                    index: events.length,
                    name: this.state.selectedEvent.name,
                    reducer: this.state.selectedEvent.reducer
                });
            }
            this.props.onEventsUpdate(events);
        }
    }, {
        key: "render",
        value: function render() {
            var component = this.props.component;

            // Report if no component is created.
            if (this.state.components.length == 0) {
                return null;
            }

            // Report if no component is selected.
            if (component.name === undefined && this.state.components.length != 0) {
                return null;
            }

            var selectedTag = this.state.selectedTag || "";
            var configurator = void 0,
                eventNames = [];

            // Check if it is a child component
            if (selectedTag.includes("child-component-")) {

                // Get child component name from the selected tag.
                var childComponentName = selectedTag.split("child-component-")[1];

                // Get list of components.
                var components = (0, _Storage.readData)("ui-editor");

                // Find the child component from the list of components.
                var childComponent = components.find(function (component) {
                    return component.name === childComponentName;
                });

                // Find events that are publishable from the child component to show in drop down.
                eventNames = [];

                childComponent.events.forEach(function (event) {
                    event.reducer.publishes.forEach(function (publish) {
                        if (publish.publishable) {
                            eventNames.push(publish.publishName);
                        }
                    });
                });
                // Create view for config.
                configurator = _react2.default.createElement(_Configurator2.default, {
                    key: Math.ceil(Math.random() * 1000),
                    onChange: _Reducer3.updateConfiguration.bind(this),
                    childName: childComponentName,
                    parent: component });
            } else {
                eventNames = component.events.filter(function (e) {
                    return e.id === selectedTag.split("-")[1];
                }).map(function (e) {
                    return e.name;
                });
            }

            return _react2.default.createElement(
                "ul",
                { className: "container events-tab" },
                _react2.default.createElement(_Tags2.default, { component: component, onSelectedTagChanged: _Reducer3.selectedTagChanged.bind(this) }),
                configurator,
                _react2.default.createElement(
                    "div",
                    null,
                    _react2.default.createElement(
                        "div",
                        { "class": "spacing" },
                        _react2.default.createElement(
                            "label",
                            null,
                            "Event name"
                        ),
                        _react2.default.createElement("input", { list: "eventNames", type: "text", onChange: _Reducer3.updateSelectedEvent.bind(this), value: this.state.selectedEventName, title: "Event Name" }),
                        _react2.default.createElement(
                            "datalist",
                            { id: "eventNames" },
                            eventNames.map(function (eventName) {
                                return _react2.default.createElement("option", { value: eventName });
                            })
                        ),
                        _react2.default.createElement(
                            "button",
                            { onClick: this.saveEvent.bind(this), id: "saveEvent" },
                            _react2.default.createElement("i", { className: "fas fa-save" }),
                            "Save Event"
                        ),
                        _react2.default.createElement(
                            "button",
                            { onClick: _Reducer3.deleteEvent.bind(this), id: "deleteEvent" },
                            _react2.default.createElement("i", { className: "fas fa-trash" }),
                            "Delete Event"
                        )
                    )
                ),
                _react2.default.createElement(
                    "div",
                    { className: "event" },
                    _react2.default.createElement(
                        "div",
                        { className: "reducers" },
                        _react2.default.createElement(
                            "div",
                            null,
                            "Reducer"
                        ),
                        _react2.default.createElement(
                            "div",
                            null,
                            _react2.default.createElement(_Reducer2.default, { key: Math.ceil(Math.random() * 1000), reducer: this.state.selectedEvent.reducer, onChange: this.publishEvent.bind(this) })
                        )
                    )
                )
            );
        }
    }]);

    return Events;
}(_react.Component);

exports.default = Events;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(43);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

var Configurator = function (_Component) {
    _inherits(Configurator, _Component);

    function Configurator(props) {
        _classCallCheck(this, Configurator);

        var _this = _possibleConstructorReturn(this, (Configurator.__proto__ || Object.getPrototypeOf(Configurator)).call(this, props));

        var config = JSON.parse(_this.props.parent.config)[_this.props.childName] || { override: false };

        _this.state = {
            override: config.override
        };
        return _this;
    }

    _createClass(Configurator, [{
        key: "toggelOverride",
        value: function toggelOverride() {
            this.setState({
                override: !this.state.override
            });

            this.props.onChange({
                config: {
                    override: !this.state.override
                },
                childName: this.props.childName,
                parentName: this.props.parent.name
            });
        }
    }, {
        key: "saveConfig",
        value: function saveConfig() {
            this.props.onChange({
                config: {
                    override: this.state.override
                },
                childName: this.props.childName,
                parentName: this.props.parent.name
            });
        }
    }, {
        key: "render",
        value: function render() {

            return _react2.default.createElement(
                "div",
                null,
                _react2.default.createElement(
                    "div",
                    null,
                    "Child Configurations"
                ),
                _react2.default.createElement(
                    "div",
                    { className: "spacing" },
                    _react2.default.createElement(
                        "label",
                        null,
                        "Override state"
                    ),
                    _react2.default.createElement("input", { type: "checkbox", onChange: this.toggelOverride.bind(this), checked: this.state.override ? "checked" : "" })
                )
            );
        }
    }]);

    return Configurator;
}(_react.Component);

exports.default = Configurator;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(44);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, ".error {\n    color: red;\n}\n\n.info {\n    color: yellowgreen;\n}\n\nlabel {\n    padding-right: 10px;\n}\n\n.configurator {\n    background: rgb(64, 64, 64);\n    margin-top: 10px;\n    padding: 5px;\n}\n\n.spacing{\n    margin: 10px;\n}", ""]);



/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(46);

var _Nodes = __webpack_require__(48);

var _Nodes2 = _interopRequireDefault(_Nodes);

var _getNodeTree = __webpack_require__(49);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

var Tags = function (_Component) {
    _inherits(Tags, _Component);

    function Tags(props) {
        _classCallCheck(this, Tags);

        var _this = _possibleConstructorReturn(this, (Tags.__proto__ || Object.getPrototypeOf(Tags)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Tags, [{
        key: "render",
        value: function render() {

            var component = this.props.component;

            var nodeTree = (0, _getNodeTree.getNodeTree)(component, component.markup, component.style, JSON.parse(component.state), component.events);

            // Report error.
            if (nodeTree.error !== undefined) {
                console.log('%c Oh my heavens! ', 'background: #222; color: #bada55', nodeTree.error);
                return nodeTree.error;
            }

            // Report error if component is not 
            if (nodeTree.result === undefined) {
                return _react2.default.createElement(
                    "ul",
                    { className: "container events-tab" },
                    _react2.default.createElement(
                        "div",
                        null,
                        "Events"
                    )
                );
            }

            return _react2.default.createElement(
                "div",
                null,
                _react2.default.createElement(
                    "div",
                    null,
                    "Tags"
                ),
                _react2.default.createElement(
                    "div",
                    { className: "tags" },
                    _react2.default.createElement(_Nodes2.default, { node: nodeTree.result, onSelectedTagChanged: this.props.onSelectedTagChanged })
                )
            );
        }
    }]);

    return Tags;
}(_react.Component);

exports.default = Tags;

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(47);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, ".error {\n    color: red;\n}\n\n.tags {\n    max-height: 300px;\n    overflow: scroll;\n}\n\n.selectedItem.selectedItem {\n    outline: 1px solid green;\n}", ""]);



/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

var Nodes = function (_Component) {
    _inherits(Nodes, _Component);

    function Nodes(props) {
        _classCallCheck(this, Nodes);

        return _possibleConstructorReturn(this, (Nodes.__proto__ || Object.getPrototypeOf(Nodes)).call(this, props));
    }

    _createClass(Nodes, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var node = this.props.node;

            if (!node) {
                return _react2.default.createElement(
                    "span",
                    null,
                    "null"
                );
            }
            if (typeof node === "string") {
                return _react2.default.createElement(
                    "li",
                    null,
                    node
                );
            }
            // nested component.
            if (typeof node.type === "function") {
                return _react2.default.createElement(
                    "ul",
                    null,
                    _react2.default.createElement(
                        "label",
                        null,
                        _react2.default.createElement("input", {
                            type: "radio",
                            name: "selectedElement",
                            value: "child-component-" + node.type.name,
                            onChange: this.props.onSelectedTagChanged
                        }),
                        node.type.name
                    )
                );
            }

            var id = node.props.id ? "-" + node.props.id : "";

            if (id === "") {
                // Check if it contains children.
                if (node.props && Array.isArray(node.props.children)) {
                    return node.props.children.map(function (child, index) {
                        return _react2.default.createElement(Nodes, { key: index, node: child, onSelectedTagChanged: _this2.props.onSelectedTagChanged });
                    });
                } else if (_typeof(node.props.children) === "object") {
                    return _react2.default.createElement(Nodes, { key: index, node: node.props.children, onSelectedTagChanged: this.props.onSelectedTagChanged });
                }
                return null;
            } else {
                // Check if it contains children.
                if (node.props && Array.isArray(node.props.children)) {
                    var children = node.props.children.map(function (child, index) {
                        return _react2.default.createElement(Nodes, { key: index, node: child, onSelectedTagChanged: _this2.props.onSelectedTagChanged });
                    });
                    return _react2.default.createElement(
                        "ul",
                        null,
                        _react2.default.createElement(
                            "label",
                            null,
                            _react2.default.createElement("input", {
                                type: "radio",
                                name: "selectedElement",
                                onChange: this.props.onSelectedTagChanged,
                                value: node.type + id }),
                            node.type + id
                        ),
                        children
                    );
                }
                // if node contains only one children, jsx get transpiled to object rather than array.
                else if (_typeof(node.props.children) === "object") {
                        var _children = _react2.default.createElement(Nodes, { key: index, node: node.props.children, onSelectedTagChanged: this.props.onSelectedTagChanged });

                        return _react2.default.createElement(
                            "ul",
                            null,
                            _react2.default.createElement(
                                "label",
                                null,
                                _react2.default.createElement("input", {
                                    type: "radio",
                                    name: "selectedElement",
                                    onChange: this.props.onSelectedTagChanged,
                                    value: (node.type.name || node.type) + id }),
                                (node.type.name || node.type) + id
                            ),
                            _children
                        );
                    }

                return _react2.default.createElement(
                    "ul",
                    null,
                    _react2.default.createElement(
                        "label",
                        null,
                        _react2.default.createElement("input", {
                            type: "radio",
                            name: "selectedElement",
                            value: node.type + id,
                            onChange: this.props.onSelectedTagChanged
                        }),
                        node.type + id
                    )
                );
            }
        }
    }]);

    return Nodes;
}(_react.Component);

exports.default = Nodes;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getNodeTree = getNodeTree;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Runtime = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Why? Because importing React as variable at line#2 will be alterted by babel. Keep it as a property, babel will ignore it.
window.React = _react2.default;
window.Component = _react2.default.Component;

function getNodeTree(element, jsx, style, state, events) {

    var result = void 0,
        error = void 0;
    try {
        window.visited = {};
        var nestedComponents = (0, _Runtime.getNestedComponents)(element);
        if (nestedComponents.length > 0) {
            (0, _Runtime.saveComponentsToWindow)(nestedComponents);
        }
        result = eval(Babel.transform(jsx, { presets: ['react'] }).code);
    } catch (e) {
        error = e;
    } finally {
        return _defineProperty({
            error: error,
            result: result }, "result", result);
    }
}

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _React = __webpack_require__(51);

function createComponent(component) {

    var componentString = (0, _React.convertToReact)(component);

    // eval does not evaluate class if not exclosed in paranthesis.
    return eval(Babel.transform(componentString, { presets: ['react'], plugins: ["transform-es2015-classes"] }).code);
}

module.exports = {
    createComponent: createComponent
};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.convertToReact = convertToReact;

var _markup = __webpack_require__(8);

var _reducers = __webpack_require__(9);

// Elements to  react component.
function convertToReact(component) {

    component.events.forEach(function (event) {
        event.id = event.id.replace("-", "");
    });

    /**
     * Code generation for markup
     * 
     * Markup is edited in three phases.
     * 1. Add props - This function changes markup to include children - helps in composing bigger components. 
     *  For example, lets say an accordion component is created, its behaviour includes expanding contents and
     *  collapsing contents where content could be valid html tags, other components. An easy way to create such 
     *  separated concerns in behaviour is embedding children.
     * 
     * 2. Add Children config - This helps to override child config state from parent and render list of children.
     * 
     * 3. Add events - This helps to bind event listenes to markup 
     */

    var propsInMarkup = (0, _markup.addChildren)(component);
    var childrenMarkup = (0, _markup.addChildrenConfig)(propsInMarkup, component);
    var componentEventedMarkup = (0, _markup.addEvents)(childrenMarkup, component.events, component);

    /**
     * Code generation for reducers
     * 
     * Reducer function are created in a single phase.
     * 
     * getReducers takes a component and returns reducer functions based on following rules.
     * 1. Generation of function name - It appends event id with event name 
     * 2. Generation of function definition
     *      1. Generation of a new state - Creates a new state with help of json.strigify and parse
     *      2. Generation of reducer logic - event reducer is appeneded here. 
     *      3. Generation of publishable event - It also publishes events based on the event type.
     */
    var reducers = (0, _reducers.getReducers)(component);

    var ReactComponent = "(\nclass " + component.name + " extends Component {\n\n    constructor(props) {\n        super(props);\n        this.state = this.props.state || " + component.state + ";\n\n        // Generate css as a separate file on download\n    }\n\n    " + reducers + "\n\n    render() {\n        return (" + componentEventedMarkup + ")\n    }\n})\n";
    return ReactComponent;
}

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.readData = readData;
exports.writeData = writeData;
exports.readComponent = readComponent;
exports.writeComponent = writeComponent;
function pushHistory(components) {

    var editorHistory = readData("ui-editor-history");
    editorHistory.push({
        time: new Date().toString(),
        data: components,
        name: ""
    });
    localStorage.setItem("ui-editor-history", JSON.stringify(editorHistory));
}

// If empty, return empty array.

function readData(key) {

    if (key === "ui-editor") {
        if (!window.components) {
            window.components = JSON.parse(localStorage.getItem(key)) || window.sampleComponents;
        }
        return JSON.parse(JSON.stringify(window.components));
    }
    if (key === "ui-editor-history") {
        var history = localStorage.getItem(key);

        if (history) return JSON.parse(history);
    }
    if (key === "folders") {
        var folders = JSON.parse(localStorage.getItem(key));

        if (folders === null) {
            return window.sampleFolders;
        }
        return folders;
    }

    return [];
}

function writeData(key, components, noPush) {

    if (key == "folders") {
        localStorage.setItem(key, JSON.stringify(components));
    }
    if (key == "ui-editor") {
        console.log("WRITE");
        window.components = components;
        localStorage.setItem(key, JSON.stringify(components));
        if (!noPush) {
            pushHistory(components);
        }
    }
}

function readComponent(componentName) {

    var components = readData("ui-editor");
    if (!components) {
        return undefined;
    }
    return components.find(function (component) {
        return component.name === componentName;
    });
}

function writeComponent(parent) {

    if (!Array.isArray(parent) && parent.name) {
        var components = readData("ui-editor");
        var index = components.findIndex(function (comp) {
            return comp.name === parent.name;
        });
        components[index] = parent;
        writeData("ui-editor", components);
    }
}

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nameToURL = nameToURL;
exports.urlToName = urlToName;
exports.hasAssets = hasAssets;
function nameToURL(style) {
    if (typeof style !== "string") {
        console.error("state should be a string");
    }

    if (window.assets && window.assets.length > 0) {
        var _loop = function _loop() {
            // Replace it with asset blob url
            var assetName = style.split("['")[1].split("]")[0].split("");
            assetName.pop();
            assetName = assetName.join("");
            var asset = window.assets.find(function (asset) {
                return asset.name === assetName;
            });

            style = style.replace("$assets['" + assetName + "']", "url(" + getURL(asset.blob, assetName) + ")");
        };

        // Check if style has $assets
        while (style.includes("$assets")) {
            _loop();
        }
    }

    return style;
}

function urlToName(state) {
    var _loop2 = function _loop2() {
        // Replace it with asset blob url
        var url = state.split("url(")[1].split(")")[0];

        var asset = window.assets.find(function (asset) {
            return asset.url === url;
        });

        if (asset) {

            state = state.replace("url(" + asset.url + ")", "$assets['" + asset.name + "']");
        }
    };

    // Check if style has $assets
    while (state.includes(window.location.host)) {
        _loop2();
    }

    return state;
}

function hasAssets(state) {
    return state.includes("$assets");
}

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactCodemirror = __webpack_require__(5);

var _Publishes = __webpack_require__(56);

var _Publishes2 = _interopRequireDefault(_Publishes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

// Components.

// Events.

var Reducer = function (_Component) {
    _inherits(Reducer, _Component);

    function Reducer(props) {
        _classCallCheck(this, Reducer);

        var _this = _possibleConstructorReturn(this, (Reducer.__proto__ || Object.getPrototypeOf(Reducer)).call(this, props));

        _this.state = {
            publishes: _this.props.reducer.publishes,
            reducer: _this.props.reducer.reducer
        };
        return _this;
    }

    _createClass(Reducer, [{
        key: "addNewPublish",
        value: function addNewPublish() {
            this.setState({
                publishes: (this.state.publishes.push({
                    publishable: true,
                    publishName: "",
                    publishCondition: ""
                }), this.state.publishes)
            });
        }
    }, {
        key: "syncChanges",
        value: function syncChanges() {
            this.props.onChange({
                publishes: this.state.publishes,
                reducer: this.state.reducer
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var reducer = this.state.reducer;
            var publishes = this.state.publishes;

            return (
                // TODO: 1.check save and delete.
                _react2.default.createElement(
                    "div",
                    null,
                    _react2.default.createElement(
                        "div",
                        { "class": "spacing", onMouseLeave: this.syncChanges.bind(this) },
                        _react2.default.createElement(
                            "label",
                            null,
                            "Reducer Definition"
                        ),
                        _react2.default.createElement(_reactCodemirror.UnControlled, {
                            value: reducer,
                            autoCursor: false,
                            options: {
                                lineNumbers: false,
                                mode: "text/javascript",
                                theme: "darcula",
                                indentWithTabs: false,
                                smartIndent: true
                            },
                            onChange: function onChange(editor, data, reducer) {
                                _this2.setState({
                                    reducer: reducer
                                });
                            }
                        })
                    ),
                    _react2.default.createElement(
                        "div",
                        null,
                        "Publishes"
                    ),
                    _react2.default.createElement(
                        "div",
                        null,
                        reducer !== "" ? _react2.default.createElement(
                            "button",
                            { id: "addPublish", onClick: this.addNewPublish.bind(this) },
                            "Add publish"
                        ) : null,
                        publishes.length > 0 ? _react2.default.createElement(_Publishes2.default, { publishes: publishes }) : null
                    )
                )
            );
        }
    }]);

    return Reducer;
}(_react.Component);

exports.default = Reducer;

/***/ }),
/* 55 */,
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Publish = __webpack_require__(57);

var _Publish2 = _interopRequireDefault(_Publish);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

var Publishes = function (_Component) {
    _inherits(Publishes, _Component);

    function Publishes(props) {
        _classCallCheck(this, Publishes);

        var _this = _possibleConstructorReturn(this, (Publishes.__proto__ || Object.getPrototypeOf(Publishes)).call(this, props));

        _this.state = {
            publishes: _this.props.publishes
        };
        return _this;
    }

    _createClass(Publishes, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var publishes = this.state.publishes;

            return _react2.default.createElement(
                "div",
                null,
                publishes.map(function (publish, i) {
                    return _react2.default.createElement(_Publish2.default, {
                        index: i,
                        key: Math.ceil(Math.random() * 1000),
                        publish: publish,
                        onSave: function onSave(data, i) {
                            return _this2.setState({
                                publishes: (publishes[i] = data, publishes) // update list of publishes and return it.
                            });
                        },
                        onDelete: function onDelete(a, i) {
                            return _this2.setState({
                                publishes: (publishes.splice(i, 1), publishes) // delete the publishes and return it.
                            });
                        } });
                })
            );
        }
    }]);

    return Publishes;
}(_react.Component);

exports.default = Publishes;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

// Events.

var Publish = function (_Component) {
    _inherits(Publish, _Component);

    function Publish(props) {
        _classCallCheck(this, Publish);

        var _this = _possibleConstructorReturn(this, (Publish.__proto__ || Object.getPrototypeOf(Publish)).call(this, props));

        _this.state = {
            publishable: _this.props.publish.publishable,
            publishName: _this.props.publish.publishName,
            publishCondition: _this.props.publish.publishCondition
        };
        return _this;
    }

    _createClass(Publish, [{
        key: "onButtonClickSave",
        value: function onButtonClickSave() {
            // Reminder - Never bind inline calls to button. Ruined my morning.
            this.props.onSave(this.state, this.props.index);
        }
    }, {
        key: "onButtonClickdelete",
        value: function onButtonClickdelete() {
            this.props.onDelete(this.state, this.props.index);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var state = this.state;

            return _react2.default.createElement(
                "div",
                null,
                _react2.default.createElement(
                    "div",
                    { "class": "spacing" },
                    _react2.default.createElement(
                        "label",
                        null,
                        "Publishable"
                    ),
                    _react2.default.createElement("input", { type: "checkbox", onChange: function onChange(e) {
                            _this2.setState({ publishable: !state.publishable });
                        }, checked: state.publishable ? "checked" : "" })
                ),
                _react2.default.createElement(
                    "div",
                    null,
                    state.publishable ? _react2.default.createElement(
                        "div",
                        null,
                        _react2.default.createElement(
                            "div",
                            { "class": "spacing" },
                            _react2.default.createElement(
                                "label",
                                null,
                                "Publish Name"
                            ),
                            _react2.default.createElement("input", { type: "text", onChange: function onChange(e) {
                                    _this2.setState({ publishName: e.currentTarget.value });
                                }, value: state.publishName })
                        ),
                        _react2.default.createElement(
                            "div",
                            { "class": "spacing" },
                            _react2.default.createElement(
                                "label",
                                null,
                                "Publish Condition"
                            ),
                            _react2.default.createElement("input", { type: "text", onChange: function onChange(e) {
                                    _this2.setState({ publishCondition: e.currentTarget.value });
                                }, value: state.publishCondition })
                        ),
                        _react2.default.createElement(
                            "button",
                            { id: "savePublish", onClick: this.onButtonClickSave.bind(this) },
                            "Save Publish"
                        ),
                        _react2.default.createElement(
                            "button",
                            { id: "deletePublish", onClick: this.onButtonClickdelete.bind(this) },
                            "Delete Publish"
                        )
                    ) : null
                )
            );
        }
    }]);

    return Publish;
}(_react.Component);

exports.default = Publish;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(59);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, ".events {\n    border:1px solid black;\n    padding: 5px;\n}\n\n.error {\n    color: red;\n}\n\n.tags.tags ul {\n    border: 0px;\n    margin-left: 30px;\n    padding:5px;\n}\n\n.tags ul:first-child {\n    margin-left: -2px;\n}\n\n#saveEvent, #deleteEvent, #addPublish, #deletePublish, #savePublish{\n    font-size: xx-small;\n}", ""]);



/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateEvent = updateEvent;
exports.selectedTagChanged = selectedTagChanged;
exports.deleteEvent = deleteEvent;
exports.updateConfiguration = updateConfiguration;
exports.updateSelectedEvent = updateSelectedEvent;
function updateEvent(event) {
    var element = JSON.parse(JSON.stringify(this.state.component));

    // Keep the child component name as the ID. Will cause problem in future for list rendering boy.
    if (this.state.selectedTag.includes("child-component-")) {
        event.id = this.state.selectedTag.split("child-component-")[1];
    } else {
        event.id = this.state.selectedTag.split("-")[1];
    }
    // Add 
    if (event.index === undefined) {
        element.events.push(event);
    } else {
        // 1. Find the event
        var changedEventIndex = element.events.findIndex(function (e) {
            return e.id === event.id && e.name === event.name;
        });
        if (changedEventIndex == -1) {
            console.error("Changing event name will not help. Create a new event"); // Feature 
        }
        element.events[changedEventIndex] = event;
    }

    this.props.onEventsUpdate(element.events);
}

function highlightItem(id) {
    var style = document.querySelector("#dynamicHighlight");
    if (style) {

        style.innerHTML = "#" + id + " { border: 1px solid #F00; }";
    } else {
        style = document.createElement('style');
        style.id = "dynamicHighlight";
        style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}

function selectedTagChanged(e) {
    var selectedTag = e.currentTarget.value;
    var eventID = "";
    if (selectedTag.includes("child-component-")) {
        eventID = selectedTag.split("child-component-")[1];
    } else {
        eventID = selectedTag.split("-")[1];
    }

    /**
     * Highlight the selected in the preview
     */

    highlightItem(eventID);

    this.setState({
        selectedTag: e.currentTarget.value,
        selectedEventName: "",
        eventID: eventID,
        selectedEvent: {
            name: "",
            reducer: {
                reducer: "",
                publishes: [],
                index: this.props.component.events.length
            }
        }
    });
}

function deleteEvent() {
    var _this = this;

    // Get current component.
    var component = JSON.parse(JSON.stringify(this.state.component));

    // Get selected event index.
    var deleteIndex = component.events.findIndex(function (event) {
        return event.name === _this.state.selectedEventName;
    });

    // Remove the event to be deleted.
    component.events.splice(deleteIndex, 1);

    // Update elements with new events.
    this.props.onEventsUpdate(component.events);
}

function updateConfiguration(config) {
    this.props.onConfigUpdate(config);
}

function updateSelectedEvent(e) {
    var _this2 = this;

    var selectedEvent = this.props.component.events.find(function (event) {
        return event.name === e.currentTarget.value && _this2.state.eventID === event.id;
    });

    if (selectedEvent) {
        this.setState({
            selectedEventName: e.currentTarget.value,
            selectedEvent: selectedEvent
        });
    } else {
        this.setState({
            selectedEventName: e.currentTarget.value,
            selectedEvent: {
                name: e.currentTarget.value,
                reducer: {
                    reducer: "",
                    publishes: [],
                    index: this.props.component.events.length
                }
            }
        });
    }
}

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Runtime = __webpack_require__(4);

__webpack_require__(62);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

// Runtime utilities.

// Styles.

var DynamicComponent = function (_Component) {
    _inherits(DynamicComponent, _Component);

    function DynamicComponent(props) {
        _classCallCheck(this, DynamicComponent);

        var _this = _possibleConstructorReturn(this, (DynamicComponent.__proto__ || Object.getPrototypeOf(DynamicComponent)).call(this, props));

        _this.state = {
            component: _this.props.component
        };

        return _this;
    }

    _createClass(DynamicComponent, [{
        key: "render",
        value: function render() {

            (0, _Runtime.initialiseComponents)(this.props.component);

            if (!window[this.props.component.name]) {
                return null;
            }
            return _react2.default.createElement(
                "div",
                { className: "centerItem" },
                _react2.default.createElement(window[this.props.component.name])
            );
        }
    }]);

    return DynamicComponent;
}(_react.Component);

exports.default = DynamicComponent;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(63);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(2)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// Module
exports.push([module.i, ".hint{\n    height:100px;\n    width:100%;\n    border: 1px dashed green;\n}\n\n.centerItem {\n    width: 40%;\n    margin-left: 11%;\n}", ""]);



/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// Libraries.

var Preview = function (_Component) {
    _inherits(Preview, _Component);

    function Preview(props) {
        _classCallCheck(this, Preview);

        var _this = _possibleConstructorReturn(this, (Preview.__proto__ || Object.getPrototypeOf(Preview)).call(this, props));

        _this.state = {
            name: "",
            configs: []
        };
        return _this;
    }

    _createClass(Preview, [{
        key: "render",
        value: function render() {

            // TODO: Should pass the current data. Instead of accessing it from global
            return _react2.default.createElement("div", { className: "container editor-tab" });
        }
    }]);

    return Preview;
}(_react.Component);

exports.default = Preview;

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactCodemirror = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// Libraries.

var Markup = function (_Component) {
    _inherits(Markup, _Component);

    function Markup(props) {
        _classCallCheck(this, Markup);

        var _this = _possibleConstructorReturn(this, (Markup.__proto__ || Object.getPrototypeOf(Markup)).call(this, props));

        _this.state = {
            markup: _this.props.markup
        };

        return _this;
    }

    _createClass(Markup, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var markup = this.state.markup;
            // TODO: Should pass the current data. Instead of accessing it from global
            return _react2.default.createElement(
                'div',
                { className: 'container editor-tab' },
                _react2.default.createElement(
                    'div',
                    { className: 'editor markup' },
                    _react2.default.createElement(
                        'div',
                        null,
                        'Component Markup'
                    ),
                    _react2.default.createElement(_reactCodemirror.UnControlled, {
                        autoCursor: false,
                        value: markup,
                        options: {
                            lineNumbers: false,
                            mode: "text/javascript",
                            theme: "darcula",
                            indentWithTabs: false,
                            smartIndent: true,
                            lineWrapping: true
                        },
                        onChange: function onChange(editor, data, markup) {
                            _this2.setState({
                                markup: markup
                            });
                        }
                    })
                )
            );
        }
    }]);

    return Markup;
}(_react.Component);

exports.default = Markup;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactCodemirror = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// Libraries.

var Style = function (_Component) {
    _inherits(Style, _Component);

    function Style(props) {
        _classCallCheck(this, Style);

        var _this = _possibleConstructorReturn(this, (Style.__proto__ || Object.getPrototypeOf(Style)).call(this, props));

        _this.state = {
            style: _this.props.style
        };

        return _this;
    }

    _createClass(Style, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var style = this.state.style;

            // TODO: Should pass the current data. Instead of accessing it from global
            return _react2.default.createElement(
                'div',
                { className: 'container editor-tab' },
                _react2.default.createElement(
                    'div',
                    { className: 'editor css' },
                    _react2.default.createElement(
                        'div',
                        null,
                        'Component CSS'
                    ),
                    _react2.default.createElement(_reactCodemirror.UnControlled, {
                        autoCursor: false,
                        value: style,
                        options: {
                            lineNumbers: false,
                            mode: "text/javascript",
                            theme: "darcula",
                            indentWithTabs: false,
                            smartIndent: true,
                            lineWrapping: true
                        },
                        onChange: function onChange(editor, data, style) {
                            _this2.setState({
                                style: style
                            });
                        }
                    })
                )
            );
        }
    }]);

    return Style;
}(_react.Component);

exports.default = Style;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactCodemirror = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// Libraries.

var State = function (_Component) {
    _inherits(State, _Component);

    function State(props) {
        _classCallCheck(this, State);

        var _this = _possibleConstructorReturn(this, (State.__proto__ || Object.getPrototypeOf(State)).call(this, props));

        _this.state = {
            state: _this.props.state
        };
        return _this;
    }

    _createClass(State, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var state = this.state.state;
            // TODO: Should pass the current data. Instead of accessing it from global
            return _react2.default.createElement(
                'div',
                { className: 'container editor-tab' },
                _react2.default.createElement(
                    'div',
                    { className: 'editor state' },
                    _react2.default.createElement(
                        'div',
                        { className: 'title' },
                        'Component State'
                    ),
                    _react2.default.createElement(_reactCodemirror.UnControlled, {
                        autoCursor: false,
                        value: state,
                        options: {
                            lineNumbers: false,
                            mode: "text/javascript",
                            theme: "darcula",
                            indentWithTabs: false,
                            smartIndent: true,
                            lineWrapping: true
                        },
                        onChange: function onChange(editor, data, state) {
                            _this2.setState({
                                state: state
                            });
                        }
                    })
                )
            );
        }
    }]);

    return State;
}(_react.Component);

exports.default = State;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.convertToReact = convertToReact;
exports.convertToReactRedux = convertToReactRedux;

var _markup = __webpack_require__(8);

var _reducers = __webpack_require__(9);

// Elements to  react component.
function convertToReact(component) {

    component.events.forEach(function (event) {
        event.id = event.id.replace("-", "");
    });

    /**
     * Code generation for markup
     * 
     * Markup is edited in three phases.
     * 1. Add props - This function changes markup to include children - helps in composing bigger components. 
     *  For example, lets say an accordion component is created, its behaviour includes expanding contents and
     *  collapsing contents where content could be valid html tags, other components. An easy way to create such 
     *  separated concerns in behaviour is embedding children.
     * 
     * 2. Add Children config - This helps to override child config state from parent and render list of children.
     * 
     * 3. Add events - This helps to bind event listenes to markup 
     */

    var propsInMarkup = (0, _markup.addChildren)(component);
    var childrenMarkup = (0, _markup.addChildrenConfig)(propsInMarkup, component);
    var componentEventedMarkup = (0, _markup.addEvents)(childrenMarkup, component.events, component);

    /**
     * Code generation for reducers
     * 
     * Reducer function are created in a single phase.
     * 
     * getReducers takes a component and returns reducer functions based on following rules.
     * 1. Generation of function name - It appends event id with event name 
     * 2. Generation of function definition
     *      1. Generation of a new state - Creates a new state with help of json.strigify and parse
     *      2. Generation of reducer logic - event reducer is appeneded here. 
     *      3. Generation of publishable event - It also publishes events based on the event type.
     */
    var reducers = (0, _reducers.getReducers)(component);

    var ReactComponent = "\nclass " + component.name + " extends Component {\n\n    constructor(props) {\n        super(props);\n        this.state = this.props.state || " + component.state + ";\n\n        // Generate css as a separate file on download\n        \n        var style = document.createElement('style');\n        style.innerHTML = `" + component.style + "`;\n        style.type = 'text/css';\n        document.getElementsByTagName('head')[0].appendChild(style);\n    }\n\n    " + reducers + "\n\n    render() {\n        return (" + componentEventedMarkup + ")\n    }\n}\n";
    return ReactComponent;
}

function convertToReactRedux(component) {
    // For every publishable event
}

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateEvent = updateEvent;
exports.updateConfig = updateConfig;
exports.saveElement = saveElement;
exports.updateSelectedComponent = updateSelectedComponent;

var _Storage = __webpack_require__(3);

var _findFolders = __webpack_require__(10);

var _Runtime = __webpack_require__(4);

function updateEvent(events) {
    var _this = this;

    // Create new state.
    var newElements = Object.assign({}, this.state).components;
    var selectedComponent = newElements.find(function (element) {
        return element.name === _this.state.selectedComponent.name;
    });

    selectedComponent.events = events;

    // Set state to the new state.
    this.setState({
        elements: newElements
    });

    (0, _Storage.writeData)("ui-editor", newElements);
}

function updateConfig(config) {

    var newElements = Object.assign({}, this.state).components;

    var parent = newElements.find(function (element) {
        return element.name === config.parentName;
    });
    var child = newElements.find(function (element) {
        return element.name === config.childName;
    });

    parent.state = JSON.parse(parent.state);

    if (parent.config === undefined) {
        parent.config = {};
    } else {
        parent.config = JSON.parse(parent.config);
    }
    parent.config[child.name] = config.config;
    if (parent.config[child.name].override) {
        parent.state[child.name] = [JSON.parse(child.state)];
    } else {
        delete parent.state[child.name];
    }

    parent.state = JSON.stringify(parent.state);
    parent.config = JSON.stringify(parent.config);

    this.setState({
        elements: newElements
    });

    (0, _Storage.writeData)("ui-editor", newElements);
}

function saveElement(element) {
    var _this2 = this;

    var components = Array.from(this.state.components);
    var newElement = void 0;

    // Check if element exist.
    var elementExist = components.find(function (component) {
        return component.name === element.name;
    }) || components.find(function (component) {
        return component.name === element.trueName;
    });
    var selectedComponent = components.find(function (component) {
        return component.name === _this2.state.selectedComponent.name;
    });
    var selectedIndex = components.findIndex(function (component) {
        return component.name === _this2.state.selectedComponent.name;
    });
    if (elementExist) {

        if ((0, _Runtime.componentRecursive)(element)) {
            // Edit the config
            var config = JSON.parse(selectedComponent.config);
            config[element.name] = config[element.name] || {};
            config[element.name].override = true;
            selectedComponent.config = JSON.stringify(config);

            // Edit the state.
            var state = JSON.parse(element.state);
            state[element.name] = state[element.name] || [];
            element.state = JSON.stringify(state);
        }

        // Find the element.
        var elementUnderEdit = selectedComponent;

        // Merge.
        elementUnderEdit = Object.assign(elementUnderEdit, element);

        // Push it to original list.
        components[selectedIndex] = elementUnderEdit;
    } else {
        newElement = {
            name: element.name,
            markup: element.markup,
            events: [],
            state: element.state || "{}",
            style: element.style,
            children: [],
            id: Math.ceil(Math.random() * 1000),
            config: "{}"
        };

        delete newElement.trueName;
        components.push(newElement);
        selectedIndex = components.length - 1;

        // Find noFolder
        this.state.folders[0].contents.push(element.name);
        // Push new component into contents.
    }

    if (element.trueName !== element.name && element.trueName !== "") {
        // rename the folder
        // Find the content from folder
        var parent = (0, _findFolders.findParent)(element.trueName, this.state.folders[0]);
        var index = parent.contents.findIndex(function (content) {
            return content === element.trueName;
        });
        parent.contents.splice(index, 1, element.name);
    }

    this.setState({
        elements: components,
        element: {
            name: element.name,
            markup: element.markup,
            style: element.style,
            state: element.state,
            events: element.events || []
        },
        showEditor: false,
        folders: this.state.folders
    });

    (0, _Storage.writeData)("folders", this.state.folders);
    (0, _Storage.writeData)("ui-editor", components);
}

function updateSelectedComponent(componentName, e) {

    // Find the element from state that matches the currently selected element.
    var selectedComponent = components.find(function (component) {
        return component.name === componentName;
    });

    // Update the state with selectedElement.
    this.setState({
        selectedComponent: selectedComponent
    });
}

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.onDeleteComponent = onDeleteComponent;
exports.onExtendComponent = onExtendComponent;
exports.onDeleteFolder = onDeleteFolder;

var _Storage = __webpack_require__(3);

var _findFolders = __webpack_require__(10);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function onDeleteComponent(event) {

    var componentName = this.state.selectedComponent.name;
    var folder = (0, _findFolders.findParent)(componentName, this.state.folders[0]);

    var contentIndex = folder.contents.findIndex(function (content) {
        return content === componentName;
    });
    folder.contents.splice(contentIndex, 1);
    var components = Array.from(this.state.components);

    var index = components.findIndex(function (component) {
        return component.name === componentName;
    });

    components.splice(index, 1);

    this.setState({
        components: components,
        folders: this.state.folders
    });

    (0, _Storage.writeData)("ui-editor", components);
    (0, _Storage.writeData)("folders", this.state.folders);
}

function onExtendComponent() {

    var component = JSON.parse(JSON.stringify(this.state.selectedComponent));
    var folder = (0, _findFolders.findParent)(component.name, this.state.folders[0]);

    component.name = component.name + "_copy";

    folder.contents.push(component.name);

    components.push(component);

    this.setState({
        components: components,
        folders: this.state.folders
    });

    (0, _Storage.writeData)("ui-editor", components);
    (0, _Storage.writeData)("folders", this.state.folders);
}

function onDeleteFolder(TYPE, folderName) {
    var _noFolder$contents;

    var folders = Array.from(this.state.folders);
    var noFolder = folders[0];

    /** Delete the folder. While deleting only the folder, move its contents to parent folder */

    var parentFolder = (0, _findFolders.findParentFolder)(folderName, folders[0]);

    var folderToDelete = (0, _findFolders.findFolder)(folderName, folders[0]);

    switch (TYPE) {
        case "FOLDER_RETAIN_CONTENTS":
            (_noFolder$contents = noFolder.contents).push.apply(_noFolder$contents, _toConsumableArray(folderToDelete.contents));
            var deleteIndex = parentFolder.contents.findIndex(function (content) {
                return (typeof content === "undefined" ? "undefined" : _typeof(content)) === "object" && content.name === folderName;
            });
            parentFolder.contents.splice(deleteIndex, 1);
            this.updateFolders(folders);
            break;

        case "FOLDER_AND_CONTENTS":
            break;

        case "ENTIRE_FOLDER":

            break;
    }
}

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    CONSTANTS: {
        component_name_prefix: "Layout"
    }
};

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(12);

var _reactDom2 = _interopRequireDefault(_reactDom);

__webpack_require__(19);

var _Components = __webpack_require__(22);

var _Components2 = _interopRequireDefault(_Components);

var _Events = __webpack_require__(41);

var _Events2 = _interopRequireDefault(_Events);

var _DynamicComponent = __webpack_require__(61);

var _DynamicComponent2 = _interopRequireDefault(_DynamicComponent);

var _Preview = __webpack_require__(64);

var _Preview2 = _interopRequireDefault(_Preview);

var _Markup = __webpack_require__(65);

var _Markup2 = _interopRequireDefault(_Markup);

var _Style = __webpack_require__(66);

var _Style2 = _interopRequireDefault(_Style);

var _State = __webpack_require__(67);

var _State2 = _interopRequireDefault(_State);

var _export = __webpack_require__(68);

var _Runtime = __webpack_require__(4);

var _Reducer = __webpack_require__(69);

var _Storage = __webpack_require__(3);

var _Events3 = __webpack_require__(70);

var _Constants = __webpack_require__(71);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Libraries.

// Dependencies.


// Components.

// Utility components.

// Reducers.


// Utils


// Constants


var Index = function (_Component) {
    _inherits(Index, _Component);

    function Index(props) {
        _classCallCheck(this, Index);

        var _this = _possibleConstructorReturn(this, (Index.__proto__ || Object.getPrototypeOf(Index)).call(this, props));

        var components = (0, _Storage.readData)("ui-editor");
        _this.state = {
            components: components,
            selectedTag: "",
            component: {
                name: "",
                markup: "",
                style: "",
                state: "{ }",
                events: []
            },
            selectedComponent: "",
            folders: (0, _Storage.readData)("folders"),
            selectedTab: "Events"
        };
        _this.updateConfig = _Reducer.updateConfig.bind(_this);
        _this.updateEvent = _Reducer.updateEvent.bind(_this);
        _this.saveElement = _Reducer.saveElement.bind(_this);
        _this.updateSelectedComponent = _Reducer.updateSelectedComponent.bind(_this);
        document.onkeydown = function keydown(e) {
            if (e.altKey && e.keyCode == 69) {
                // Alt + E
                // Open/close editor if any component is selected
                this.setState({
                    showEditor: !this.state.showEditor
                });
            }
        }.bind(_this);
        window.refreshComponents = _this.refreshComponents.bind(_this);
        return _this;
    }

    _createClass(Index, [{
        key: "refreshComponents",
        value: function refreshComponents() {
            this.setState({
                components: window.components
            });
        }
    }, {
        key: "updateFolders",
        value: function updateFolders(folders) {
            this.setState({
                folders: folders
            });
            (0, _Storage.writeData)("folders", folders);
        }
    }, {
        key: "openEditor",
        value: function openEditor() {
            this.setState({
                showEditor: true
            });
        }
    }, {
        key: "exportReact",
        value: function exportReact(e) {
            window.visited = {};
            var nestedComponents = (0, _Runtime.getNestedComponents)(this.state.selectedComponent);
            // nested components contain duplicates. we need to remove it
            var uniqueComponents = {};
            nestedComponents.forEach(function (component) {
                if (!uniqueComponents[component.name]) {
                    uniqueComponents[component.name] = component;
                }
            });
            console.log(Object.values(uniqueComponents).map(_export.convertToReact).join("\n\n"));
        }
    }, {
        key: "render",
        value: function render() {
            var selectedComponent = this.state.selectedComponent || this.state.component;
            window.components.forEach(_Runtime.initialiseComponents);
            return _react2.default.createElement(
                "div",
                null,
                _react2.default.createElement(_Components2.default, {
                    components: this.state.components,
                    folders: this.state.folders,
                    selectedComponent: this.state.selectedComponent,
                    title: "Components",
                    key: Math.ceil(Math.random() * 1000),

                    onOpenEditor: this.openEditor.bind(this),
                    onSelection: this.updateSelectedComponent,
                    onFoldersUpdate: this.updateFolders.bind(this)
                }),
                _react2.default.createElement(_DynamicComponent2.default, { onSave: this.props.onSave, key: Math.ceil(Math.random() * 1000), component: selectedComponent }),
                _react2.default.createElement(_Preview2.default, null),
                _react2.default.createElement(_Markup2.default, { markup: selectedComponent.markup, key: Math.ceil(Math.random() * 1000) }),
                _react2.default.createElement(_Style2.default, { style: selectedComponent.style, key: Math.ceil(Math.random() * 1000) }),
                _react2.default.createElement(_State2.default, { state: selectedComponent.state, key: Math.ceil(Math.random() * 1000) }),
                _react2.default.createElement(_Events2.default, {
                    key: Math.ceil(Math.random() * 1000),
                    component: selectedComponent,
                    selectedTag: this.state.selectedTag,
                    components: this.state.components,
                    onEventsUpdate: this.updateEvent,
                    onConfigUpdate: this.updateConfig,
                    title: "Events"
                })
            );
        }
    }]);

    return Index;
}(_react.Component);

console.log("Source code https://github.com/imvetri/ui-editor");
_reactDom2.default.render(_react2.default.createElement(Index, null), document.getElementById("index"));

/***/ })
]]);