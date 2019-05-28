'use strict';

const debug = require('debug')('app:helpers/form-validation');
const { songSchema } = require('./validation-schema');


/**
 * Helper file to validate forms
 * @return {validateSongForm}
 */
function formValidation() {
  /**
   * Return true if it's not alphaNumeric
   *  and false if it is alphaNumeric
   * @param {Array} formField
   * @return {boolean}
   */
  function isNotAlphanumeric(formField) {
    const regex = /[\w]+[\s]?[\w]?/;
    debug(`${formField[0]}: ${formField[1]}`);
    return !(regex.test(formField[1]));
  }

  /**
   * Validate file type
   *  against an array of valid types for a specific medium
   *  Ex:
   *    music: ['audio/mp3']
   *    video: ['video/webm']
   * @param {Object} file
   * @param {String} medium
   * @return {boolean}
   */
  function isvalidFileType(file, medium='music') {
    let validTypes = [];
    if (medium === 'music') {
      validTypes = ['audio/mp3'];
    } else if (medium === 'video') {
      validTypes = ['video/webm', 'video/ogg'];
    }
    return validTypes.includes(file.type);
  }

  /**
   * Validate add song form fields
   * @param {Object} fields
   * @param {Object} file
   * @return {Array}
   */
  function validateSongForm(fields, file) {
    const formFields = Object.entries(fields);
    // let errorMessages = [];
    let errorMessages = formFields.filter(isNotAlphanumeric).map(field => {
      let error = {
        param: field[0],
        errorMessage: songSchema[field[0]].errorMessage,
      };
      return error;
    });

    if (file.size < 1 || isNotAlphanumeric(['file', file.name])) {
      let error = {
        param: 'file',
        errorMessage: songSchema['file'].errorMessage,
      };
      errorMessages.push(error);
    }

    if (!isvalidFileType(file)) {
      let error = {
        param: 'file',
        errorMessage: songSchema['file'].fileType.errorMessage,
      };
      errorMessages.push(error);
    }

    debug(errorMessages);
    return errorMessages;
  }

  return {
    validateSongForm,
  };
}

module.exports = formValidation;
