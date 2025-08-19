export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: NavigationItem[];
  role?: string[];
  disabled?: boolean;
  isMainParent?: boolean; // specify if item is main parent
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'group-departamento',
    title: 'Departamentos',
    type: 'group',
    icon: 'feather icon-monitor',

    children: [
      // Secretaria inicio
      {
        id: 'agenda',
        title: 'Painel | Agenda',
        type: 'item',
        icon: 'feather icon-calendar',
        url: '/dashboard/default',
        breadcrumbs: true,
      },
      {
        id: 'secretaria',
        title: 'Secretaria',
        type: 'collapse',
        icon: 'feather icon-server',

        children: [
          {
            id: 'secretaria-pessoa',
            title: 'Membros',
            type: 'item',
            url: '/pessoas',
            breadcrumbs: true,
          },
          {
            id: 'secretaria-carta',
            title: 'Cartas',
            type: 'item',
            url: '/cartas',
            breadcrumbs: true,
          },
          {
            id: 'secretaria-tratamento-caso',
            title: 'Tratamento de caso',
            type: 'item',
            url: '/casos',
            breadcrumbs: true,
          },
          {
            id: 'secretaria-escala',
            title: 'Escalas',
            type: 'collapse',

            children: [
              {
                id: 'secretaria-obreiro',
                title: 'Obreiros',
                type: 'item',
                url: '/obreiros',
                breadcrumbs: true,
              },
              {
                id: 'secretaria-professor',
                title: 'Professores',
                type: 'item',
                url: '/professores',
              },
              {
                id: 'secretaria-regencia',
                title: 'Regência',
                type: 'item',
                url: '/regencias',
              },
            ],
          },
          {
            id: 'secretaria-batismo',
            title: 'Batismo',
            type: 'item',
            url: '/batismos',
            breadcrumbs: true,
          },
          {
            id: 'secretaria-ambiente',
            title: 'ambiente',
            type: 'collapse',

            children: [
              {
                id: 'secretaria-reserva',
                title: 'Reservas',
                type: 'item',
                url: '/reservas',
              },
            ],
          },
          {
            id: 'secretaria-reuniao',
            title: 'Reunião',
            type: 'item',
            url: '/reunioes',
            breadcrumbs: true,
          },
        ],
      },
      //Secretaria fim

      // Inicio EBD
      {
        id: 'ebd-menu',
        title: 'Escola Dominical',
        type: 'collapse',
        icon: 'feather icon-book',

        children: [
          {
            id: 'ebd-lancamento',
            title: 'Lançamentos',
            type: 'item',
            url: '/lancamentosssss',
          },

          {
            id: 'ebd-matricula-aluno',
            title: 'Matrícula alunos',
            type: 'item',
            url: '/alunos',
          },
          {
            id: 'ebd-matricula-professor',
            title: 'Matrícula professores',
            type: 'item',
            url: '/professores',
          },
          {
            id: 'ebd-matricula-classe',
            title: 'Classes',
            type: 'item',
            url: '/classes',
          },
        ],
      },

      // Ebd fim

      // Cadastro-Inicio
      {
        id: 'cadastro',
        title: 'Cadastro',
        type: 'collapse',
        icon: 'feather icon-layers ',

        children: [
          {
            id: 'cadastro-igrejas',
            title: 'Igrejas',
            type: 'item',
            url: '/igrejas',
            breadcrumbs: true,
          },
          {
            id: 'cadastro-titulo-min',
            title: 'Título Ministerial',
            type: 'item',
            url: '/titulos',
            breadcrumbs: true,
          },
          {
            id: 'cadastro-modelo-documento',
            title: 'Modelo Documento',
            type: 'item',
            url: '/modelodocumentos',
            breadcrumbs: true,
          },
          {
            id: 'cadastro-disciplina',
            title: 'Disciplina',
            type: 'item',
            url: '/disciplinas',
            breadcrumbs: true,
          },
          {
            id: 'cadastro-cargo',
            title: 'Cargos',
            type: 'item',
            url: '/cargos',
            breadcrumbs: true,
          },
          {
            id: 'cargo-departamento',
            title: 'Cargos depto',
            type: 'item',
            url: '/cargodeptos',
            breadcrumbs: true,
          },
          {
            id: 'cadastro-usuario', // Só aparece para Adimin fora desta lista
            title: 'Cadastro de Usuarios',
            type: 'item',
            url: '/usuarios',
            hidden: true,
            breadcrumbs: true,
          },
          {
            id: 'cadastro-setores', // Só aparece para Adimin fora desta lista
            title: 'Cadastro de Setores',
            type: 'item',
            url: '/setores',
            hidden: true,
            breadcrumbs: true,
          },
          {
            id: 'cadastro-variaveis', // Só aparece para Adimin fora desta lista
            title: 'Cadastro de Variáveis',
            type: 'item',
            url: '/variaveis',
            hidden: true,
            breadcrumbs: true,
          },
        ],
      },
      // Cadastro-Fim
      {
        id: 'patrimonio',
        title: 'Patrimônio',
        type: 'group',
        icon: 'feather icon-layout',

        children: [
          {
            id: 'bens',
            title: 'Bens',
            type: 'collapse',
            icon: 'feather icon-file-text',
            children: [
              {
                id: 'consumo',
                title: 'Consumo',
                type: 'item',
                url: 'javascript:',
              },
              {
                id: 'outos',
                title: 'Outros',
                type: 'item',
                url: 'javascript:',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ui-element',
    title: 'UI ELEMENT',
    type: 'group',
    icon: 'icon-ui',

    children: [
      {
        id: 'basic',
        title: 'Basic',
        type: 'collapse',
        icon: 'feather icon-box',

        children: [
          {
            id: 'cards',
            title: 'Cards',
            type: 'item',
            url: '/basic/cards',
          },
          {
            id: 'collapse',
            title: 'Collapse',
            type: 'item',
            url: '/basic/collapse',
          },
          {
            id: 'other',
            title: 'Other',
            type: 'item',
            url: '/basic/other',
          },
          {
            id: 'horizontal',
            title: 'Horizontal',
            type: 'item',
            url: '/layout/horizontal',
            target: true,
          },
          {
            id: 'box-layout',
            title: 'Box Layout',
            type: 'item',
            url: '/layout/box',
            target: true,
          },
          {
            id: 'feather',
            title: 'Feather',
            type: 'item',
            url: 'https://feathericons.com/',
            target: true,
            external: true,
          },
          {
            id: 'form-baisc',
            title: 'Form Basic',
            type: 'item',
            url: '/forms/basic',
          },
          {
            id: 'frm-layout',
            title: 'Layouts',
            type: 'item',
            url: '/layout/layout',
          },
          {
            id: 'frm-multiColumn',
            title: 'MultiColumn',
            type: 'item',
            url: '/layout/multiColumn',
          },
          {
            id: 'documentation',
            title: 'Documentation',
            type: 'item',
            icon: 'feather icon-book',
            classes: 'nav-item',
            url: 'https://codedthemes.gitbook.io/datta-angular/',
            target: true,
            external: true,
          },
        ],
      },
    ],
  },
];
