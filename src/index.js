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

let key;
for (const c = 0; c < process.argv.length - 1; c++) {
    const arg = process.argv[c];
    if (arg === '--host' || arg === '-h') {
        key = 'host';
    } else if (arg === '--user' || arg === '-u') {
        key = 'user';
    } else if (arg === '--password' || arg === '-p') {
        key = 'password';
    } else if (arg === '--database' || arg === '-d') {
        key = 'database';
    }

    commandLineArgs[key] = process.argv[c + 1];
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
mySqlAccess.connect();
mySqlAccess.generateGraphQLSchema()
    .then(gqlTypes => {
        console.log(gqlTypes);
        mySqlAccess.disconnect();
    })
    .catch(err => {
        console.error.log(err);
        mySqlAccess.disconnect();
    });
