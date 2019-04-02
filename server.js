const express = require("express")
const bodyParser = require("body-parser")
// const { Client } = require("pg")
const mysql = require("mysql")
const credentials = require("./credentials")
const app = express()
const cors = require("cors")
// support parsing of application/json type post data
app.use(bodyParser.json())
let uuidv1 = require("uuid/v1")
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())

const client = new mysql.createConnection({
  user: credentials.user,
  password: credentials.password,
  database: credentials.database,
  host: credentials.host
})

client.connect(err => {
  if (err) {
    console.log(err)
  } else {
    console.log("Connected to DB ")
  }
})

app.get("/", (req, res) => {
  res.redirect("/user")
})

// Create User, Partner And Gateway

app.post("/createuser", (req, res) => {
  const { email, username } = req.body
  try {
    const newUserId = uuidv1()
    const newPartnerId = uuidv1()

    const gatewayQuery = `INSERT INTO cloud.gateways (id, name, ip) VALUES ('Gateway-${newPartnerId}', 'Gateway-${newPartnerId}', '1.1.1.1');`
    client.query(gatewayQuery, (err, results) => {
      if (err) {
        res.send(err)
        console.log("gatewayQuery", err)
      } else {
        console.log("Gateway CREATED")
      }
    })

    const partnerQuery = `INSERT INTO cloud.partner (id, name, gateway_id) VALUES ('${newPartnerId}', 'Partner-${newPartnerId}', 'Gateway-${newPartnerId}');`
    client.query(partnerQuery, (err, results) => {
      if (err) {
        res.send(err)
        console.log("partnerQuery", err)
      } else {
        console.log("Partner CREATED")
      }
    })
    const userQuery = `INSERT INTO cloud.user (id, email, phone, partner_id, role_id, username) VALUES ('${newUserId}', '${email}', '1111111111', '${newPartnerId}', 1, '${username}');`

    client.query(userQuery, (err, results) => {
      if (err) {
        res.send("userQuery", err)
        console.log(err)
      } else {
        console.log("USER CREATED")
      }
    })

    res.send({ newPartnerId })
  } catch (err) {
    console.log("Query Error", err)
    res.send({ err })
  }
})

// Update Partner Name

app.post("/updatepartner", (req, res) => {
  const { partner_id, partnerName } = req.body.partner
  const query = `UPDATE cloud.partner SET name = '${partnerName}' WHERE (id = '${partner_id}');`
  client.query(query, (err, results) => {
    if (err) {
      res.send(err)
      console.log(err)
    } else {
      res.send(results)
      console.log("Partner Updated", results)
    }
  })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log("We Are Live On Port ", port)
})
