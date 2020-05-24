// Your web app's Firebase configuration
var config = {
    apiKey: "AIzaSyApsjixqhSXJymutt8BuqGAB7OX_V9GP1k",
    authDomain: "test-project-f581c.firebaseapp.com",
    databaseURL: "https://test-project-f581c.firebaseio.com",
    projectId: "test-project-f581c",
    storageBucket: "test-project-f581c.appspot.com",
    messagingSenderId: "766030272262",
    appId: "1:766030272262:web:3e3d4e4d7d1993a90b7087",
    measurementId: "G-0XCTCNKS9K"
  };

// Initialize Firebase
firebase.initializeApp(config);
var database = firebase.database();

// 2. Button for adding trains
$("#add-train-btn").on("click", function(event) {
    event.preventDefault();
  
    // Grabs user input
    var trainName = $("#name-input").val().trim();
    var trainDestination = $("#destination-input").val().trim();
    var trainTime = moment($("#time-input").val(), "h:mm").format("HH:mm");
    var trainFrequency = $("#frequency-input").val().trim();
  
    // Creates local "temporary" object for holding employee data
    var newTrain = {
      name: trainName,
      destination: trainDestination,
      time: trainTime,
      frequency: trainFrequency
    };
  
    // Uploads employee data to the database
    database.ref().push(newTrain);
  
    // Logs everything to console
    console.log(newTrain.name);
    console.log(newTrain.destination);
    console.log(newTrain.time);
    console.log(newTrain.frequency);
  
    alert("Train successfully added");
  
    // Clears all of the text-boxes
    $("#name-input").val("");
    $("#destination-input").val("");
    $("#time-input").val("");
    $("#frequency-input").val("");
});
  
function findNextArrival(train) {
    // Express the departure in minutes
    const array = train.time.split(":");
    const h0 = array[0];
    const m0 = array[1];
    const t0 = 60 * h0 + m0;

    // Express the current time in minutes
    const currentTime = new Date();

    const h1 = currentTime.getHours();
    const m1 = currentTime.getMinutes();
    const t1 = 60 * h1 + m1;

    // Number of trips that can be made between t0 and t1
    const numTripsMade = Math.max(Math.floor((t1 - t0) / train.frequency), 0);
    
    // Find the arrival time
    const arrivalTime = t0 + (numTripsMade + 1) * train.frequency;
    
    let d = 0;
    let h = Math.floor(arrivalTime / 60);
    let m = arrivalTime - 60 * h;

    // Account for departure on another day
    if (h >= 24) {
        d = Math.floor(h / 24);
        h = h % 24;
    }
    
    return {
        "nextArrival": [d, h, m],
        "minutesAway": arrivalTime - t1
    };
}

function displayTime(timeArray) {
    // Get the day, hour, and minute
    let d = timeArray[0];
    let h = timeArray[1];
    let m = timeArray[2];

    // Display the period
    const period = (0 <= h && h < 12) ? "AM": "PM";

    // Display the hour
    h = h % 12;

    if (h === 0) {
        h = 12;
    }

    // Display the minute
    if (m < 10) {
        m = "0" + m;
    }

    // Display the day
    if (d === 0) {
        return `${h}:${m} ${period}`

    } else if (d === 1) {
        return `${h}:${m} ${period}, in ${d} day`;

    } else {
        return `${h}:${m} ${period}, in ${d} days`;

    }
}


// 3. Create Firebase event for adding employee to the database and a row in the html when a user adds an entry
database.ref().on("child_added", function(childSnapshot) {
    console.log(childSnapshot.val());
    // Store everything into a variable.
    var trainName = childSnapshot.val().name;
    var trainDestination = childSnapshot.val().destination;
    var trainTime = childSnapshot.val().time;
    var trainFrequency = childSnapshot.val().frequency;
  
    // Employee Info
    console.log(trainName);
    console.log(trainDestination);
    console.log(trainTime);
    console.log(trainFrequency);

    const info = findNextArrival(childSnapshot.val());
    // Create the new row
    var newRow = $("<tr>").append(
      $("<td>").text(trainName),
      $("<td>").text(trainDestination),
      $("<td>").text(trainTime),
      $("<td>").text(trainFrequency + " min"),
      $("<td>").text(displayTime(info.nextArrival)),
      $("<td>").text(info.minutesAway),
    );
  
    // Append the new row to the table
    $("#train-table > tbody").append(newRow);
});