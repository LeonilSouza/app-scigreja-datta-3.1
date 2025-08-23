import { AfterContentChecked, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { SetorDTO } from 'src/app/models/setor.dto';
import { SetorService } from 'src/app/services/setor.service';
import { GLOBALS } from 'src/app/_helpers/globals';

import Swal from 'sweetalert2';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';


//declare const $: any;

@Component({
    selector: 'app-setor-form',
    templateUrl: './setor-form.component.html',
    styleUrls: ['./setor-form.component.scss'],
    encapsulation: ViewEncapsulation.None //as vezes não deixa aparecer o input da foto
    ,
    standalone: true,
    imports: [NgIf, ButtonModule, RouterLink, FormsModule, ReactiveFormsModule, CardComponent]
})

export class SetorFormComponent implements OnInit, AfterContentChecked {


    error = '';

    setores: SetorDTO[] = [];

    currentAction: string;
    setorForm: FormGroup;
    pageTitle: string;
    submittingForm = false;
    setor: SetorDTO = new SetorDTO();
    id: number;
    setorId: number;
    perfis: number;
    setor_id: number;

    nomeIgreja: string = GLOBALS.nomeIgreja;

    perfil: string = GLOBALS.perfil;

    subscription: Subscription;

    constructor(
        public setorService: SetorService,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService

    ) { }

    ngOnInit(): void {
        this.setCurrentAction();
        this.buildSetorForm();
        this.loadSetor();

    }

    ngAfterContentChecked() {
        this.setPageTitle();
    }

    private setCurrentAction() {
        if (this.route.snapshot.url[0].path == "new")
            this.currentAction = "new"
        else
            this.currentAction = "edit"

    }

    submitForm() {
        this.submittingForm = true;

        if (this.currentAction == "new")
            this.createSetor();
        else // currentAction == "edit"
            this.updateSetor();
    }

    private buildSetorForm() {
        this.setorForm = this.formBuilder.group({
            id: [null],
            nome: [null, [Validators.required]]
        });
    }

    confirmarExclusaoSetor(setor: SetorDTO): void {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir este registro?',
            accept: () => {
                this.excluir(setor);
            }
        });
    }

    excluir(setor: SetorDTO) {
        this.setorService.delete(setor.id)
            .subscribe({
                next: () => {
                    this.router.navigate(['/setores'])
                    Swal.fire('Exclusão', 'Registro excluido com sucesso!', 'success');
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }

    private loadSetor() {
        if (this.currentAction == "edit") {
            const params: Observable<Params> = this.route.params
            params.subscribe(urlParams => {
                this.id = urlParams['id'];
                this.setorId = urlParams['id'];
                this.setorService
                    .findById(this.id)
                    .subscribe({
                        next: (response) => {
                            this.setor = response;
                            this.setorForm.patchValue(this.setor)   // binds loaded setor data to setorForm
                        },
                        error: (error) => {
                            this.error = error;
                            this.showError(error)
                        }
                    });
            })

        }
    }

    private setPageTitle() {
        if (this.currentAction == 'new')
            this.pageTitle = "Novo setor"
        else {
            const setorName = this.setor.nome || ""
            this.pageTitle = 'Editando Setor |  '+setorName;
        }
    }

    public createSetor() {
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.igrejaForm.controls.nome.setValue(this.igrejaForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta.
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/

        //ESTE PARA PRIMEIRA MAIUSCULAS
        // ESTE PARA DEIXAR TUDO EM CAIXA ALTA
        // this.igrejaForm.controls.nome.setValue(this.igrejaForm.controls.nome.value.toUpperCase()); /* Aqui que real mente coloca em caixa alta.
        // Poque se o teclado estiver com o caps desl. grava miniscula  RsRS*/
        //ESTE PARA PRIMEIRA MAIUSCULAS
        this.setorForm.controls['nome'].setValue(this.formataNome(this.setorForm.controls['nome'].value)); // Aqui formata o nome completo
        const setor: SetorDTO = this.setorForm.value;
        this.setorService.create(setor)
            .subscribe({
                next: (setor) => {
                    this.id = parseInt(this.extractId(setor.headers.get('location'))); // Extrai o Id da URI retornada do banco
                    this.setor.id = this.id;
                    Swal.fire('Cadastro', 'Setor cadastrado com sucesso', 'success');
                    this.actionsForSuccess()
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }

    public updateSetor() {
        const setor: SetorDTO = Object.assign(new SetorDTO(), this.setorForm.value);
        this.setorService.update(setor)
            .subscribe({
                next: () => {
                    Swal.fire('Atualização', 'Setor Atualizado com sucesso', 'success');
                    this.actionsForSuccess()
                },
                error: (error) => {
                    this.error = error;
                    this.showError(error)
                }
            });
    }

    // METODOS PRIVADOS


    private actionsForSuccess() {
        const path: string = this.route.snapshot.parent.url[0].path;
        this.router.navigateByUrl(path)
    }

    private showError(error) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message });
        this.submittingForm = false;
    }

    formataNome(nome: string) {
        return nome.toLowerCase().replace(/(?:^|\s)(?!da|de|do)\S/g, l => l.toUpperCase());
    }

    private extractId(location: string): string { // Extrai o Id da URL
        const position = location.lastIndexOf('/');
        return location.substring(position + 1, location.length);
    }

}
