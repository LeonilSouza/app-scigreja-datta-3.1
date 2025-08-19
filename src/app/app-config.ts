export class ThemeConfig {
  static layout = 'vertical'; // vertical, Horizontal
  static pre_layout: string = null; // null, layout-2, layout-2-2, layout-3, layout-4, layout-4-2, layout-6, layout-8
  static isCollapseMenu = false; // true, false
  static isDarkMode = 'menu-light'; // menu-dark, menu-light, dark,
  static isNavIconColor = true; // true, false
  static headerBackColor = 'header-dark'; // header-default, header-blue, header-red, header-purple, header-lightblue, header-dark
  static navBackColor = 'navbar-default'; // navbar-default, navbar-blue, navbar-red, navbar-purple, navbar-lightblue, navbar-dark
  static navBrandColor = 'brand-default'; // brand-default, brand-blue, brand-red, brand-purple, brand-lightblue, brand-dark
  static navBackImage = false; // false, navbar-image-1, navbar-image-2, navbar-image-3, navbar-image-4, navbar-image-5
  static isRtlLayout = false; // false, true
  static isNavFixedLayout = true; // false, true
  static isHeaderFixedLayout = true; // false, true
  static isBoxLayout = false; // false, true
  static navDropdownIcon = 'style1'; // style1, style2, style3
  static navListIcon = 'style3'; // style1, style2, style3, style4, style5, style6
  static navActiveListColor = 'active-default'; // active-default, active-blue, active-red, active-purple, active-lightblue, active-dark
  static navListTitleColor = 'title-blue'; // title-default, title-blue, title-red, title-purple, title-lightblue, title-dark
  static isNavListTitleHide = false; // false, true
  static layout_6_Background = 'linear-gradient(to right, #ffffffff 0%, #04a9f5 100%)'; // used only for pre-layout = layout-6
  static i18n = 'en'; // en, fr, ro, cn
}

export const API_CONFIG = {
  // baseUrl: "https://api-scigreja-4fbe1bc9e551.herokuapp.com" 
  baseUrl: "http://localhost:8080"
}

export let GLOBALS: any = {
  igrejaId: 0,
  setorId: 0,
  nomeIgreja: 'Assembleia de Deus',
  nomeUsuario: '',
  imageUrl: "",
  perfil: ''
};

export const STORAGE_KEYS = {
  localToken: "localToken",
  localUser: "localUser",
  localIgreja: "localIgreja"
}