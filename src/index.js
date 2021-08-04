const { response, request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

// Middleware

function veriryIfExistsAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: "Customer not found" });
    }

    request.customer = customer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === "credit") {
            return acc + operation.amount;
        } else if (operation.type === "debit") {
            return acc - operation.amount;
        }
    }, 0);
    return balance;
}

app.post("/account", (req, res) => {
    const { cpf, name } = req.body;

    const customerAlreadyExistis = customers.some(
        (customer) => customer.cpf === cpf
    );

    if (customerAlreadyExistis) {
        return res.status(400).json({ error: "Customer already exists" });
    }

    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id,
        statement: []
    });

    return res.status(201).send();
});

app.use(veriryIfExistsAccountCPF);

app.get("/statement", (req, res) => {
    const { customer } = req;
    return res.json(customer.statement);
})

app.post("/deposit", (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return res.status(201).send();
})

app.post("/withdraw", (req, res) => {
    const { amount } = req.body;
    const { customer } = req;

    const balance = getBalance(customer.statement);

    console.log(balance);

    if (balance < amount) {
        return res.status(400).json({ error: "Insuficient funds" });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation);

    return res.status(201).send();
})

app.get("/statement/date", (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");

    const statements = customer.statement.filter((statement) =>
        statement.created_at.toDateString() === new Date(dateFormat).toDateString()
    );

    return res.json(statements);
})

app.put("/account", (req, res) => {

    const { name } = req.body;
    const { customer } = request;

    customer.name = name;

    return res.status(201).send();
});

app.get("/account", (req, res) => {
    const { customer } = request;
    return res.status(201).json(customer);
});

app.delete("/account", (req, res) => {
    const { customer } = request;

    customers.splice(customer, 1);

    return res.status(201).json(customers);
})

app.get("/balance", (req, res) => {
    const { customer } = request;
    balance = getBalance(customer.statement);
    return res.status(201).json(balance);
});

app.listen(3333);