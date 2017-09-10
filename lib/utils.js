/* Utility Functions/Helpers */

'use strict';

const isPalindrome = (msg) => {
    let msgArr = msg.split('');
    return msg === msgArr.reverse().join('');
};

module.exports = {
    isPalindrome
};
