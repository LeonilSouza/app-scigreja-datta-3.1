// angular import
import { Component, inject, input, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// project import
import { NavigationItem } from '../../navigation';
import { ThemeConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavItemComponent } from '../nav-item/nav-item.component';

// service
import { AuthenticationService } from 'src/app/theme/shared/services';
// type
import { Role } from 'src/app/theme/shared/_helpers/role';


@Component({
  selector: 'app-nav-collapse',
  imports: [SharedModule, NavItemComponent, RouterModule, CommonModule],
  templateUrl: './nav-collapse.component.html',
  styleUrls: ['./nav-collapse.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', display: 'block' }),
        animate('250ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [animate('250ms ease-in', style({ transform: 'translateY(-100%)' }))])
    ])
  ]
})
export class NavCollapseComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);

  // public props
  item = input<NavigationItem>();
  parentRole = input<string[]>();
  visible = false;
  config = ThemeConfig;
  themeLayout = ThemeConfig.layout;
  isEnabled: boolean = false;

  ngOnInit() {
    // const currentUserRole = this.authenticationService.currentUserValue?.user.role || Role.Admin;
    // const parentRoleValue = this.parentRole();
    const item = this.item();
    // if (item.role && item.role.length > 0) {
    //   if (currentUserRole) {
    //     const parentRole = this.parentRole();
    //     const allowedFromParent = item.isMainParent || (parentRole && parentRole.length > 0 && parentRole.includes(currentUserRole));
    //     if (allowedFromParent) {
    //       this.isEnabled = item.role.includes(currentUserRole);
    //     }
    //   }
    // } else if (parentRoleValue && parentRoleValue.length > 0) {
    //   // If item.role is empty, check parentRole
    //   if (currentUserRole) {
    //     this.isEnabled = parentRoleValue.includes(currentUserRole);
    //   }
    // }
  }

  // public method
  navCollapse(e: MouseEvent) {
    this.visible = !this.visible;
    let parent = e.target as HTMLElement;

    if (parent?.tagName === 'SPAN') {
      parent = parent.parentElement!;
    }

    if (this.themeLayout === 'vertical') {
      parent = (parent as HTMLElement).parentElement as HTMLElement;
    }

    const sections = document.querySelectorAll('.pcoded-hasmenu');
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] !== parent) {
        sections[i].classList.remove('pcoded-trigger');
      }
    }

    let first_parent = parent.parentElement;
    let pre_parent = ((parent as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
    if (first_parent.classList.contains('pcoded-hasmenu')) {
      do {
        first_parent.classList.add('pcoded-trigger');
        first_parent = ((first_parent as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      } while (first_parent.classList.contains('pcoded-hasmenu'));
    } else if (pre_parent.classList.contains('pcoded-submenu')) {
      do {
        pre_parent.parentElement.classList.add('pcoded-trigger');
        pre_parent = (((pre_parent as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement).parentElement as HTMLElement;
      } while (pre_parent.classList.contains('pcoded-submenu'));
    }
    parent.classList.toggle('pcoded-trigger');
  }
}
