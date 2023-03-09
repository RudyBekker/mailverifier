// Path: index.js

// Import the fs module
const fs = require("fs");

// Import the parse module
const parse = require("csv-parse");

// import cli-progress
const cliProgress = require("cli-progress");

// Import axios
const axios = require("axios");

function validate(email) {
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "http://localhost:9292?email=" + email,
    headers: {
      Authorization: "xxxyyy",
      Accept: "application/json",
    },
  };

  axios(config)
    .then(function (response) {
      if (response.data.success) {
        // check if the email exists in the validated.txt file
        if (
          fs
            .readFileSync("./validated/validated.txt")
            .toString()
            .includes(email)
        ) {
          return;
        }

        // If the email is not found in the validated.txt, insert it
        fs.appendFile("./validated/validated.txt", email + "\n", (err) => {
          if (err) throw err;
        });
      }
    })
    .catch(function (error) {
      // Commented to prevent console.log from spamming
      // console.log(error);
      // validate(email);
    });
}

// Open the csv folder and loop through the files
fs.readdir("./csv", (err, files) => {
  files.forEach((file) => {
    console.log("Reading File: " + file);

    // create a new progress bar instance and use shades_classic theme
    const bar1 = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );

    var exec = require("child_process").exec;

    exec("wc -l ./csv/" + file, function (error, results) {
      // get the line count
      let lineCount = results.split(" ")[3];

      var count = 0;

      bar1.start(lineCount, 0);

      // open csv file
      fs.createReadStream("./csv/" + file)
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
          // validate the string to see if its an email
          if (row[0].includes("@")) {
            validate(row[0]);
          }
        });
    });

    // stop the progress bar
    bar1.stop();
  });
  
});
