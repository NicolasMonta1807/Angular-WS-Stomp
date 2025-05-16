# Angular WebSocket STOMP Example

This project is an Angular application that demonstrates how to connect to a WebSocket server using the STOMP protocol. It receives messages from a specific topic and displays them in the application.

## Key Features

* **WebSocket Connection:** Establishes a real-time connection with a WebSocket server.
* **STOMP Protocol:** Uses the STOMP (Simple Text Oriented Messaging Protocol) for messaging over WebSockets.
* **Message Reception:** Subscribes to a specific topic on the server to receive messages.
* **Dynamic Display:** Displays received messages in the Angular component.

## Libraries

This application uses the following libraries:

- `sockjs-client`:  Provides a WebSocket-like object that works across browsers. It uses native WebSockets if available, and falls back to other techniques if necessary.

- `@stompjs/stompjs`:  A library for using STOMP over WebSockets. It simplifies sending and receiving messages using the STOMP protocol.

## Pre-Configuration and fixes needed

Some Angular applications, especially those that use libraries that expect a global window object (common in WebSocket handling), may encounter errors. The following configuration can help resolve these issues:

1. Create `window-global-fix.ts` under the `src` folder with this content

```typescript
(window as any).global = window;
```

This line adds a global property to the window object, making the window object itself available as a global variable named global. Some libraries expect this global variable to exist.

2. Add file to `angular.json` configuration: 

In your `angular.json` file, under `projects -> your-project-name -> architect -> build -> options -> polyfills` section, add the path to the `window-global-fix.ts` file:

```json 
{
  "polyfills": [
    "zone.js",
    "src/window-global-fix.ts"
  ]
}
```

3. Add file to `tsconfig.app.json` configuration:

In your `tsconfig.app.json` file, add the path to `window-global-fix.ts` to the `files` array:

```json
{
  "files": [
    "src/main.ts",
    "src/window-global-fix.ts"
  ]
}
```

## Code Explanation

The core logic of the application resides in the `AppComponent` component. Let's break down the code:

### Imports

The component imports necessary modules and libraries:

```typescript
import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import SockJS from 'sockjs-client';
import {Client, Message, StompSubscription} from '@stomp/stompjs';
```

- Component, OnInit, OnDestroy: Angular decorators and interfaces for component lifecycle management.

- CommonModule: Provides common Angular directives like *ngFor and *ngIf.

- SockJS: A library that provides a fallback mechanism for WebSockets, using other transports if WebSockets are not available.

- Client, Message, StompSubscription: Classes and interfaces from the @stomp/stompjs library for working with STOMP.

### Component definition

```typescript

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'web-test'; //Not used
  private stompClient: Client;
  private subscription: StompSubscription | null = null;
  messages: string[] = [];
  isConnected = false;

// ...
}
```

The AppComponent is defined as an Angular component.

- It uses CommonModule

- It has a template (app.component.html) and styles (app.component.css). Where the visual elements are defined

- It implements OnInit and OnDestroy to handle component lifecycle events.

I- t declares variables to hold the STOMP client, subscription, received messages, and connection status. title is declared but not used.-

### Constructor

```typescript
constructor()
{
  this.stompClient = new Client({
    webSocketFactory: () => {
      let ws = new SockJS('http://localhost:8085/ws');
      console.log("SockJS Connection Created");
      return ws;
    },
    reconnectDelay: 1000,
    debug: (msg: string) => console.log(msg),
  });
  console.log(typeof this.stompClient);
}
```

- The constructor initializes the STOMP client (this.stompClient).

- WebSocket Connection URL: The webSocketFactory function is crucial. It creates a new SockJS connection to the WebSocket server at 'http://localhost:8085/ws'. This URL is where your WebSocket server is running. Important: Ensure this URL is correct and your server is running.

- reconnectDelay:  Configures the client to attempt to reconnect after a disconnect, with a delay of 1000ms.

- debug:  A function that logs STOMP client debug messages to the console.

### OnInit

```typescript
ngOnInit()
{
  this.stompClient.onConnect = (frame) => {
    console.log('STOMP Connected: ', frame);
    this.isConnected = true;

    this.subscription = this.stompClient.subscribe('/topic/sensor-data', (message: Message) => {
      console.log('Received message:', message.body); // Log received messages
      this.messages.push(message.body);
    });
  };

  this.stompClient.onDisconnect = () => {
    console.log('STOMP Disconnected');
    this.isConnected = false;
  };

  this.stompClient.onStompError = (frame) => {
    console.error('STOMP Broker error: ', frame.headers['message']);
    console.error('STOMP Details: ', frame.body);
  };

  this.stompClient.activate();
}
```

- The ngOnInit method is called when the component is initialized.

- It sets up event handlers for the STOMP client:

  - onConnect:  Called when the client connects to the server. It logs the connection, sets isConnected to true, and subscribes to the /topic/sensor-data topic.

  - Topic Subscription: The application subscribes to the /topic/sensor-data topic on the STOMP server. Any messages sent to this topic by the server will be received by this component. (**Refer to this function to create handlers for content updating**)

  - onDisconnect: Called when the client disconnects from the server. It logs the disconnection and sets isConnected to false.

  - onStompError:  Called when a STOMP error occurs. It logs the error details.

- this.stompClient.activate():  Starts the STOMP client and initiates the connection.


