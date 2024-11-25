import { MongoClient, ObjectId } from 'mongodb';
import parse from './filter.js';
import config from '../config/index.js';

// Configurations
const { databases } = config.storage;
const client = new MongoClient(databases.mongo.writer);

let db;
/**
 * @description Connects to the database
 */
const connect = async () => {
    try {
        await client.connect();
        db = client.db(databases.mongo.database);
        console.log('Database connection established successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};
connect();


 
/**
 * @description gets document from a collection applying filters
 */
const get = async (collection, filterString) => {
    try {
        const lower = collection.toLowerCase();
        const filters = await parse(filterString);
        const result = await db.collection(lower).findOne(filters);
        return result;
    } catch (exception) {
        console.error("Exception:", exception);
        throw exception;
    }
};

/**
 * @description Gets documents from a collection applying filters
 */
const getMany = async (collection, filterString) => {
    try {
        const lower = collection.toLowerCase();
        const filters = await parse(filterString);
        const result = await db.collection(lower).find(filters).toArray();
        return result;
    } catch (exception) {
        console.error("Exception:", exception);
        throw exception;
    }
};

/**
 * @description Inserts one or more documents into a collection
 */
const insert = async (collection, data) => {
    try {
        const lower = collection.toLowerCase();
        const result = await db.collection(lower).insertMany(data);
        return result;
    } catch (exception) {
        console.error("Exception:", exception);
        throw exception;
    }
};

/**
 * @description Updates one document in a collection
 */
const update = async (collection, filterString, data) => {
    try {
        const lower = collection.toLowerCase();
        const filters = await parse(filterString);
        const result = await db.collection(lower).updateOne(filters, { $set: data });
        return result;
    } catch (exception) {
        console.error("Exception:", exception);
        throw exception;
    }
};

const getDocById = (collection, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let lower = collection.toLowerCase()
            const result = await db.collection(lower).findOne({ _id: new ObjectId(id) })
            console.log(result)
            return resolve(result)
        }
        catch (exception) {
            console.error("exception", exception)
            return reject(exception)
        }
    })
}

const updateDocById = (collection, id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let lower = collection.toLowerCase()
            console.log(data)
            const result = await db.collection(lower).updateOne({ _id: new ObjectId(id) }, { $set: data })
            return resolve(result)
        }
        catch (exception) {
            return reject(exception)
        }
    })
}


let deleteDoc = (collection, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let lower = collection.toLowerCase()
            const result = await db.collection(lower).deleteOne({ _id: new ObjectId(id) })
            console.log(result)
            return resolve(result)
        }
        catch (exception) {
            return reject(exception)
        }
    })
}

export{
    get,
    getMany,
    insert,
    update,
    deleteDoc,
    getDocById,
    updateDocById
}

