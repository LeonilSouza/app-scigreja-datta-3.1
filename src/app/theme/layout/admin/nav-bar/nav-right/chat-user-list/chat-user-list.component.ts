// angular import
import { Component, effect, inject, output } from '@angular/core';

// project import
import { FriendsList } from 'src/app/fack-db/friends-list';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FriendComponent } from './friend/friend.component';
import { DataFilterPipe } from 'src/app/theme/shared/filter/data-filter.pipe';
import { ScrollbarComponent } from 'src/app/theme/shared/components/scrollbar/scrollbar.component';
import { ThemeService } from 'src/app/theme/shared/service1/theme.service';

@Component({
  selector: 'app-chat-user-list',
  imports: [SharedModule, FriendComponent, DataFilterPipe, ScrollbarComponent],
  templateUrl: './chat-user-list.component.html',
  styleUrls: ['./chat-user-list.component.scss']
})
export class ChatUserListComponent {
  private themeService = inject(ThemeService);

  // public props
  ChatCollapse = output();
  ChatToggle = output();
  friendsList: object;
  searchFriends: string;
  direction: string = 'ltr';

  // constructor
  constructor() {
    this.friendsList = FriendsList.friends;
    effect(() => {
      this.rerenderChartOnDirectionChange(this.themeService.isRtlTheme());
    });
  }

  // public method
  onChatOn(friend_id) {
    this.ChatToggle.emit(friend_id);
  }

  // private method
  private rerenderChartOnDirectionChange(isRtl: boolean) {
    this.direction = isRtl === true ? 'rtl' : 'ltr';
  }
}
