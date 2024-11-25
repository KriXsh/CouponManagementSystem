import developmentConfig from './development.js';

const env = process.env.NODE_ENV || "development";

let config;

switch (env) {
    case 'development':
        config = developmentConfig;
        break;
    default:
        console.error(`Unknown environment: ${env}`);
        process.exit(1);
}

export default config;