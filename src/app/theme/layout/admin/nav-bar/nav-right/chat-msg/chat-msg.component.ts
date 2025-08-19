// angular import
import { Component, ElementRef, OnInit, Renderer2, inject, viewChild, output, input } from '@angular/core';

// project import
import { FriendsList } from 'src/app/fack-db/friends-list';
import { UserChat } from 'src/app/fack-db/user-chat';
import { ScrollbarComponent } from 'src/app/theme/shared/components/scrollbar/scrollbar.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-chat-msg',
  imports: [SharedModule, ScrollbarComponent],
  templateUrl: './chat-msg.component.html',
  styleUrls: ['./chat-msg.component.scss']
})
export class ChatMsgComponent implements OnInit {
  private rend = inject(Renderer2);

  // public props
  readonly friendId = input(undefined);
  ChatToggle = output();
  readonly newChat = viewChild('newChat', { read: ElementRef });
  friendsList: object;
  userChat: object;
  message: string;
  message_error: boolean;
  friendWriting: boolean;
  newReplay: string | undefined;
  // eslint-disable-next-line
  chatMessage: any;

  // constructor
  constructor() {
    this.newReplay = '';
  }

  // life cycle event
  ngOnInit() {
    this.friendsList = FriendsList.friends;
    this.userChat = UserChat.chat;
    this.chatMessage = findObjectByKeyValue(this.friendsList, 'id', this.friendId());
    if (this.chatMessage) {
      const message = findObjectByKeyValue(this.userChat, 'friend_id', this.friendId());
      if (message) {
        this.chatMessage['chat'] = message['messages'];
      }
    }
  }

  // public method
  sentMsg(flag) {
    if (this.message === '' || this.message === undefined) {
      this.message_error = true;
    } else {
      if (flag === 1) {
        this.message_error = false;
      } else {
        this.message_error = false;
        const temp_replay = this.message;

        const html_send =
          '<div class="media chat-messages">' +
          '<div class="media-body chat-menu-reply">' +
          '<div class="">' +
          '<p class="chat-cont">' +
          this.message +
          '</p>' +
          '</div>' +
          '<p class="chat-time">now</p>' +
          '</div>' +
          '</div>';

        this.newReplay = this.newReplay + html_send;
        this.message = '';

        setTimeout(() => {
          // this.componentRef.directiveRef.scrollToBottom();
        }, 100);
        this.friendWriting = true;
        setTimeout(() => {
          this.friendWriting = false;
          const html_replay =
            '<div class="media chat-messages">' +
            '<a class="media-left photo-table" href="javascript:">' +
            '<img class="media-object img-radius img-radius m-t-5" src="' +
            this.chatMessage.photo +
            '" alt="' +
            this.chatMessage.name +
            '">' +
            '</a>' +
            '<div class="media-body chat-menu-content">' +
            '<div class="">' +
            '<p class="chat-cont">hello superior personality you write</p>' +
            '<p class="chat-cont">' +
            temp_replay +
            '</p>' +
            '</div>' +
            '<p class="chat-time">now</p>' +
            '</div>' +
            '</div>';
          this.newReplay = this.newReplay + html_replay;
          setTimeout(() => {
            // this.componentRef.directiveRef.scrollToBottom();
          }, 100);
        }, 3000);
      }
    }
  }
}

function findObjectByKeyValue(array, key, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return array[i];
    }
  }
  return false;
}
