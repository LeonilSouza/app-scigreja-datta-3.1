// angular import
import { Component, inject, input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { NavigationItem } from '../../navigation';
import { ThemeConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';

// service
import { AuthenticationService } from 'src/app/theme/shared/services';

// type
import { Role } from 'src/app/theme/shared/_helpers/role';

@Component({
  selector: 'app-nav-item',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements OnInit {
  private location = inject(Location);
  private authenticationService = inject(AuthenticationService);

  // public props
  item = input<NavigationItem>();
  parentRole = input<string[]>();
  themeLayout: string;
  isEnabled: boolean = false;

  // constructor
  constructor() {
    this.themeLayout = ThemeConfig.layout;
  }

  ngOnInit(): void {
    // const CurrentUserRole = this.authenticationService.currentUserValue?.user.role || Role.Admin;
    const item = this.item();
    // const parentRoleValue = this.parentRole();
    // if (item.role && item.role.length > 0) {
    //   if (CurrentUserRole) {
    //     const parentRole = this.parentRole();
    //     const allowedFromParent = item.isMainParent || (parentRole && parentRole.length > 0 && parentRole.includes(CurrentUserRole));
    //     if (allowedFromParent) {
    //       this.isEnabled = item.role.includes(CurrentUserRole);
    //     }
    //   }
    // } else if (parentRoleValue && parentRoleValue.length > 0) {
    //   // If item.role is empty, check parentRole
    //   if (CurrentUserRole) {
    //     this.isEnabled = parentRoleValue.includes(CurrentUserRole);
    //   }
    // }
  }

  // public method
  closeOtherMenu(event: MouseEvent) {
    if (ThemeConfig.layout === 'vertical') {
      const ele = event.target as HTMLElement;
      if (ele !== null && ele !== undefined) {
        const parent = ele.parentElement as HTMLElement;
        const up_parent = ((parent.parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
        const last_parent = (up_parent.parentElement as HTMLElement).parentElement as HTMLElement;
        if (last_parent.classList.contains('pcoded-submenu')) {
          up_parent.classList.remove('pcoded-trigger');
          up_parent.classList.remove('active');
        } else {
          const sections = document.querySelectorAll('.pcoded-hasmenu');
          for (let i = 0; i < sections.length; i++) {
            sections[i].classList.remove('active');
            sections[i].classList.remove('pcoded-trigger');
          }
        }

        if (parent.classList.contains('pcoded-hasmenu')) {
          parent.classList.add('pcoded-trigger');
          parent.classList.add('active');
        } else if (up_parent.classList.contains('pcoded-hasmenu')) {
          up_parent.classList.add('pcoded-trigger');
          up_parent.classList.add('active');
        } else if (last_parent.classList.contains('pcoded-hasmenu')) {
          last_parent.classList.add('pcoded-trigger');
          last_parent.classList.add('active');
        }
      }
      if (document.querySelector('app-navigation.pcoded-navbar').classList.contains('mob-open')) {
        document.querySelector('app-navigation.pcoded-navbar').classList.remove('mob-open');
      }
    } else {
      setTimeout(() => {
        const sections = document.querySelectorAll('.pcoded-hasmenu');
        for (let i = 0; i < sections.length; i++) {
          sections[i].classList.remove('active');
          sections[i].classList.remove('pcoded-trigger');
        }

        let current_url = this.location.path();
        if (this.location['_baseHref']) {
          current_url = this.location['_baseHref'] + this.location.path();
        }
        const link = "a.nav-link[ href='" + current_url + "' ]";
        const ele = document.querySelector(link);
        if (ele !== null && ele !== undefined) {
          const parent = ele.parentElement;
          const up_parent = parent.parentElement.parentElement;
          const last_parent = up_parent.parentElement;
          if (parent.classList.contains('pcoded-hasmenu')) {
            parent.classList.add('active');
          } else if (up_parent.classList.contains('pcoded-hasmenu')) {
            up_parent.classList.add('active');
          } else if (last_parent.classList.contains('pcoded-hasmenu')) {
            last_parent.classList.add('active');
          }
        }
      }, 500);
    }
  }
}
