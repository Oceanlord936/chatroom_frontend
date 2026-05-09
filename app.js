const BACKEND = "https://lunar-recoup-foster.ngrok-free.dev";

let ws = null;
let currentUser = "";

let sendButton = document.getElementById("send-button");
let messageInput = document.getElementById("message-input");
let chatBox = document.getElementById("chat-box");

let loadMessages = function() {
    fetch(BACKEND + "/messages", {
        method: "GET",
        credentials: "include",
        headers: {
            "ngrok-skip-browser-warning": "true"
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        data.messages.reverse().forEach(function(msg) {
            let p = document.createElement("p");
            p.innerText = msg.username + ": " + msg.content;
            chatBox.append(p);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
};

// switch to signup section
document.getElementById("go-signup").onclick = function() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("signup-section").style.display = "block";
};

// switch back to login section
document.getElementById("go-login").onclick = function() {
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
};

let enterChat = function(username) {
    currentUser = username;
    document.getElementById("login-section").style.display = "none";
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";

    loadMessages();

    ws = new WebSocket("wss://lunar-recoup-foster.ngrok-free.dev/chat?username=" + currentUser);
    ws.onmessage = function(event) {
        let p = document.createElement("p");
        p.innerText = event.data;
        chatBox.append(p);
        chatBox.scrollTop = chatBox.scrollHeight;
    };
};

// sign up =======================================
let signUpButton = document.getElementById("signup-button");
let signUpUsername = document.getElementById("signup-username");
let signUpPass = document.getElementById("signup-password");
let signUpError = document.getElementById("signup-message");

signUpButton.onclick = function() {
    fetch(BACKEND + "/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        },
        credentials: "include",
        body: JSON.stringify({ username: signUpUsername.value, password: signUpPass.value })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            enterChat(data.username);
        } else {
            signUpError.innerText = data.message;
        }
    });
};

// login ===================================
let loginButton = document.getElementById("login-button");
let usernameInput = document.getElementById("login-username");
let passInput = document.getElementById("login-password");
let loginError = document.getElementById("login-error");

loginButton.onclick = function() {
    fetch(BACKEND + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        },
        credentials: "include",
        body: JSON.stringify({ username: usernameInput.value, password: passInput.value })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            enterChat(data.username);
        } else {
            loginError.innerText = data.message;
        }
    });
};

// send message ===================================
sendButton.onclick = function() {
    let message = messageInput.value;
    if (message === "") return;
    ws.send(message);
    messageInput.value = "";
};
