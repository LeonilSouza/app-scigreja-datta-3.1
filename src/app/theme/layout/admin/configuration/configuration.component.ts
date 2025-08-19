// angular import
import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';

// project import
import { ThemeConfig } from 'src/app/app-config';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ThemeService } from 'src/app/theme/shared/service1/theme.service';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfigurationComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);
  private themeService = inject(ThemeService);

  // public props
  styleSelectorToggle: boolean; // open configuration menu
  isThemeLayout: string;
  isDarkMode: string; // layout type
  pre_layout: string; // layout type
  rtlLayout: boolean; // rtl type
  headerFixedLayout: boolean; // header fixed flag
  boxLayout: boolean; // box layout flag
  isColoredIcon: boolean; // menu icon color
  headerBackgroundColor: string; // header background color
  navbarBackgroundColor: string; // navbar background color
  brandBackgroundColor: string; // brand/logo background color
  navBackgroundImage: boolean; // navbar background image
  menuDropdownIcon: string; // navbar background image
  menuListIcon: string; // navbar background image
  navActiveColor: string;
  navTitleColor: string;
  menuTitleHide: boolean;
  headerBackColor: string;
  configurationShow: boolean;
  layout6Background: string;
  direction: string = 'ltr';

  // constructor
  constructor() {
    this.setThemeLayout();
  }

  // life cycle event
  ngOnInit() {
    this.styleSelectorToggle = false;
    this.isThemeLayout = ThemeConfig.layout;
    this.isDarkMode = ThemeConfig.isDarkMode;
    this.setLayout(this.isDarkMode);
    this.pre_layout = ThemeConfig.pre_layout;
    this.isColoredIcon = ThemeConfig.isNavIconColor;
    this.changeIconColor(this.isColoredIcon);
    this.headerBackgroundColor = ThemeConfig.headerBackColor;
    this.setHeaderBackground(this.headerBackgroundColor);
    this.navbarBackgroundColor = ThemeConfig.navBackColor;
    this.setNavbarBackground(this.navbarBackgroundColor);
    this.brandBackgroundColor = ThemeConfig.navBrandColor;
    this.setBrandBackground(this.brandBackgroundColor);
    this.navBackgroundImage = ThemeConfig.navBackImage;
    this.setBackgroundImage(this.navBackgroundImage);
    this.rtlLayout = ThemeConfig.isRtlLayout;
    this.changeRtlLayout(this.rtlLayout);
    this.headerFixedLayout = ThemeConfig.isHeaderFixedLayout;
    this.changeHeaderFixedLayout(this.headerFixedLayout);
    this.boxLayout = ThemeConfig.isBoxLayout;
    this.changeBoxLayout(this.boxLayout);
    this.menuDropdownIcon = ThemeConfig.navDropdownIcon;
    this.setMenuDropdownIcon(this.menuDropdownIcon);
    this.menuListIcon = ThemeConfig.navListIcon;
    this.setMenuListIcon(this.menuListIcon);
    this.navActiveColor = ThemeConfig.navActiveListColor;
    this.setNavActiveColor(this.navActiveColor);
    this.navTitleColor = ThemeConfig.navListTitleColor;
    this.setNavTitleColor(this.navTitleColor);
    this.menuTitleHide = ThemeConfig.isNavListTitleHide;
    this.changeMenuTitle(this.menuTitleHide);
    if (ThemeConfig.pre_layout !== '' && ThemeConfig.pre_layout !== null) {
      this.setPreBuildLayout(ThemeConfig.pre_layout);
    }
    this.layout6Background = ThemeConfig.layout_6_Background;
  }

  setThemeLayout() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }

    // different layout
    switch (current_url) {
      case baseHref + '/layout/static':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isNavFixedLayout = false;
        ThemeConfig.isHeaderFixedLayout = false;
        break;
      case baseHref + '/layout/fixed':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isNavFixedLayout = true;
        ThemeConfig.isHeaderFixedLayout = true;
        break;
      case baseHref + '/layout/nav-fixed':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isNavFixedLayout = true;
        ThemeConfig.isHeaderFixedLayout = false;
        break;
      case baseHref + '/layout/collapse-menu':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isCollapseMenu = true;
        break;
      case baseHref + '/layout/horizontal':
        ThemeConfig.layout = 'horizontal';
        break;
      case baseHref + '/layout/box':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isBoxLayout = true;
        ThemeConfig.isCollapseMenu = true;
        break;
      case baseHref + '/layout/rtl':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isRtlLayout = true;
        break;
      case baseHref + '/layout/light':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isDarkMode = 'menu-light';
        break;
      case baseHref + '/layout/dark':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isDarkMode = 'dark';
        ThemeConfig.navBackColor = 'navbar-dark';
        ThemeConfig.navBrandColor = 'brand-dark';
        break;
      case baseHref + '/layout/icon-color':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isDarkMode = 'menu-light';
        ThemeConfig.isNavIconColor = true;
        break;
      case baseHref + '/layout/layout-2':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.pre_layout = 'layout-2';
        break;
      case baseHref + '/layout/layout-2-2':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.pre_layout = 'layout-2-2';
        break;
      case baseHref + '/layout/layout-3':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.pre_layout = 'layout-3';
        break;
      case baseHref + '/layout/layout-4':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.pre_layout = 'layout-4';
        break;
      case baseHref + '/layout/layout-4-2':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.pre_layout = 'layout-4-2';
        break;
      case baseHref + '/layout/layout-5h':
        ThemeConfig.layout = 'horizontal';
        ThemeConfig.isDarkMode = 'menu-light';
        ThemeConfig.isNavIconColor = true;
        ThemeConfig.headerBackColor = 'header-blue';
        break;
      case baseHref + '/layout/nav-color':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.isDarkMode = 'menu-light';
        ThemeConfig.isNavIconColor = true;
        ThemeConfig.headerBackColor = 'header-lightblue';
        ThemeConfig.navBrandColor = 'brand-lightblue';
        ThemeConfig.isNavFixedLayout = true;
        ThemeConfig.isHeaderFixedLayout = true;
        break;
      case baseHref + '/layout/layout-6':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.pre_layout = 'layout-6';
        ThemeConfig.isDarkMode = 'menu-light';
        ThemeConfig.isNavIconColor = true;
        ThemeConfig.navBrandColor = 'brand-lightblue';
        ThemeConfig.isNavFixedLayout = false;
        ThemeConfig.isHeaderFixedLayout = false;
        ThemeConfig.layout_6_Background = '#23b7e5';
        break;
      case baseHref + '/layout/layout-8':
        ThemeConfig.layout = 'vertical';
        ThemeConfig.pre_layout = 'layout-8';
        ThemeConfig.isDarkMode = 'menu-light';
        ThemeConfig.headerBackColor = 'header-lightblue';
        ThemeConfig.navBrandColor = 'brand-lightblue';
        ThemeConfig.isNavFixedLayout = true;
        ThemeConfig.isHeaderFixedLayout = true;
        ThemeConfig.navActiveListColor = 'active-lightblue';
        break;
    }
  }

  setPreBuildLayout(pre_layout: string) {
    if (pre_layout === 'layout-6') {
      document.querySelector('.pcoded-navbar').classList.add('menupos-static');
      this.headerBackColor = ThemeConfig.layout_6_Background;
      this.setHeaderBackColor(this.headerBackColor);
    }

    if (pre_layout !== 'layout-6' && pre_layout !== 'layout-8') {
      this.configurationShow = false;
      document.querySelector('.pcoded-navbar').classList.add(pre_layout);
    } else {
      document.querySelector('body').classList.add(pre_layout);
    }
  }

  setHeaderBackColor(color) {
    this.headerBackColor = color;
    (document.querySelector('body') as HTMLElement).style.background = color;
  }

  // change main layout
  setLayout(layout: string) {
    this.configurationShow = true;
    this.setNavbarBackground(ThemeConfig.navBackColor);
    this.setBrandBackground(ThemeConfig.navBrandColor);
    document.querySelector('.pcoded-navbar').classList.remove('menu-light');
    document.querySelector('.pcoded-navbar').classList.remove('menu-dark');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-dark');
    document.querySelector('.pcoded-navbar').classList.remove('brand-dark');
    document.querySelector('body').classList.remove('datta-dark');
    document.querySelector('html')?.classList.remove('dark');
    this.setHeaderBackground('header-default');

    this.isDarkMode = layout;
    if (layout === 'menu-light') {
      this.setNavbarBackground(this.navbarBackgroundColor);
      this.setBrandBackground(this.brandBackgroundColor);
      document.querySelector('.pcoded-navbar').classList.add(layout);
    }
    if (layout === 'dark') {
      document.querySelector('.pcoded-navbar').classList.add('navbar-dark');
      document.querySelector('.pcoded-navbar').classList.add('brand-dark');
      this.setNavbarBackground('navbar-dark');
      this.setBrandBackground('brand-dark');

      if (ThemeConfig.pre_layout !== 'layout-6') {
        this.setHeaderBackground('header-dark');
      }

      document.querySelector('body').classList.add('datta-dark');
      document.querySelector('html')?.classList.add('dark');
    }
    if (layout === 'reset') {
      this.reset();
    }
    this.themeService.isDarkTheme.set(layout);
  }

  reset() {
    document.querySelector('.pcoded-navbar').classList.remove('icon-colored');
    this.ngOnInit();
  }

  setColoredIcon(e) {
    const flag = !!e.target.checked;
    this.changeIconColor(flag);
  }

  changeIconColor(flag: boolean) {
    if (flag) {
      document.querySelector('.pcoded-navbar').classList.add('icon-colored');
    } else {
      document.querySelector('.pcoded-navbar').classList.remove('icon-colored');
    }
  }

  setRtlLayout(e) {
    const flag = !!e.target.checked;
    this.changeRtlLayout(flag);
  }

  changeRtlLayout(flag: boolean) {
    if (flag) {
      document.querySelector('body').classList.add('datta-rtl');
      this.direction = 'rtl';
    } else {
      document.querySelector('body').classList.remove('datta-rtl');
      this.direction = 'ltr';
    }
    this.themeService.isRtlTheme.set(flag);
  }

  setHeaderFixedLayout(e) {
    const flag = !!e.target.checked;
    this.changeHeaderFixedLayout(flag);
  }

  changeHeaderFixedLayout(flag: boolean) {
    if (flag) {
      document.querySelector('.pcoded-header').classList.add('headerpos-fixed');
      document.querySelector('.pcoded-header').classList.add('header-blue');
    } else {
      document.querySelector('.pcoded-header').classList.remove('headerpos-fixed');
    }
  }

  setBoxLayout(e) {
    const flag = !!e.target.checked;
    this.changeBoxLayout(flag);
  }

  changeBoxLayout(flag: boolean) {
    if (flag) {
      document.querySelector('body').classList.add('container');
      document.querySelector('body').classList.add('box-layout');
    } else {
      document.querySelector('body').classList.remove('box-layout');
      document.querySelector('body').classList.remove('container');
    }
    this.themeService.isBoxTheme.set(flag);
  }

  hideMenuTitle(e) {
    const flag = !!e.target.checked;
    this.changeMenuTitle(flag);
  }

  changeMenuTitle(flag: boolean) {
    if (flag) {
      document.querySelector('.pcoded-navbar').classList.add('caption-hide');
    } else {
      document.querySelector('.pcoded-navbar').classList.remove('caption-hide');
    }
  }

  setHeaderBackground(background: string) {
    this.headerBackgroundColor = background;
    document.querySelector('.pcoded-header').classList.remove('header-blue');
    document.querySelector('.pcoded-header').classList.remove('header-red');
    document.querySelector('.pcoded-header').classList.remove('header-purple');
    document.querySelector('.pcoded-header').classList.remove('header-lightblue');
    document.querySelector('.pcoded-header').classList.remove('header-dark');
    if (background !== 'header-default') {
      document.querySelector('.pcoded-header').classList.add(background);
    }
  }

  setNavbarBackground(background: string) {
    this.setBackgroundImage(ThemeConfig.navBackImage);
    this.navbarBackgroundColor = background;
    document.querySelector('.pcoded-navbar').classList.remove('navbar-blue');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-red');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-purple');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-lightblue');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-dark');

    // add default menu brand background color
    document.querySelector('.pcoded-navbar').classList.add('brand-default');
    if (background !== 'navbar-default') {
      document.querySelector('.pcoded-navbar').classList.add(background);
    }
  }

  setBrandBackground(background: string) {
    this.brandBackgroundColor = background;
    document.querySelector('.pcoded-navbar').classList.remove('brand-default');
    document.querySelector('.pcoded-navbar').classList.remove('brand-blue');
    document.querySelector('.pcoded-navbar').classList.remove('brand-red');
    document.querySelector('.pcoded-navbar').classList.remove('brand-purple');
    document.querySelector('.pcoded-navbar').classList.remove('brand-lightblue');
    document.querySelector('.pcoded-navbar').classList.remove('brand-dark');
    document.querySelector('.pcoded-navbar').classList.add(background);
  }

  setBackgroundImage(image) {
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-1');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-2');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-3');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-4');
    document.querySelector('.pcoded-navbar').classList.remove('navbar-image-5');
    if (image) {
      this.navBackgroundImage = image;
      document.querySelector('.pcoded-navbar').classList.add(image);
    }
  }

  setMenuDropdownIcon(icon: string) {
    document.querySelector('.pcoded-navbar').classList.remove('drp-icon-style1');
    document.querySelector('.pcoded-navbar').classList.remove('drp-icon-style2');
    document.querySelector('.pcoded-navbar').classList.remove('drp-icon-style3');
    if (icon !== 'style1') {
      document.querySelector('.pcoded-navbar').classList.add('drp-icon-' + icon);
    }
  }

  setMenuListIcon(icon) {
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style1');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style2');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style3');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style4');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style5');
    document.querySelector('.pcoded-navbar').classList.remove('menu-item-icon-style6');
    if (icon !== 'style1') {
      document.querySelector('.pcoded-navbar').classList.add('menu-item-icon-' + icon);
    }
  }

  setNavActiveColor(style) {
    this.navActiveColor = style;
    document.querySelector('.pcoded-navbar').classList.remove('active-default');
    document.querySelector('.pcoded-navbar').classList.remove('active-blue');
    document.querySelector('.pcoded-navbar').classList.remove('active-red');
    document.querySelector('.pcoded-navbar').classList.remove('active-purple');
    document.querySelector('.pcoded-navbar').classList.remove('active-lightblue');
    document.querySelector('.pcoded-navbar').classList.remove('active-dark');
    if (style !== 'active-default') {
      document.querySelector('.pcoded-navbar').classList.add(style);
    }
  }

  setNavTitleColor(style) {
    this.navTitleColor = style;
    document.querySelector('.pcoded-navbar').classList.remove('title-default');
    document.querySelector('.pcoded-navbar').classList.remove('title-blue');
    document.querySelector('.pcoded-navbar').classList.remove('title-red');
    document.querySelector('.pcoded-navbar').classList.remove('title-purple');
    document.querySelector('.pcoded-navbar').classList.remove('title-lightblue');
    document.querySelector('.pcoded-navbar').classList.remove('title-dark');
    if (style !== 'title-default') {
      document.querySelector('.pcoded-navbar').classList.add(style);
    }
  }

  /// layout 6 background color list
  layout6BackgroundColorList = [
    {
      value: 'linear-gradient(to right, #04a9f5 0%, #04a9f5 100%)',
      label: 'Blue'
    },
    {
      value: 'linear-gradient(to right, #ff5252 0%, #ff5252 100%)',
      label: 'Red'
    },
    {
      value: 'linear-gradient(to right, #9575CD 0%, #9575CD 100%)',
      label: 'Purple'
    },
    {
      value: 'linear-gradient(to right, #23b7e5 0%, #23b7e5 100%)',
      label: 'light Blue'
    },
    {
      value: 'linear-gradient(to right, #424448 0%, #424448 100%)',
      label: 'Dark'
    },
    {
      value: 'linear-gradient(to right, #1de9b6 0%, #1dc4e9 100%)',
      label: 'Light Green'
    },
    {
      value: 'linear-gradient(to right, #899FD4 0%, #A389D4 100%)',
      label: 'Light Purple'
    },
    {
      value: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
      label: 'Cyan'
    },
    {
      value: 'linear-gradient(to right, #667eea 0%, #764ba2 100%)',
      label: 'Indigo'
    },
    {
      value: 'linear-gradient(to right, #f77062 0%, #fe5196 100%)',
      label: 'Pink'
    },
    {
      value: 'linear-gradient(to right, #9be15d 0%, #00e3ae 100%)',
      label: 'Green'
    },
    {
      value: 'linear-gradient(to right, #b224ef 0%, #7579ff 100%)',
      label: 'Violet'
    },
    {
      value: 'linear-gradient(to right, #0acffe 0%, #495aff 100%)',
      label: 'Blue Violet'
    },
    {
      value: 'linear-gradient(to right, #01a9ac 0%, #01dbdf 100%)',
      label: 'Teal'
    },
    {
      value: 'linear-gradient(to right, #fe5d70 0%, #fe909d 100%)',
      label: 'Salmon'
    },
    {
      value: 'linear-gradient(to right, #0ac282 0%, #0df3a3 100%)',
      label: 'Mint'
    },
    {
      value: 'linear-gradient(to right, #fe9365 0%, #feb798 100%)',
      label: 'Peach'
    },
    {
      value: 'linear-gradient(to right, #A445B2 0%, #D41872 52%, #FF0066 100%)',
      label: 'Magenta'
    }
  ];
}
