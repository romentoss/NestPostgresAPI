import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors:true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss:Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService:JwtService
    
    ) {

  }
  async handleConnection(client: Socket) {
    const token  = client.handshake.headers.authentication as string;
    let payload:JwtPayload
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);

    } catch (error) {
      client.disconnect();
      return;
    }
    console.log({token});
    
    
  


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
          fullName: this.messagesWsService.getUserFullNameBySocketId(client.id),
          message: payload.message || 'no-message!!'
        });
  }
  // message-from-client
}
