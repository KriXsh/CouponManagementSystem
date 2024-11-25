export default {
    appEnv: process.env.NODE_ENV,
    application: {
        port: process.env.PORT,
        token: process.env.TOKEN,
        isMaintenance: false,
        maintenanceMessage: "Scheduled maintenance activity is going on, we will be available soon.",
        versionNumbers: process.env.VERSIONS
    },
    storage: {
        databases: {
            mongo: {
                database: process.env.MONGO_DB,
                reader: process.env.MONGO_DB_READER,
                writer: process.env.MONGO_DB_WRITER,
            }
        }
    }
}