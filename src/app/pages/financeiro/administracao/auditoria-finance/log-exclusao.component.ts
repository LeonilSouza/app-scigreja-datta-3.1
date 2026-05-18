import { Component, OnInit } from '@angular/core';
import { LogExclusaoService } from 'src/app/theme/shared/services/log-exclusao.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-log-exclusao',
  templateUrl: './log-exclusao.component.html',
  standalone: true,
    imports: [
      ButtonModule,
      SharedModule,
    ],
    providers: [
    ]
})
export class LogExclusaoComponent implements OnInit {

  logs: any[] = [];

  constructor(private logService: LogExclusaoService) { }

  ngOnInit(): void {
    this.logService.listarLogs().subscribe({
      next: (dados) => this.logs = dados,
      error: (err) => console.error('Erro ao carregar logs de auditoria:', err)
    });
  }
}