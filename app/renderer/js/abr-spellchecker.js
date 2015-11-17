var files = require.main.require("../files.js");

function loadDictionary (lang, callback) {
    function getLoadPromise (lang, ext) {
        return new Promise (function (resolve, reject) {
            files.readFile(__dirname + "/../dict/" + lang + "/" + lang + "." + ext, function (data) {
                resolve({
                    ext: ext,
                    data: data
                });
            });
        });
    }
    if (typeof Typo === "undefined") {
        return console.error("Typo.js not found");
    }
    var pAff = getLoadPromise(lang, "aff"),
        pDic = getLoadPromise(lang, "dic");
    Promise.all([pAff, pDic]).then(function (response) {
        if (response && response[0].ext === "aff") {
            return {
                aff: response[0].data,
                dic: response[1].data
            };
        } else {
            return {
                aff: response[1].data,
                dic: response[0].data
            };
        }
    }).then(callback);
}

function AbrSpellchecker (lang, abrDoc) {
    this.dictionaries = {};
    this.activeDictionary = null;
    this.abrDoc = abrDoc;
    if (lang) {
        this.setDictionary(lang);
    }
}

AbrSpellchecker.prototype = {
    setDictionary: function (lang, forceReload) {
        lang = lang || "en_US";
        if (this.dictionaries[lang] && forceReload !== true) {
            this.activeDictionary = this.dictionaries[lang];
            return;
        }
        var that = this;
        console.time("load " + lang);
        loadDictionary(lang, function (dictData) {
            console.timeEnd("load " + lang);
            console.time("create " + lang);
            that.dictionaries[lang] = new Typo(lang, dictData.aff, dictData.dic);
            that.activeDictionary = that.dictionaries[lang];
            console.timeEnd("create " + lang);
        });
    }
};

module.exports = AbrSpellchecker;
