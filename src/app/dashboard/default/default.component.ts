// angular import
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { StorageService } from 'src/app/theme/shared/services/storage.service';
import { UsuarioService } from 'src/app/theme/shared/services/usuario.service';
import { UsuarioDTO } from 'src/app/theme/shared/models/usuario.dto';
import { Calendar } from 'src/app/theme/shared/models/calendar.model';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PessoaService } from 'src/app/theme/shared/services/pessoa.service';
import { CalendarService } from 'src/app/theme/shared/services/calendar.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { FullCalendarModule } from '@fullcalendar/angular';


import {
  CalendarOptions,
  DateSelectArg,
  EventApi,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { formatDate } from '@angular/common';
import moment from 'moment';
import { SharedService } from 'src/app/theme/shared/services/shared.service';
import { nomeIgrejaSignal, igrejaIdSignal, nomeUsuarioSignal, perfilSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
  ],
  providers: [
    CalendarService,
    SharedService],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  // changeDetection: ChangeDetectionStrategy.Default,
})
export class DefaultComponent implements OnInit {

  nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  igrejaIdSignal = igrejaIdSignal;
  nomeUsuarioSignal = nomeUsuarioSignal;
  perfilSignal = perfilSignal;
  setorIdSignal = setorIdSignal;

  nomeIgreja = nomeIgrejaSignal();
  igrejaId = igrejaIdSignal();
  nomeUsuario = nomeUsuarioSignal();
  perfil = perfilSignal();
  setorId = setorIdSignal();

  private destroy$: Subject<void> = new Subject<void>();
  private storage = inject(StorageService);
  private usuarioService = inject(UsuarioService);

  totalMembros: number = 0;
  totalObreiros: number = 0;
  totalCongregados: number = 0;
  totalGeralMembros!: number;

  // calendario

  @ViewChild('calendar', { static: false })

  usuario: UsuarioDTO = new UsuarioDTO();

  perfis0!: string;
  perfis1!: string;
  id!: string;
  error = '';
  calendar: Calendar | null;
  calendarForm: UntypedFormGroup;
  dialogTitle: string;
  filterOptions = 'All';
  calendarData: any;
  isEditClick?: boolean;
  filterItems: string[] = [
    'work',
    'personal',
    'important',
    'travel',
    'friends',
  ];

  calendarEvents!: EventInput[];
  tempEvents?: EventInput[];

  public filters = [
    { name: 'work', value: 'Verde', checked: true },
    { name: 'personal', value: 'Laranja', checked: true },
    { name: 'important', value: 'Azul', checked: true },
    { name: 'travel', value: 'Vermelho', checked: true },
    { name: 'friends', value: 'Azul Claro', checked: true },
  ];

  @ViewChild('callAPIDialog', { static: false })
  callAPIDialog?: TemplateRef<any>;

  @ViewChild('eventWindow')
  eventWindow?: TemplateRef<any>;
  calCheck: any;

  // final calendario

  constructor(
    private pessoaService: PessoaService,
    private fb: UntypedFormBuilder,
    public calendarService: CalendarService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {
    this.dialogTitle = 'Adicionar novo evento';
    const blankObject = {} as Calendar;
    this.calendar = new Calendar(blankObject);
    this.calendarForm = this.createCalendarForm(this.calendar);
  }


  ngOnInit() {
    if (this.igrejaId === 0) {
      // if (!this.storage.getLocalIgreja()) {
      this.getUser();
      // }
    } else {
      // window.location.href="dashboard/default";
      // window.location.reload()
      // this.router.navigate(['/dashboard/default']);

      this.carregarOnInit();
    }
  }

  getUser() {
    const localUser = this.storage.getLocalUser();
    if (localUser.email) {
      const email = localUser.email;
      return this.usuarioService
        .getUsuarioFromEmail(email)
        .subscribe({
          next: (response) => {
            this.usuario = response;

            this.igrejaIdSignal.update(() => this.usuario.igrejaIdHome);
            this.igrejaId = igrejaIdSignal();

            this.carregarOnInit();
     }
        });
    }
  }


  carregarOnInit() {
    this.countMembrosAtivos();
    this.countObreirosAtivos();
    this.countCongregadosAtivos();
    this.getTotalGeralMembros(); // Membros + Obreiros
    this.loadEventos(this.igrejaId);
    this.tempEvents = this.calendarEvents;
    this.calendarOptions.initialEvents = this.calendarEvents;
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterContentChecked() {
    this.getTotalGeralMembros(); // Membros + Obreiros
  }

  getTotalGeralMembros() {
    this.totalGeralMembros = this.totalMembros + this.totalObreiros;
  }

  countMembrosAtivos() {
    const tipoMembro = 'Membro';
    const situacaoCadastral = 'Ativo';
    this.pessoaService
      .countMembrosAtivosFromIgreja(
        this.igrejaId,
        situacaoCadastral,
        tipoMembro
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          response ? (this.totalMembros = response) : 0;
        },
        error: (): void => { },
      });
  }

