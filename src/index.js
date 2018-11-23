#!/usr/bin/env node
const MySqlAccess = require('./mysql-access');

function usage() {
    console.log(`Usage:\n${process.argv[0]} ${process.argv[1]} --host {{hostname or IP address}} --user {{username}} --password {{password}} --database {{database name}}`);
}

const commandLineArgs = {
    host: null,
    user: null,
    password: null,
    database: null
};

for (let c = 0; c < process.argv.length - 1; c++) {
    const arg = process.argv[c];
    if (arg === '--host' || arg === '-h') {
        commandLineArgs.host = process.argv[c + 1];
    } else if (arg === '--user'|| arg === '-u') {
        commandLineArgs.user = process.argv[c + 1];
    } else if (arg === '--password' || arg === '-p') {
        commandLineArgs.password = process.argv[c + 1];
    } else if (arg === '--database' || arg === '-d') {
        commandLineArgs.database = process.argv[c + 1];
    }
}

if (!commandLineArgs.host ||
    !commandLineArgs.user ||
    !commandLineArgs.password ||
    !commandLineArgs.database) {
        usage();
        process.exit(1);
        return;
}

const mySqlAccess = new MySqlAccess(commandLineArgs);
mySqlAccess.generateGraphQLSchema()
    .then(gqlTypes => {
        console.log(gqlTypes);
        mySqlAccess.disconnect();
    })
    .catch(err => {
        console.error(err);
        mySqlAccess.disconnect();
    });
