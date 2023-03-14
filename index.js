const fs = require("fs");
const parse = require("csv-parse");
const cliProgress = require("cli-progress");
const axios = require("axios");
const async = require("async");
<<<<<<< HEAD
require("dotenv").config();

=======
require('dotenv').config()



>>>>>>> main
function validate(email, fileName, progressBar) {
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "http://localhost:9292?email=" + email,
    headers: {
      Authorization: process.env.ACCESS_TOKEN,
      Accept: "application/json",
    },
  };

  return axios(config)
    .then(function (response) {
      if (response.data.success) {
        // check if the email exists in the validated file
<<<<<<< HEAD
        const validatedFileName = `./validated/${fileName.slice(
          0,
          -4
        )}_validated.csv`;
        const fileExists = fs.existsSync(validatedFileName);
        if (
          fileExists &&
          fs.readFileSync(validatedFileName).toString().includes(email)
=======
        const validatedFileName = `./validated/${fileName.slice(0, -4)}_validated.csv`;
        const fileExists = fs.existsSync(validatedFileName);
        if (
          fileExists &&
          fs
            .readFileSync(validatedFileName)
            .toString()
            .includes(email)
>>>>>>> main
        ) {
          return;
        }

        // If the email is not found in the validated file, insert it
        if (!fileExists) {
          fs.writeFileSync(validatedFileName, "email\n");
        }
        fs.appendFileSync(validatedFileName, email + "\n");
      }
    })
    .catch(function (error) {
      // Commented to prevent console.log from spamming
      // console.log(error);
      // validate(email);
    })
    .finally(function () {
      progressBar.increment();
    });
}

// create a new async queue with a maximum concurrency limit of 10
const q = async.queue((task, callback) => {
  validate(task.email, task.fileName, task.progressBar)
    .then(() => callback())
    .catch((err) => callback(err));
}, 10);

q.drain(() => {
  console.log("All items have been processed");
});

// Open the csv folder and loop through the files
fs.readdir("./csv", (err, files) => {
  files.forEach((file) => {
    console.log("Reading File: " + file);

    // create a new progress bar instance and use shades_classic theme
    const bar1 = new cliProgress.SingleBar(
      {
        format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total} Emails",
      },
      cliProgress.Presets.shades_classic
    );

    var exec = require("child_process").exec;

    exec("wc -l ./csv/" + file, function (error, results) {
      // get the line count
      let lineCount = results.split(" ")[0];

      var count = 0;

      bar1.start(lineCount, 0);

      // create the validated file
      const validatedFileName = `./validated/${file.slice(0, -4)}_validated.csv`;
      if (!fs.existsSync(validatedFileName)) {
        fs.writeFileSync(validatedFileName, "email\n");
      }

      // open csv file
      fs.createReadStream("./csv/" + file)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
          // validate the string to see if its an email
          if (row[0].includes("@")) {
            // push each email and the file name to the queue
            q.push({
              email: row[0],
              fileName: file,
              progressBar: bar1,
            });
          }
        })
        .on("end", function () {
          // stop the progress bar
          bar1.stop();

          // count
          let validatedEmailCount = 0;

          // read the validated file and count the number of lines (excluding header)
          const validatedEmails = fs.readFileSync(validatedFileName).toString();
          validatedEmailCount = validatedEmails.split(/\r?\n/).length - 1;
    
          console.log(
            `${validatedEmailCount} emails found valid in file ${file}`
          );
        });
    });
});
});    