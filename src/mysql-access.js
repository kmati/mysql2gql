const mysql = require('mysql');

class MySqlAccess {
    constructor(dbConfig) {
        this.db = null;
        this.dbConfig = dbConfig;
        this.tables = {};
    }

    // dbConfig: An object with these properties:
    // - host
    // - user
    // - password
    // - database
    connect() {
        return new Promise((resolve, reject) => {
            this.db = mysql.createConnection(this.dbConfig);
            this.db.connect((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    disconnect() {
        this.db.end();
        this.db = null;
    }

    select(sql) {
        return new Promise((resolve, reject) => {
            try {
                this.db.query(sql, (err, results, fields) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            } catch(err) {
                reject(err);
            }
        });
    }

    getTablesAndColumns() {
        const sql = `select table_name, column_name, is_nullable, data_type, column_key, extra
            from information_schema.columns
            WHERE TABLE_SCHEMA = '${this.dbConfig.database}'
            ORDER BY table_name ASC, ordinal_position ASC`;
        return this.select(sql)
            .then(rows => {
                for (const row of rows) {
                    let table = this.tables[row.table_name];
                    if (!table) {
                        this.tables[row.table_name] = {
                            columns: []
                        };
                        table = this.tables[row.table_name];
                    }
                    table.columns.push({
                        columnName: row.column_name,
                        isNullable: 'YES' === row.is_nullable,
                        type: row.data_type,
                        isPKColumn: 'PRI' === row.column_key,
                        autoIncrement: 'auto_increment' === row.extra
                    });
                }
            })
    }

    normalizeType(type) {
        if (type.toLowerCase().indexOf('int') > -1) {
            return 'Int';
        } else if (type.toLowerCase().indexOf('float') > -1 ||
            type.toLowerCase().indexOf('double') > -1) {
                return 'Float';
        } else if (type.toLowerCase().indexOf('bit') > -1) {
            return 'Boolean';
        } else {
            return 'String';
        }
    }

    emitGraphQLType(tableName, table) {
        const { columns } = table;

        const columns = table.columns.map(column => {
            return `${column.columnName}: ${this.normalizeType(column.type)}`;
        });

        return `type ${tableName} {
            ${columns.join(', ')}
        }`;
    }

    generateGraphQLSchema() {
        this.connect()
            .then(() => this.getTablesAndColumns())
            .then(() => {
                const graphQlTypes = '';
                for (const tableName in this.tables) {
                    graphQlTypes += this.emitGraphQLType(tableName, this.tables[tableName]) + '\n';
                }
                return graphQlTypes;
            });
    }
}