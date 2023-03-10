// Import the fs module
const fs = require("fs");

// Import the parse module
const parse = require("csv-parse");

// import cli-progress
const cliProgress = require("cli-progress");

// Import axios
const axios = require("axios");

// Import async
const async = require("async");

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

  return axios(config)
    .then(function (response) {
      if (response.data.success) {
        // check if the email exists in the validated.csv file
        if (
          fs
            .readFileSync("./validated/validated.csv")
            .toString()
            .includes(email)
        ) {
          return;
        }

        // If the email is not found in the validated.csv, insert it
        fs.appendFile("./validated/validated.csv", email + "\n", (err) => {
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

// create a new async queue with a maximum concurrency limit of 10
const q = async.queue((task, callback) => {
  validate(task.email)
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
            // push each email to the queue
            q.push({ email: row[0] });
          }
        })
        .on("end", function () {
          // stop the progress bar
          bar1.stop();
        });
    });
  });
});
