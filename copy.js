
const getArgs = () => {
  const args = process.argv.slice(2);

  const namedArgs = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const argName = args[i].slice(2);

      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        namedArgs[argName] = args[i + 1];
        i++;
      } else {
        namedArgs[argName] = true;
      }
    }
  }

  return namedArgs;
};

try {
  const { MongoClient } = require('mongodb');

  let sourceDB, targetDB, sourceURL, targetURL;

  if (process.argv.slice(2).length) {
    const args = getArgs()
    sourceDB = process.argv.slice(2)[0]
    targetDB = process.argv.slice(2)[1]
    sourceURL = args?.source
    targetURL = args?.target
  } else {
    console.log(`\x1b[1mUsage:\x1b[1m \x1b[96m<sourceDBname> <targetDBname>\x1b[0m \x1b[90m--source\x1b[1m \x1b[96m<sourceDBurl>\x1b[0m \x1b[90m--target\x1b[1m \x1b[96m<targetDBurl>\x1b[0m`);
    return;
  }

  async function copyDatabase(s, t, a, b) {
    const client = new MongoClient(a)

    const client2 = new MongoClient(b)

    try {
      console.log('\x1b[1m\x1b[93mStarting the operation.\x1b[0m');
      await client.connect()
      await client2.connect()
      console.log('\x1b[1m\x1b[96mConnected to the mongodb.\x1b[0m');

      const sourceDb = client.db(s);

      const sourceCollections = await sourceDb.listCollections().toArray();

      if(!sourceCollections.length) {
        console.log('\x1b[1m\x1b[91mNo collection found in your database.\x1b[0m');
        return process.exit(-1)
      }

      for (const collectionInfo of sourceCollections) {
        console.log(`\x1b[1m\x1b[97mCopying the collection: \x1b[0m\x1b[1m\x1b[93m${collectionInfo.name}\x1b[0m`);
        const sourceCollection = sourceDb.collection(collectionInfo.name);
        const targetCollection = client2.db(t).collection(collectionInfo.name);

        const documents = await sourceCollection.find({}).toArray();
        await targetCollection.insertMany(documents);
        console.log(`\x1b[1m\x1b[92mSuccess\x1b[0m`);
      }

      console.log('\x1b[1m\x1b[94mDatabase copy completed. enjoy (●\'\u25A1\'●)\x1b[0m');
      process.exit(-1);
    } catch (err) {
      console.error('\x1b[1m\x1b[91mError copying database:\x1b[0m\n', err);
      process.exit(-1);
    } finally {
      client.close();
      client2.close()
    }
  }
  if(sourceDB && targetDB && sourceURL && targetURL) copyDatabase(sourceDB, targetDB, sourceURL, targetURL)
  else console.log(`\x1b[1mUsage:\x1b[1m \x1b[96m<sourceDBname> <targetDBname>\x1b[0m \x1b[90m--source\x1b[1m \x1b[96m<sourceDBurl>\x1b[0m \x1b[90m--target\x1b[1m \x1b[96m<targetDBurl>\x1b[0m`);
} catch (error) {
  const args = getArgs()

  if(args?.debug && error) {
    console.error(error)
    if(error.message.includes('Cannot find module \'mongodb\'')) {
      console.log(`\x1b[32mYou can try installing the dependency using:\x1b[1m \x1b[93myarn add mongodb\x1b[0m \x1b[0mor\x1b[1m \x1b[93mnpm i mongodb\x1b[0m\n\nYou might need to run \x1b[1m\x1b[93mnpm init \x1b[0mor \x1b[1m\x1b[93myarn init\x1b[0m`);
      return
    } else {
      console.log(`\x1b[32mYou can try installing the dependency using:\x1b[1m \x1b[93myarn\x1b[0m \x1b[90mor\x1b[1m \x1b[93mnpm i\x1b[0m\n\nYou might need to run \x1b[1m\x1b[93mnpm init \x1b[0mor \x1b[1m\x1b[93myarn init\x1b[0m`);
      return
    }
  }
  console.log(`\x1b[32mFirst install the dependency using:\x1b[1m \x1b[93myarn\x1b[0m \x1b[90mor\x1b[1m \x1b[93mnpm i\x1b[0m\nYou might need to run \x1b[1m\x1b[93mnpm init \x1b[0mor \x1b[1m\x1b[93myarn init\x1b[0m\n\n\nYou can pass --debug to view the error log`);

}
