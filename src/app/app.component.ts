import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import SockJS from 'sockjs-client';
import {Client, Message, StompSubscription} from '@stomp/stompjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'web-test';

  private stompClient : Client;
  private subscription: StompSubscription | null = null;

  messages: string[] = []
  isConnected = false

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => {
        let ws = new SockJS('http://localhost:8085/ws');
        console.log("SockJS Connection Created");
        return ws;
      },
      reconnectDelay: 1000,
      debug: (msg: string) => console.log(msg),
    });
    console.log(typeof this.stompClient);  }

  ngOnInit(): void {
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

  ngOnDestroy() {
    console.log('AppComponent ngOnDestroy'); // Added
    this.subscription?.unsubscribe();
    this.stompClient.deactivate();
  }

}
