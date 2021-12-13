const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'PostgresSql',
  database: 'postgres',
  password: 'root',
  port: 5432
});

client.connect();

const Time = require("../../lib/Time.js");

module.exports = {
	SqlLoop(){
		client.query(`DELETE FROM posts WHERE "like" <= 0
			OR "like" < dislike
			AND EXTRACT(DAY FROM current_timestamp - created_at ) >= 1;`);
		setTimeout(this.SqlLoop,Time.hour(8));
	}
}