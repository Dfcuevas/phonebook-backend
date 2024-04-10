require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const Person = require("./mongo");

app.use(cors());

// La siguiente linea de codigo hace que express muestre contenido estatico, la pagina index.html y el js, ext. Es un middleware integrado de express
app.use(express.static("dist"));

app.use(express.json());

const errorHandler = (error, request, response, next) => {
  console.log(
    "Se ejecuta el manejo de los errores con el middleware. ",
    error.message
  );

  if (error.name === "CastError") {
    return response.status(400).send({ error: `Malformated id` });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.get("/", (reques, response) => {
  response.send("<h1>Hola Mundo backend Personas</h1>");
});

app.get("/api/people", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.post("/api/people", (request, response) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

app.delete("/api/people/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((personDelete) => {
      if (personDelete) {
        console.log("Usuario Eliminado", personDelete);
        response.status(204).end();
      } else {
        console.log("No se encontró ningún usuario con ese ID");
      }
    })
    .catch((error) => next(error));
});

app.put("/api/people/:id", (request, response, next) => {
  const updatedData = request.body;
  const personId = request.params.id;

  Person.findByIdAndUpdate(personId, updatedData, { new: true })
    .then((personUpdated) => {
      console.log("Datos de la persona actualizados", personUpdated);
      response.json(personUpdated);
    })
    .catch((error) => next(error));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
