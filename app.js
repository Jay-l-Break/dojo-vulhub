const Koa = require('koa')
const { Client } = require('pg')

const app = new Koa()
const client = new Client({
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "example",
    host: process.env.DB_HOST || "localhost",
    port: 5432
})
client.connect()

app.use(async ctx => {
    ctx.response.type = 'html'

    let id = ctx.request.query.id || 1
    let sql = `SELECT * FROM "user" WHERE "id" = ${id}`
    const res = await new Promise((resolve, reject) => {
        client.query(sql, (error, result) => {
            if (error) reject(error)
            else resolve(result)
        })
    })

    ctx.body = `<html>
                    <body>
                        <table>
                            <tr><th>id</th><td>${res.rows[0].id}</td></tr>
                            <tr><th>name</th><td>${res.rows[0].name}</td></tr>
                            <tr><th>score</th><td>${res.rows[0].score}</td></tr>
                        </table>
                    </body>
                </html>`
})

app.listen(80, "0.0.0.0")
