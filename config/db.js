const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT
})

try {
	pool.connect()
	console.log('Connected to database')
} catch (error) {
	console.log(error)
}

module.exports = pool;