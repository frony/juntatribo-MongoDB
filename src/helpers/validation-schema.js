'use strict';

exports.registrationSchema = {
  'username': {
    notEmpty: true,
    isEmail: {
      errorMessage: 'Invalid Email'
    }
  },
  'password': {
    notEmpty: true,
    isLength: {
      options: [{ min: 12}],
      errorMessage: 'Must be at least 12 characters'
    },
    matches: {
      options: ['(?=.*[a-zA-Z])(?=.*[0-9]+).*', 'g'],
      errorMessage: 'Password must be alphanumeric.'
    },
    errorMessage: 'Invalid password'
  }
};

exports.songSchema = {
  'title': {
    notEmpty: true,
    isAlphanumeric: true,
    errorMessage: `The song title can't be empty and must be alphanumeric`,
  },

  'artist': {
    notEmpty: true,
    isAlphanumeric: true,
    errorMessage: `The artist name can't be empty and must be alphanumeric`,
  },

  'genre': {
    notEmpty: true,
    isAlphanumeric: true,
    errorMessage: `The genre can't be empty and must be alphanumeric, separated by commas`,
  },

  'tags': {
    notEmpty: true,
    isAlphanumeric: true,
    errorMessage: `The tags can't be empty and must be alphanumeric, separated by commas`,
  },

  'file': {
    notEmpty: true,
    isAlphanumeric: true,
    errorMessage: `The music file can't be empty`,
    fileType: {
      errorMessage: `Please upload the correct file type`,
    }
  }
};

exports.timelineRangeSchema = {
  'startDate' : {
    isDate: true,
    notEmpty: false
  },
  'endDate' : {
    isDate: true,
    notEmpty: false
  }
};
