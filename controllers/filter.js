/**
 * @description Generates MongoDB filter object
 */

import { ObjectId } from 'mongodb';

const operators = {
    $eq: '$eq',
    $ne: '$ne',
    $gt: '$gt',
    $lt: '$lt',
    $ge: '$gte',
    $gte: '$gte',
    $le: '$lte',
    $lte: '$lte',
    $in: '$in',
    $nin: '$nin',
    $sw: '$sw',
    $ew: '$ew',
    $so: '$so',
    $and: '$and',
    $or: '$or',
};

/**
 * INTERNAL Function to find conjunction in a string
 * @param {string} string 
 * @returns {string} $and/$or
 */
const findConjunction = (string) => {
    // It only checks the first operator
    const pattern = /(\$and|\$or)/i;
    const groups = string.match(pattern);
    return groups ? groups[0].toLowerCase() : '$and';
};

/**
 * INTERNAL Function to parse each condition
 * @param {string} string 
 * @returns {Object|null} Valid MongoDB filter object for one condition only
 */
const eachCondition = (string) => {
    const pattern = /([^\$]+)\s+(\$[a-z]+)\s+([^\$]+)\s*/i;
    const match = string.match(pattern);
    if (!match) return null;

    let [, key, operator, value] = match;
    operator = operators[operator.toLowerCase()];
    if (!operator) return null;

    key = key.trim();
    value = value.trim();

    if (key === '_id') {
        if (operator === '$in' || operator === '$nin') {
            value = value.split(/\s*,\s*/).map((each) => ObjectId(each));
        } else {
            value = ObjectId(value);
        }
    } else {
        if (operator === '$in' || operator === '$nin') {
            value = value.split(/\s*,\s*/);
        } else {
            // Attempt to parse value as JSON
            try {
                value = JSON.parse(value);
            } catch (e) {
                // If parsing fails, keep value as string
                // console.log('Could not parse value:', value);
            }
        }
    }

    return { [key]: { [operator]: value } };
};

/**
 * INTERNAL Function to process each section of the filter string
 * @param {string} string
 * @returns {Object|null} Valid MongoDB filter object
 */
const eachSection = (string) => {
    const pattern = /\s+\$and\s+|\s+\$or\s+/i;
    const array = string.split(pattern);
    const filters = array.map((elem) => eachCondition(elem)).filter((x) => x);
    if (!filters.length) return null;
    if (filters.length > 1) {
        const conj = findConjunction(string);
        return { [conj]: filters };
    } else {
        return filters[0];
    }
};

/**
 * PUBLIC Function to parse filter string into MongoDB filter object
 * @param {string} string
 * @returns {Promise<Object>} Valid MongoDB filter object
 */
const parse = async (string) => {
    try {
        if (!string) return {};
        const result = eachSection(string.trim()) || {};
        return result;
    } catch (e) {
        console.error('Error parsing filter string:', e);
        return {};
    }
};

export default parse ;