  countObreirosAtivos() {
    const tipoMembro = 'Obreiro';
    const situacaoCadastral = 'Ativo';
    this.pessoaService
      .countMembrosAtivosFromIgreja(
        this.igrejaId,
        situacaoCadastral,
        tipoMembro
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          response ? (this.totalObreiros = response) : 0;
        },
        error: (): void => { },
      });
  }

  countCongregadosAtivos() {
    const tipoMembro = 'Congregado';
    const situacaoCadastral = 'Ativo';
    this.pessoaService
      .countMembrosAtivosFromIgreja(
        this.igrejaId,
        situacaoCadastral,
        tipoMembro
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          response ? (this.totalCongregados = response) : 0;
        },
        error: (): void => { },
      });
  }

  // Calendario inicio

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'dia',
      list: 'Lista',
      // prev: 'Anterior',
      // next: 'Próximo'
    },
    initialView: 'dayGridMonth',
    handleWindowResize: true,
    locale: 'pt-br',
    weekends: true,
    editable: true,
    droppable: true, // Isso permite que as coisas sejam descartadas/apagadas no calendário
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
  };

  loadEventos(igrejaId: number) {
    this.calendarService
      .getAllCalendars(igrejaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.calendarEvents = response.map((e) => {
            return {
              id: e.id,
              title: e.title,
              className: e.className,
              groupId: e.groupId,
              details: e['details'],
              start: e['dataInicial'],
              end: e['dataFinal'],
              igrejaId: e[igrejaId],
            };
          });
          this.calendarOptions.events = [...this.calendarEvents];
        },
        error: (): void => { },
      });
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.eventWindowCall(selectInfo, 'addEvent');
  }

  //Editar envento
  eventWindowCall(row: any, type: string) {
    if (type === 'editEvent') {
      this.dialogTitle = row.event.title;
      this.isEditClick = true;
      this.calendarForm.setValue({
        id: row.event.id,
        title: row.event.title,
        category: row.event.groupId,
        startDate: moment(row.event.start).format('YYYY-MM-DDTHH:MM'),
        endDate:
          row.event.end == null
            ? moment(row.event.start).format('YYYY-MM-DDTHH:MM')
            : moment(row.event.end).format('YYYY-MM-DDTHH:MM'),
        details: row.event.extendedProps.details,
      });
    } else {
      this.calendarForm.reset();
      this.calendarForm.controls['startDate'].setValue(
        formatDate(new Date(), "yyyy-MM-dd'T'HH:mm", 'en') || ''
      );
      this.calendarForm.controls['endDate'].setValue(
        formatDate(new Date(), "yyyy-MM-dd'T'HH:mm", 'en') || ''
      );
      this.calendarForm.controls['category'].setValue('work');
      this.isEditClick = false;
    }

    this.modalService.open(this.eventWindow, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  //Salva ao inserindo
  saveEvent(form: UntypedFormGroup) {
    this.calendarData = form.value;
    const singleEvent = Object.assign({});
    singleEvent.id = this.calendarData.id;
    singleEvent.title = this.calendarData.title;
    singleEvent['dataInicial'] = this.calendarData.startDate;
    singleEvent['dataFinal'] = this.calendarData.endDate;
    singleEvent.details = this.calendarData.details;
    singleEvent.className = this.getClassNameValue(this.calendarData.category);
    singleEvent.groupId = this.calendarData.category;
    singleEvent.igrejaId = this.igrejaId;
    this.calendarService
      .addCalendar(singleEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.calendarEvents = this.calendarEvents.concat({
            id1: response.body,
            title: this.calendarData.title,
            start: this.calendarData.startDate,
            end: this.calendarData.endDate,
            className: this.getClassNameValue(this.calendarData.category),
            groupId: this.calendarData.category,
            details: this.calendarData.details,
          });
          this.calendarOptions.events = this.calendarEvents;
          this.calendarForm.reset();
          this.modalService.dismissAll();
        },
      });
  }

  eventClick(form: UntypedFormGroup) {
    this.calendarData = form.value;
    this.calendarEvents.forEach((element, index) => {
      if (this.calendarData.id == element.id) {
        this.saveEditEvent(index, this.calendarData);
      }
    }, this);
  }

  saveEditEvent(eventIndex: number, calendarData: any) {
    const calendarEvents = this.calendarEvents.slice();
    const singleEvent = Object.assign({}, calendarEvents[eventIndex]);
    singleEvent.id = calendarData.id;
    singleEvent.title = calendarData.title;
    singleEvent.start = calendarData.startDate;
    singleEvent['dataInicial'] = calendarData.startDate;
    singleEvent.end = calendarData.endDate;
    singleEvent['dataFinal'] = calendarData.endDate;
    singleEvent.className = this.getClassNameValue(calendarData.category);
    singleEvent.groupId = calendarData.category;
    singleEvent['igrejaId'] = this.igrejaId;
    singleEvent['details'] = calendarData.details;
    calendarEvents[eventIndex] = singleEvent;
    this.calendarService
      .updateCalendar(singleEvent)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.actionsForSuccess();
        },
      }),
      (this.calendarEvents = calendarEvents); // reassign the array
    this.calendarOptions.events = calendarEvents;
    this.calendarForm.reset();
    this.modalService.dismissAll();
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.eventWindowCall(clickInfo, 'editEvent');
  }

  handleEvents(events: EventApi[]) {
    // this.currentEvents = events;
  }

  createCalendarForm(calendar: Calendar): UntypedFormGroup {
    return this.fb.group({
      id: [calendar.id],
      title: [calendar.title, [Validators.required]],
      category: [calendar.category],
      startDate: [calendar.startDate, [Validators.required]],
      endDate: [calendar.endDate, [Validators.required]],
      details: [calendar.details],
    });
  }

  excluirEvent(deleteEvent: any): void {
    let modifiedEvents = [...this.calendarEvents];
    const eventIndex = modifiedEvents.findIndex(
      (event) => event.id == deleteEvent.id
    );
    modifiedEvents.splice(eventIndex, 1);
    this.calendarService
      .delete(+deleteEvent['id'])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Exclusão', 'Registro excluido com sucesso!');
          this.calendarOptions.events = this.calendarEvents;
        },
        error: (error) => {
          this.error = error;
          this.showError(error);
        },
      });

    this.calendarEvents = modifiedEvents;
    this.calendarOptions.events = [...this.calendarEvents];
  }

  changeCategory(event: any, filter: any) {
    if (event.target.checked) {
      this.filterItems.push(filter.name);
    } else {
      this.filterItems.splice(this.filterItems.indexOf(filter.name), 1);
    }
    this.filterEvent(this.filterItems);
  }

  filterEvent(element: any) {
    const list = this.calendarEvents.filter((x) =>
      element.map((y: any) => y).includes(x.groupId)
    );
    this.calendarOptions.events = list;
  }

  getClassNameValue(category: string) {
    let className = '';

    if (category === 'work') {
      className = 'fc-event-success';
    } else if (category === 'personal') {
      className = 'fc-event-warning';
    } else if (category === 'important') {
      className = 'fc-event-primary';
    } else if (category === 'travel') {
      className = 'fc-event-danger';
    } else if (category === 'friends') {
      className = 'fc-event-info';
    }

    return className;
  }

  private actionsForSuccess() {
    this.toastr.success('Evento Atualizado com sucesso');
  }

  private showError(error: { message: any }) {
    // this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
  }
  // Calendario Final
}
