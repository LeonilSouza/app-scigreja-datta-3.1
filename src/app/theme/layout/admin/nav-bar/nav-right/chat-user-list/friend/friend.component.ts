// angular import
import { Component, output, input } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-friend',
  imports: [SharedModule],
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss']
})
export class FriendComponent {
  // public props
  friends = input(undefined);
  ChatOn = output();

  // public method
  innerChatToggle() {
    this.ChatOn.emit();
  }
}
