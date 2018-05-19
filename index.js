/**
 * @author Nicolas BONNEAU
 * @description A parser function to parser reference into an object
 * @version 1.0.0
 */

const objectPath = require('object-path');
const extend = require('extend');

// Export or define or add to global
;
(function(global, factory) {

    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        global.refParser = factory();

}(this, function factory() {
    'use strict';

    return function(opts) {

        const ObjectReference = function(opts) {

            const options = {
                "referenceCharKey": '%',
                "recursive": true,
                "global": {}
            }

            extend(true, options, opts);

            this._opts = options;
        }

        /**
         * The parser function
         * 
         * Cette fonction parcours toutes les clés de l'object recursivement afin d'en trouver 
         * les valeurs de type string contenant une chaîne de caractères répondant à l'expression régulière suivante: /\%.*\%/g
         * Si une clé A a pour valeur "%B%" cela signifie que A pointe vers B, alors la valeur de A sera remplacée par la valeur de B.
         * De ce fait, si B a pour valeur un Object alors la A et B pointent vers le même Object.
         * Dans le cas ou A a pour valeur "this is the B value: %B%", alors uniquement la chaîne de caractère "%B%" sera remplacée par la valeur de B.toString().
         * De ce fait, si B est un Object alors A aura pour valeur "this is the B [Object Object]".
         * 
         * Une référence peut être un chemin vers une valeur, par exemple si A a pour valeur "%B.C%" alors A sera remplacé par la valeur de la clé C de l'objet B.
         * Si une référence n'est pas trouvé alors la valeur n'est pas remplacé
         * 
         * Le répertoire racine par défaut est "process.cwd()"
         * 
         * @param {object} data         The object to parse
         * @param {object|null} global  The global object reference
         */
        ObjectReference.prototype.parse = function(data) {

            if (typeof data !== "object") {
                return;
            }

            // Extend data from global data
            extend(true, data, this._opts.global);

            // Call parser function
            (function parser(data, global, objectReference) {
                Object.keys(data).forEach((key) => {
                    // If value is an object (Object or Array) and recursive option is true
                    if (typeof data[key] === "object" && objectReference._opts.recursive) {
                        // Parse object
                        parser(data[key], global, objectReference);
                    }
                    // Else if value is a string and one or more references are present inside it
                    else if (typeof data[key] === "string" && objectReference.hasReferences(data[key])) {
                        // Parse references
                        data[key] = objectReference.parseReferences(data[key], global);
                    }
                    // Nothing to do
                });
            })(data, data, this);

            return this;
        };

        /**
         * Parse a string with value from "object" argument
         * If no value is found for a reference then keep initial value
         * Return the parsed string
         * 
         * @param {string} value  The string to parse
         * @param {object} object The object to search reference
         * @return
         */
        ObjectReference.prototype.parseReferences = function(value, object) {

            let result = value;

            // Extract reference keys
            this.getReferenceKeys(value)
                // Iterate on each reference key
                .forEach((referenceKey) => {

                    // Set reference value to reference key
                    let referenceValue = referenceKey;

                    // While one or more references are present inside 
                    while (this.hasReferences(referenceValue)) {
                        // Get reference key value
                        referenceValue = objectPath.get(object, referenceValue.replace(new RegExp(this._opts.referenceCharKey, 'g'), ''));
                    }

                    if (referenceValue) {
                        result = value === referenceKey ? referenceValue : result.replace(referenceKey, referenceValue);
                    }
                });

            return result;
        }

        /**
         * Set ObjectReference options
         * 
         * @param {object} opts The ObjectReference options
         * @return
         */
        ObjectReference.prototype.setOptions = function(opts) {
            opts = opts || {};

            opts.referenceCharKey = opts.referenceCharKey || this._opts.referenceCharKey;
            opts.recursive = opts.recursive !== undefined ? opts.recursive : this._opts.recursive;
            opts.global = opts.global || this._opts.global;

            this._opts = opts;

            return this;
        }

        /**
         * Extract all references from a string
         * Return an array of string references
         * 
         * @param {string} str 
         * @param {string} referenceCharKey 
         * @return
         */
        ObjectReference.prototype.getReferenceKeys = function(str, referenceCharKey = null) {
            referenceCharKey = referenceCharKey || this._opts.referenceCharKey;
            return str.match(new RegExp(referenceCharKey + '[a-z\.0-9A-Z_]*' + referenceCharKey, 'g')).filter(this.isValidReference.bind(this));
        }

        /**
         * Return true if string contains one or more references
         * 
         * @param {string} str 
         * @param {string} referenceCharKey 
         * @return
         */
        ObjectReference.prototype.hasReferences = function(str, referenceCharKey = null) {
            referenceCharKey = referenceCharKey || this._opts.referenceCharKey;
            return new RegExp(referenceCharKey + '[a-z\.0-9A-Z_]*' + referenceCharKey, 'g').test(str);
        }

        /**
         * Return true if val is a reference
         * 
         * @param {string} val 
         * @param {string} referenceCharKey 
         * @return
         */
        ObjectReference.prototype.isValidReference = function(val, referenceCharKey = null) {
            referenceCharKey = referenceCharKey || this._opts.referenceCharKey;
            return val !== referenceCharKey + '' + referenceCharKey;
        }

        // Instanciate ObjectReference
        return new ObjectReference(opts);
    }
}));