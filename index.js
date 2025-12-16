const express = require("express");
const morgan = require('morgan')
const cors = require('cors')
const app = express();

morgan.token('body', (req, res) => {
  if(req.method === 'POST'){
    return JSON.stringify(req.body)
  }
})

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const requestLogger = (request,response, next) => {
  console.log('Method:', request.method)
  console.log('Path:', request.path)
  console.log('Body', request.body)
  console.log('---')
  next()
}

app.use(express.json());
// app.use(requestLogger)
// app.use(morgan('tiny'))
app.use(morgan(':method :url :status :response-time ms :body'))
app.use(cors())
app.use(express.static('dist'))

app.get("/info", (request, response) => {
  const now = new Date();
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>
        ${now}</p>`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  console.log(id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generatedId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((person) => person.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  } else if (
    persons.some((person) => person.name.toLowerCase() === body.name.toLowerCase())
  ) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generatedId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const unknowEndpoint = (request,response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknowEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
