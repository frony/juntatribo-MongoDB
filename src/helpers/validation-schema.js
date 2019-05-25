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
