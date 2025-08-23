import { AfterContentChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { GLOBALS } from 'src/app/_helpers/globals';
import { Observable, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { VariavelDTO } from 'src/app/models/variavel.dto';
import { VariavelService } from 'src/app/services/variavel.service';
import { ButtonModule } from 'primeng/button';

//declare const $: any;

@Component({
    selector: 'app-variavel-form',
    templateUrl: './variavel-form.component.html',
    styleUrls: ['./variavel-form.component.scss'],
    standalone: true,
    imports: [
        ButtonModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
    ],
})

export class VariavelFormComponent implements OnInit, AfterContentChecked, OnDestroy {

    subscription: Subscription;

    nomeIgreja: string = GLOBALS.nomeIgreja;

    /*  Referente a VariavelDTO */
    currentAction: string;
    variavelForm: FormGroup;
    pageTitle: string;
    serverErrorMessages: string[] = null;
    submittingForm: boolean = false;

    variavel: VariavelDTO = new VariavelDTO();
    id: number;

    constructor(
        private route: ActivatedRoute,

        private router: Router,
        private formBuilder: FormBuilder,
        private variavelService: VariavelService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        public translate: TranslateService,
        public primeNGConfig: PrimeNGConfig,
        private toastr: ToastrService,

    ) {}

    ngOnInit(): void {
        this.setCurrentAction();
        this.buildVariavelForm();
        this.loadVariavel();

    }

    ngAfterContentChecked() {
        this.setPageTitle();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public setCurrentAction() {
        if (this.route.snapshot.url[0].path == "new") {
            this.currentAction = "new"
        } else
            this.currentAction = "edit"
    }

    submitForm() {
        this.submittingForm = true;
        if (this.currentAction == "new")
            this.createVariavel();
        else // currentAction == "edit"
            this.updateVariavel();
    }

    private buildVariavelForm() {
        this.variavelForm = this.formBuilder.group({
            id: [null],
            variavel: [null],
            nome: [null],
            local: [null]
        });
    }

    // EVENTOS DO NGX-SELECT-EX

    private loadVariavel() { // Obs->> Aqui é que deve ser ser carregado os dados para o buildForm pegando classes individualizadas
        if (this.currentAction == "edit") {
            let params: Observable<Params> = this.route.params
            params.subscribe(urlParams => {
                this.id = urlParams['id'];

                this.variavelService.findById(this.id)
                    .subscribe({
                        next: (response) => {
                            this.variavel = response;
                            this.variavelForm.patchValue(this.variavel)   // binds loaded variavel data to variavelForm
                        },
                        error: () => this.showError()
                    })
            })
        }
    }

    private setPageTitle() {
        if (this.currentAction == 'new')
            this.pageTitle = "Nova Variável"
        else {
            const variavel = this.variavel.variavel || ""
            this.pageTitle = "Editando:  " + variavel;
        }
    }

    public createVariavel() {
        
        // this.variavelForm.controls['nome'].setValue(this.formataNome(this.variavelForm.controls['nome'].value)); // Aqui formata o nome completo
        const variavel: VariavelDTO = this.variavelForm.value;
        this.variavelService.create(variavel)
            .subscribe(
                variavel => {
                    this.id = parseInt(this.extractId(variavel.headers.get('location'))); // Extrai o Id da URI retornada do banco
                    this.variavel.id = this.id;
                    this.actionsForSuccess(this.variavel)

                    this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro salvo com sucesso!' });

                },
                error => this.actionsForError(error)
            )
    }

    public updateVariavel() {
        const variavel: VariavelDTO = Object.assign(new VariavelDTO(), this.variavelForm.value);

        this.variavelService.update(variavel)
            .subscribe({
                next: (response) => {
                    this.actionsForSuccess(response)
                    // this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro atualizado com sucesso!' });
                    Swal.fire('Atualização', 'Registro atualizado com sucesso', 'success');

                },
                error: error => this.actionsForError(error)
            })
    }



    // METODOS PRIVADOS

    confirmarExclusaoVariavel(variavel: VariavelDTO): void {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir este registro?',
            accept: () => {
                this.excluir(variavel);
            }
        });
    }

    excluir(variavel: VariavelDTO) {
        this.variavelService.delete(variavel.id)
            .subscribe(() => {
                this.router.navigate(['/variaveis'])
                this.messageService.add({ severity: 'success', summary: 'Successo', detail: 'Registro excluido com sucesso!' });
            },
                () => { });
    }

    private actionsForSuccess(variavel: VariavelDTO) {
        const path: string = this.route.snapshot.parent.url[0].path;

        // redirect/reload component page  
        this.router.navigateByUrl(path, { skipLocationChange: true }).then(
            () => this.router.navigate([path, variavel.id, 'edit']))
    }


    private actionsForError(error) {
        this.submittingForm = false;

        if (error.status === 422) {
            this.serverErrorMessages = JSON.parse(error._body).errors;
        } else if (error.status == 403) {
            this.router.navigate(['login/signin'])

        } else {
            this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, teste mais tarde."]
        }
    }

    private extractId(location: string): string { // Extrai o Id da URL
        let position = location.lastIndexOf('/');
        return location.substring(position + 1, location.length);
    }

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro no servidor tente mais tarde' });
    }

    // Biblioteca Terceiros
}
