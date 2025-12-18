const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  //console.log(process);
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://fullstack:${password}@cluster0.zv4eutg.mongodb.net/?appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personsSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personsSchema);

if (process.argv.length === 5) {
  // console.log(process.argv[3])
  // console.log(process.argv[4])
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });
  person.save().then((result) => {
    //console.log(result)
    console.log(`added ${result.name} number ${result.number} to phonebook
`);
    mongoose.connection.close();
  });
}

if (process.argv.length === 3) {
  console.log("phonebook:")
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  });
}
