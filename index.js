require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(express.json());
const Person = require("./models/person");

morgan.token("body", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

// const requestLogger = (request,response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:', request.path)
//   console.log('Body', request.body)
//   console.log('---')
//   next()
// }
// app.use(requestLogger)
// app.use(morgan('tiny'))

app.use(morgan(":method :url :status :response-time ms :body"));
app.use(cors());
app.use(express.static("dist"));

app.get("/info", (request, response) => {
  Person.countDocuments({}).then((count) => {
    console.log(count);
    const now = new Date();
    response.send(`<p>Phonebook has info for ${count} people</p><p>${now}</p>`);
  });
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// const generatedId = () => {
//   const maxId =
//     Person.length > 0 ? Math.max(...Person.map((person) => person.id)) : 0;
//   return maxId + 1;
// };

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatePerson) => {
      response.json(updatePerson);
    })
    .catch((error) => next(error));
});

const unknowEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknowEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on por ${PORT}`);
});
