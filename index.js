// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';



// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const radios = document.getElementsByName('roll');
const roll = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

// Add Firebase project configuration object here
var firebaseConfig = {
  apiKey: "AIzaSyDu2Xzgi3muCL-_HK8IrIhoHFQI4Z7dNJo",
  authDomain: "fir-web-codelab-87bea.firebaseapp.com",
  databaseURL: "https://fir-web-codelab-87bea.firebaseio.com",
  projectId: "fir-web-codelab-87bea",
  storageBucket: "fir-web-codelab-87bea.appspot.com",
  messagingSenderId: "496635145946",
  appId: "1:496635145946:web:dca9bbc62451dec4dabfe3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());


// Listen to RSVP button clicks
startRsvpButton.addEventListener("click",
 () => {
   if (firebase.auth().currentUser) {
     firebase.auth().signOut();
   } else {
    ui.start("#firebaseui-auth-container", uiConfig);
   }
});

firebase.auth().onAuthStateChanged((user) => {
  if(user) {
    startRsvpButton.textContent = "LOGOUT " + user.displayName; // TODO show id
    guestbookContainer.style.display = "block";
    subscribeGuestbook();

  } else {
    startRsvpButton.textContent = "RSVP";
    guestbookContainer.style.display = "none";
    unsubscribeGuestbook();
  }
});

function randomRoll(max) {
  return 1 + Math.floor(Math.random() * Math.floor(max))
}
// Listen to the form submission
form.addEventListener("submit", (e) => {
 // Prevent the default form redirect
 let elements = Array.from(radios)
 let rolls = elements.map(element =>
    ({
        id: element.id,
        value: element.value,
        checked: element.checked
    })
  );
let selected = rolls.filter(roll => roll.checked == true)[0]
let roll = randomRoll(selected.value)

 e.preventDefault();
 // Write a new message to the database collection "guestbook"
 firebase.firestore().collection("guestbook").add({
   text: input.value,
   rollType: selected.value,
   rollValue: roll,
   timestamp: Date.now(),
   name: firebase.auth().currentUser.displayName,
   userId: firebase.auth().currentUser.uid
 })
 // clear message input field
 input.value = ""; 
 // Return false to avoid redirect
 return false;
});

function subscribeGuestbook() {
  guestbookListener = firebase.firestore().collection("guestbook")
    .orderBy("timestamp", "desc")
    .limit(10)
    .onSnapshot((snaps) => {
      // Reset page
      
      guestbook.innerHTML = "";
      // Loop through documents in database
      snaps.forEach((doc) => {
        // Create an HTML entry for each document and add it to the chat
        const entry = document.createElement("p");
        entry.textContent = doc.data().name + ": " + doc.data().text + " -> "+ doc.data().rollValue + " / " + doc.data().rollType;
        guestbook.appendChild(entry);
      });

    }, function(error) {
      console.error("Error getting document: ", error);
        // Reset page
      guestbook.innerHTML = "";
      const entry = document.createElement("p");
      entry.textContent = error;
      guestbook.appendChild(entry);
    });

}
// Unsubscribe from guestbook updates
function unsubscribeGuestbook(){
  guestbook.innerHTML = "";
 if (guestbookListener != null)
 {
   guestbookListener();
   guestbookListener = null;
 }
};