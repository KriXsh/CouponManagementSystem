import config from '../config/index.js';
const { application } = config;

import { standardManageError } from '../controllers/failureHandler.js';

/**
 * @description Tracks request body (payload) of every request
 */
const trackRequest = (err, req, res, next) => {
    console.error(`${err.type} - ${err.message}`);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return standardManageError(req, res, 'Bad Request! (Requested payload is not valid JSON)', 'badRequest');
    }
    next();
};

const preventClickjacking = (req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
};

const logRequest = (req, res, next) => {
    console.log(`Date[${new Date().toISOString()}] Api-${req.method} ${req.url} from IP ${req.ip}`);
    next();
};

/**
 * @description Tracks maintenance activity on each request
 */
const trackMaintenanceActivity = (req, res, next) => {
    if (application.isMaintenance) {
        return standardManageError(req, res, application.maintenanceMessage, 'maintenance');
    } else {
        next();
    }
};

export {
    trackMaintenanceActivity,
    trackRequest,
    preventClickjacking,
    logRequest,
};
