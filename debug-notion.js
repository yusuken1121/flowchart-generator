const { Client } = require("@notionhq/client");
console.log("Client version check:", require("@notionhq/client/package.json").version);

const client = new Client({ auth: "secret_test" });

if (client.databases) {
    console.log("client.databases exists");
    console.log("Keys on client.databases:", Object.keys(client.databases));
    // Check prototype as methods are usually on the prototype
    const proto = Object.getPrototypeOf(client.databases);
    console.log("Prototype keys:", Object.getOwnPropertyNames(proto));
    
    if (client.databases.query) {
        console.log("client.databases.query is a function");
    } else {
        console.log("client.databases.query is MISSING");
    }
} else {
    console.log("client.databases MISSING");
}
