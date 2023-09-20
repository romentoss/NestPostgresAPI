import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';

@WebSocketGateway({ cors:true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss:Server;

  constructor(
    private readonly messagesWsService: MessagesWsService
    
    ) {

  }
  handleConnection(client: Socket) {
    this.messagesWsService.registerClient(client);


    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
    
    
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
    
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client:Socket, payload:NewMessageDto ){
    console.log(payload);
    
    //! Emite únicamente al cliente
    // client.emit('message-from-server',{
    //   fullName:'Soy Yo!',
    //   message: payload.messages || 'no-message!!'
    // });

    //! Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server',{
    //   fullName:'Soy Yo!',
    //   message: payload.messages || 'no-message!!'
    // });this.messagesWsService.getUserFullName(client.id)
    
    this.wss.emit('message-from-server',{
          fullName: 'holaaa',
          message: payload.message || 'no-message!!'
        });
  }
  // message-from-client
}
