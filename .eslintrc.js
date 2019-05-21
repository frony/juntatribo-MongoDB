module.exports = {
    "extends": "airbnb-base",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules":{
        // "comma-dangle": 0,
        "no-param-reassign": ["error", { "props": false }],
        "prefer-destructuring": ["warn"]
    }
};