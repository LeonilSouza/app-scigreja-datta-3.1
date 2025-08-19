// angular import
import { AfterViewInit, Component, ElementRef, effect, inject, viewChild, output, OnInit } from '@angular/core';
import { Location } from '@angular/common';

// project import
import { environment } from 'src/environments/environment';
import { ThemeConfig } from 'src/app/app-config';
import { NavigationItem, NavigationItems } from '../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ScrollbarComponent } from 'src/app/theme/shared/components/scrollbar/scrollbar.component';
import { NavGroupComponent } from './nav-group/nav-group.component';

// service


//role
import { Role } from 'src/app/theme/shared/_helpers/role';
import { ThemeService } from 'src/app/theme/shared/service1/theme.service';
import { AuthenticationService } from 'src/app/theme/shared/services';

@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, NavGroupComponent, ScrollbarComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit, AfterViewInit {
  private location = inject(Location);
  private themeService = inject(ThemeService);
  authenticationService = inject(AuthenticationService);

  // public method
  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  config = ThemeConfig;
  navigation!: NavigationItem[];
  prevDisabled = 'disabled';
  nextDisabled = '';
  contentWidth = 0;
  wrapperWidth: number;
  scrollWidth = 0;
  windowWidth = window.innerWidth;
  direction: string = 'ltr';

  readonly NavCollapsedMob = output();
  readonly navbarContent = viewChild<ElementRef>('navbarContent');
  readonly navbarWrapper = viewChild<ElementRef>('navbarWrapper');

  // constructor
  constructor() {
    this.navigation = NavigationItems;
    effect(() => {
      this.rerenderChartOnDirectionChange(this.themeService.isRtlTheme());
    });
  }

  ngOnInit(): void {
  }

  roleBaseFilterMenu(NavigationItems: NavigationItem[], userRoles: string[], parentRoles: string[] = [Role.Admin]): NavigationItem[] {
    return NavigationItems.map((item) => {
      // If item doesn't have a specific role, inherit roles from parent
      const itemRoles = item.role ? item.role : parentRoles;

      // If item has children, recursively filter them, passing current item's roles as parentRoles
      if (item.children) {
        item.children = this.roleBaseFilterMenu(item.children, userRoles, itemRoles);
      }

      return item; // Return the item whether it is visible or disabled
    });
  }

  // private method
  private rerenderChartOnDirectionChange(isRtl: boolean) {
    this.direction = isRtl === true ? 'rtl' : 'ltr';
  }

  ngAfterViewInit() {
    if (ThemeConfig.layout === 'horizontal') {
      this.contentWidth = this.navbarContent().nativeElement.clientWidth;
      this.wrapperWidth = this.navbarWrapper().nativeElement.clientWidth;
    }
  }

  // public method
  scrollPlus() {
    this.scrollWidth = this.scrollWidth + (this.wrapperWidth - 80);
    if (this.scrollWidth > this.contentWidth - this.wrapperWidth) {
      this.scrollWidth = this.contentWidth - this.wrapperWidth + 80;
      this.nextDisabled = 'disabled';
    }
    this.prevDisabled = '';
    (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
  }

  scrollMinus() {
    this.scrollWidth = this.scrollWidth - this.wrapperWidth;
    if (this.scrollWidth < 0) {
      this.scrollWidth = 0;
      this.prevDisabled = 'disabled';
    }
    this.nextDisabled = '';
    (document.querySelector('#side-nav-horizontal') as HTMLElement).style.marginLeft = '-' + this.scrollWidth + 'px';
  }

  fireLeave() {
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
  }

  fireOutClick() {
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
        if (ThemeConfig.layout === 'vertical') {
          parent.classList.add('pcoded-trigger');
        }
        parent.classList.add('active');
      } else if (up_parent.classList.contains('pcoded-hasmenu')) {
        if (ThemeConfig.layout === 'vertical') {
          up_parent.classList.add('pcoded-trigger');
        }
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('pcoded-hasmenu')) {
        if (ThemeConfig.layout === 'vertical') {
          last_parent.classList.add('pcoded-trigger');
        }
        last_parent.classList.add('active');
      }
    }
  }
}
